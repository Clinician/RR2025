using System.Threading.Tasks;

namespace RivaDigitalApp
{
    public interface IPPGSignalsProcessor
    {

        void Enqueue(Frame frame);

        Task ProcessingToCompletionAsync();

        void TerminateProcessing();
    }
}
