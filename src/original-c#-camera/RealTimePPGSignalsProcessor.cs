using AVFoundation;
using CoreMedia;
using CoreVideo;
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace RivaDigitalApp.iOS
{
    public class RealTimePPGSignalsProcessor : AVCaptureVideoDataOutputSampleBufferDelegate
    {
        private readonly PPGSignalsProcessor _ppgSignalsProcessor;
        private readonly ConcurrentStack<Frame> _freeFrames = new ConcurrentStack<Frame>();

        public RealTimePPGSignalsProcessor(IPPGSignalsCollector ppgSignalsCollector)
        {
            _ppgSignalsProcessor = new PPGSignalsProcessor(ppgSignalsCollector, _freeFrames);
        }

        public void TerminateProcessing()
        {
            _ppgSignalsProcessor.TerminateProcessing();
        }

        public Task ProcessingToCompletionAsync()
        {
            return _ppgSignalsProcessor.ProcessingToCompletionAsync();
        }

        public override void DidOutputSampleBuffer(AVCaptureOutput captureOutput, CMSampleBuffer sampleBuffer, AVCaptureConnection connection)
        {
            try
            {
                var frame = BufferToFrame(sampleBuffer);
                _ppgSignalsProcessor.Enqueue(frame);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
            }
            finally
            {
                sampleBuffer.Dispose();
            }
        }

        private Frame BufferToFrame(CMSampleBuffer sampleBuffer)
        {
            using (var pixelBuffer = sampleBuffer.GetImageBuffer() as CVPixelBuffer)
            {
                pixelBuffer.Lock(CVPixelBufferLock.None);

                try
                {
                    if (!_freeFrames.TryPop(out Frame frame))
                    {
                        frame = new Frame();
                    }

                    frame.Timestamp = (ulong)sampleBuffer.PresentationTimeStamp.Value;

                    var yWidth = pixelBuffer.GetWidthOfPlane(0);
                    var yHeight = pixelBuffer.GetHeightOfPlane(0);
                    int ySize = (int)(yWidth * yHeight);
                    var yAddress = pixelBuffer.GetBaseAddress(0);
                    UpdateBuffer(ref frame.Y, ySize, yAddress);

                    var uvHeight = pixelBuffer.GetHeightOfPlane(1);
                    var uvBytesPerRow = pixelBuffer.GetBytesPerRowOfPlane(1);
                    int uvSize = (int)(uvHeight * uvBytesPerRow);
                    var uvAddress = pixelBuffer.GetBaseAddress(1);
                    UpdateBuffer(ref frame.UV, uvSize, uvAddress);

                    return frame;
                }
                finally
                {
                    pixelBuffer.Unlock(CVPixelBufferLock.None);
                }

                void UpdateBuffer(ref byte[] buffer, int size, IntPtr sourceAddress)
                {
                    if (buffer?.Length != size)
                    {
                        buffer = new byte[size];
                    }
                    Marshal.Copy(sourceAddress, buffer, 0, size);
                }
            }
        }
    }
}