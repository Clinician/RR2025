using AVFoundation;
using CoreFoundation;
using CoreMedia;
using CoreVideo;
using Foundation;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RivaDigitalApp.iOS
{

    public class RealTimeProcessingCamera : ICamera
    {
        private TaskCompletionSource<object> recordingTask;
        private CancellationToken externalCancellationToken;
        private AVCaptureSession session;
        private RealTimePPGSignalsProcessor ppgSignalsProcessor;
        private DispatchQueue dispatchQueue;

        public bool IsCameraSupported()
        {
            return true;
        }

        public bool IsFullHardwareSupported()
        {
            return true;
        }

        public IPPGSignalsCollector PpgSignalsCollector { get; private set; }

        public Task StartRecordingAsync(CancellationToken cancellationToken)
        {
            this.externalCancellationToken = cancellationToken;
            this.externalCancellationToken.Register(OnCancelRequested);

            EnsureRecordingTask();

            if (!SetupCaptureSession())
            {
                FinalizeRecordingTask(new Exception("Can not initialize recording"));
            }

            if (recordingTask != null)
            {
                return recordingTask.Task;
            }

            return Task.FromException(new Exception("Can not initialize recording"));
        }

        public CameraSettings CameraSettings { get; } = new CameraSettings(
            frameRate: 60,
            frameWidth: 1280,
            frameHeight: 720,
            duration: TimeSpan.FromSeconds(30));

        private void EnsureRecordingTask()
        {
            if (recordingTask != null)
            {
                FinalizeRecordingTask();
            }

            recordingTask = new TaskCompletionSource<object>();
        }

        private bool SetupCaptureSession()
        {
            session = new AVCaptureSession();

            AVCaptureDevice captureDevice = GetCaptureDevice();
            if (captureDevice == null)
            {
                Console.WriteLine("No captureDevice - this won't work on the simulator, try a physical device");
                return false;
            }

            var input = AVCaptureDeviceInput.FromDevice(captureDevice);
            if (input == null)
            {
                Console.WriteLine("No input - this won't work on the simulator, try a physical device");
                return false;
            }

            session.AddInput(input);
            captureDevice.LockForConfiguration(out var error);
            if (error != null)
            {
                Console.WriteLine(error);
                captureDevice.UnlockForConfiguration();
                return false;
            }

            //captureDevice.TorchMode = AVCaptureTorchMode.On;
            (var activeFormat, var frameRate, var frameWidth, var frameHeight) = GetCaptureDeviceFormat(captureDevice);

            captureDevice.ActiveFormat = activeFormat;
            var cmTime = new CMTime(10, frameRate * 10);

            captureDevice.ActiveVideoMinFrameDuration = cmTime;
            captureDevice.ActiveVideoMaxFrameDuration = cmTime;

            captureDevice.UnlockForConfiguration();

            var bufferAttr = new CVPixelBufferAttributes
            {
                PixelFormatType = CVPixelFormatType.CV420YpCbCr8BiPlanarFullRange,
            };

            using (var output = new AVCaptureVideoDataOutput { WeakVideoSettings = bufferAttr.Dictionary })
            {
                dispatchQueue = new DispatchQueue("myQueue");
                PpgSignalsCollector = PPGSignalsCollector.CreateiOsCollector(frameWidth, frameHeight);
                ppgSignalsProcessor = new RealTimePPGSignalsProcessor(PpgSignalsCollector);
                output.SetSampleBufferDelegateQueue(ppgSignalsProcessor, dispatchQueue);
                session.AddOutput(output);
            }

            session.StartRunning();

            session.BeginConfiguration();
            captureDevice.LockForConfiguration(out var nSError);
            if (nSError != null)
            {
                Console.WriteLine(nSError);
                captureDevice.UnlockForConfiguration();
                return false;
            }

            if (captureDevice.TorchAvailable)
            {
                captureDevice.TorchMode = AVCaptureTorchMode.On;
            }

            if (captureDevice.FlashAvailable)
            {
                captureDevice.FlashMode = AVCaptureFlashMode.On;
            }

            captureDevice.UnlockForConfiguration();
            session.CommitConfiguration();
            Task.Delay(CameraSettings.Duration).ContinueWith((t) =>
            {
                FinalizeRecordingTask();
            }, externalCancellationToken);

            return true;
        }

        private static AVCaptureDevice GetCaptureDevice()
        {
            //Telephoto camera is closer to flashlight, try to use it.
            AVCaptureDevice device = AVCaptureDevice.GetDefaultDevice(AVCaptureDeviceType.BuiltInTelephotoCamera, AVMediaType.Video, AVCaptureDevicePosition.Back);
            if (device == null)
            {
                //Otherwise try to use back camera.
                device = AVCaptureDevice.DevicesWithMediaType(AVMediaType.Video).FirstOrDefault(d => d.Position == AVCaptureDevicePosition.Back);
            }
            return device;
        }

        private (AVCaptureDeviceFormat Format, int FrameRate, int FrameWdith, int FrameHeight) GetCaptureDeviceFormat(AVCaptureDevice captureDevice)
        {
            var formats = captureDevice.Formats
                .Where(f => f.FormatDescription.MediaSubType == (uint)CVPixelFormatType.CV420YpCbCr8BiPlanarFullRange)
                .Select(PrepareInfo)
                .ToList();

            var matched = formats
                .Where(x =>
                    x.FrameRate >= CameraSettings.FrameRate &&
                    x.FrameWidth >= CameraSettings.FrameWidth &&
                    x.FrameWidth >= CameraSettings.FrameHeight)
                .OrderBy(x => x.FrameWidth * x.FrameHeight)
                .ThenBy(x => x.FrameRate)
                .ToList();
            return matched.First();

            (AVCaptureDeviceFormat Format, int FrameRate, int FrameWidth, int FrameHeight) PrepareInfo(AVCaptureDeviceFormat format)
            {
                var videoDimensions = ((CMVideoFormatDescription)format.FormatDescription).Dimensions;
                return (format, (int) format.VideoSupportedFrameRateRanges.First().MaxFrameRate, videoDimensions.Width, videoDimensions.Height);
            }
        }

        #region Release resources

        // FinalizeRecordingTask can be called in separate threads,
        // so we have to sync these threads to make it safe.
        private readonly SemaphoreSlim semaphoreFinalize = new SemaphoreSlim(1, 1);

        private async void FinalizeRecordingTask()
        {
            await semaphoreFinalize.WaitAsync();

            try
            {
                session?.StopRunning();

                if (ppgSignalsProcessor != null)
                {
                    await ppgSignalsProcessor.ProcessingToCompletionAsync();

                    if (ppgSignalsProcessor != null)
                    {
                        ppgSignalsProcessor.Dispose();
                        ppgSignalsProcessor = null;
                    }
                }

                if (recordingTask != null && !recordingTask.Task.IsCompleted)
                {
                    recordingTask.SetResult(true);
                }
                recordingTask = null;

                FreeResources();
            }
            finally
            {
                semaphoreFinalize.Release();
            }
        }

        private void FinalizeRecordingTask(Exception e)
        {
            semaphoreFinalize.Wait();

            try
            {
                session?.StopRunning();

                if (ppgSignalsProcessor != null)
                {
                    ppgSignalsProcessor.TerminateProcessing();
                    ppgSignalsProcessor.Dispose();
                    ppgSignalsProcessor = null;
                }

                if (recordingTask != null && !recordingTask.Task.IsCompleted)
                {
                    recordingTask.SetException(e);
                }
                recordingTask = null;

                FreeResources();
            }
            finally
            {
                semaphoreFinalize.Release();
            }
        }

        private void OnCancelRequested()
        {
            FinalizeRecordingTask(new Exception("Operation canceled"));
        }

        private void FreeResources()
        {
            if (session != null)
            {
                session.Dispose();
                session = null;
            }

            if (dispatchQueue != null)
            {
                dispatchQueue.Dispose();
                dispatchQueue = null;
            }
        }

        #endregion
    }
}