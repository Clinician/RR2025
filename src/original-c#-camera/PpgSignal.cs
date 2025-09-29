using System;
using System.Collections.Generic;

namespace RivaDigitalApp
{
    public class PpgSignalPack
    {
        public string PhoneModel { get; set; }

        public string PhoneOSVersion { get; set; }

        public string InfoSupportedHardwareLevel { get; set; }

        public IEnumerable<PpgSignal> PpgSignals { get; set; }

        public Calibration Calibration { get; set; }
    }

    public class PpgSignal
    {
        public ulong Timestamp { get; set; }

        public double[] Signals { get; set; }

        public bool QualityWarning { get; set; }
    }

    public class Calibration
    {
        public int Dia { get; set; }

        public int Sys { get; set; }

        public string Type { get; set; }
    }

   
}
