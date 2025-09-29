namespace RivaDigitalApp
{
    public class Frame
    {
        public byte[] Y;

        public byte[] U;

        public byte[] V;

        public byte[] UV;

        public ulong Timestamp { get; set; }
    }
}