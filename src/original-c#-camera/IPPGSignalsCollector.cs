using System.Collections.Generic;

namespace RivaDigitalApp
{
    public interface IPPGSignalsCollector
    {
        int SignalsCount { get; }

        int QualityWarnings { get; }

        void ProcessFrame(Frame frame);

        IEnumerable<PpgSignal> Data { get; }
    }
}
