using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RivaDigital.Utils;

namespace RivaDigitalApp
{
    public class PPGSignalsProcessor : IPPGSignalsProcessor
    {
        private static readonly int ParallelismDegree = Environment.ProcessorCount;
        private static readonly int MaxFreeFrames = Environment.ProcessorCount * 4;

        private readonly BlockingCollection<Frame> frames = new BlockingCollection<Frame>();
        private readonly IPPGSignalsCollector _ppgSignalsCollector;
        private readonly ConcurrentStack<Frame> _freeFrames;

        private CancellationTokenSource _cancelTokenSrc = new CancellationTokenSource();
        private readonly List<Task> _processingTasks;

        public PPGSignalsProcessor(IPPGSignalsCollector ppgSignalsCollector, ConcurrentStack<Frame> freeFrames)
        {
            _ppgSignalsCollector = ppgSignalsCollector;
            _freeFrames = freeFrames;
            _processingTasks = Enumerable.Range(1, ParallelismDegree)
                .Select(_ => Task.Run(() => ProcessFrames()))
                .ToList();
        }

        public void Enqueue(Frame frame)
        {
            frames.Add(frame);
            if (frames.Count > ParallelismDegree)
            {
                Thread.Sleep(10 * frames.Count / ParallelismDegree);
            }
        }

        public async Task ProcessingToCompletionAsync()
        {
            if (_cancelTokenSrc?.IsCancellationRequested != false)
            {
                return;
            }

            frames.CompleteAdding();
            bool completed = _processingTasks.All(t => t.IsCompleted || t.IsCanceled || t.IsFaulted);

            if (!completed)
            {
                await Task.WhenAny(Task.WhenAll(_processingTasks), Task.Delay(100));
            }

            TerminateProcessing();
        }

        public void TerminateProcessing()
        {
            _processingTasks.Clear();
            var cancelTokenSrc = Interlocked.Exchange(ref _cancelTokenSrc, null);
            if (cancelTokenSrc != null)
            {
                cancelTokenSrc.Cancel();
                cancelTokenSrc.Dispose();
            }
        }

        private void ProcessFrames()
        {
            try
            {
                CancellationToken cancelToken = _cancelTokenSrc.Token;
                while (!cancelToken.IsCancellationRequested && !frames.IsCompleted)
                {
                    foreach (var frame in frames.GetConsumingEnumerable(cancelToken))
                    {
                        _ppgSignalsCollector.ProcessFrame(frame);
                        if (_freeFrames.Count < MaxFreeFrames)
                        {
                            _freeFrames.Push(frame);
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                ExceptionUtils.HandleException(ex, HandleExceptionBehavior.Log);
            }
        }

    }
}
