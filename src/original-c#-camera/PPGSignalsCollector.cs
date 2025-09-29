using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using CamPPG;

namespace RivaDigitalApp
{
    public abstract class PPGSignalsCollector : IPPGSignalsCollector
    {
        protected readonly CamPPG.Video2PPGConverter _converter;

        private readonly ConcurrentBag<PpgSignal> signals = new ConcurrentBag<PpgSignal>();

        private int qualityWarnings;

        protected PPGSignalsCollector (int width, int height, int phoneModel)
        {
            _converter = new CamPPG.Video2PPGConverter();
            _converter.InitAlgo(width, height, phoneModel);
        }

        public static IPPGSignalsCollector CreateDroidCollector(int width, int height)
        {
            return new DroidSignalsCollector(width, height);
        }

        public static IPPGSignalsCollector CreateiOsCollector(int width, int height)
        {
            return new iOSSignalsCollector(width, height);
        }

        public IEnumerable<PpgSignal> Data => signals;

        public int SignalsCount => signals.Count;

        public int QualityWarnings => qualityWarnings;

        public void ProcessFrame(Frame frame)
        {
            ConvertFrame(frame, out var ppgStruct);
            if (ppgStruct.QualityWarning)
            {
                Interlocked.Increment(ref qualityWarnings);
            }

            signals.Add(new PpgSignal() { Timestamp = ppgStruct.timestamp, Signals = ppgStruct.Signals, QualityWarning = ppgStruct.QualityWarning });
        }

        //TODO: This functionality should be part of IPPGSignalsProcessor
        protected abstract void ConvertFrame(Frame frame, out Video2PPGConverter.PpgStruct ppgStruct);

        class iOSSignalsCollector : PPGSignalsCollector
        {
            public iOSSignalsCollector(int width, int height) : base(width, height, 2)
            {
            }

            protected override void ConvertFrame(Frame frame, out Video2PPGConverter.PpgStruct ppgStruct)
            {
                _converter.ConvertFrame2PPGiOS(frame.Timestamp, frame.Y, frame.UV, out ppgStruct);
            }
        }

        class DroidSignalsCollector : PPGSignalsCollector
        {
            public DroidSignalsCollector(int width, int height) : base(width, height, 1)
            {
            }

            protected override void ConvertFrame(Frame frame, out Video2PPGConverter.PpgStruct ppgStruct)
            {
                _converter.ConvertFrame2PPGAndroid(frame.Timestamp, frame.Y, frame.U, frame.V, out ppgStruct);
            }
        }
    }
}
