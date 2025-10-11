/**
 * Async Generator Stream Merging Utility
 *
 * This module provides a utility to merge two async generators into a single stream,
 * yielding events as they arrive from either source. This enables combining Agent SDK
 * events with custom integration events (like widgets, workflows, etc.).
 */

/**
 * Wrapper to distinguish events from the secondary stream (custom events)
 */
export class EventWrapper<T> {
  constructor(public readonly event: T) {}
}

/**
 * Merges two async iterators, yielding events as they arrive from either source.
 *
 * Events from the first iterator (typically Agent SDK) are yielded directly.
 * Events from the second iterator (typically custom events) are wrapped in EventWrapper.
 *
 * This implements a similar pattern to Python's `_merge_generators` using Promise.race
 * to handle whichever iterator produces a value first.
 *
 * @template T1 - Type of events from first iterator (Agent SDK events)
 * @template T2 - Type of events from second iterator (custom events)
 * @param a - First async iterator (e.g., Agent SDK stream)
 * @param b - Second async iterator (e.g., custom event queue)
 * @returns Merged async generator yielding T1 | EventWrapper<T2>
 *
 * @example
 * ```typescript
 * const agentStream = agentRunner.streamEvents();
 * const customEventQueue = createEventQueue();
 *
 * for await (const event of mergeAsyncGenerators(agentStream, customEventQueue)) {
 *   if (event instanceof EventWrapper) {
 *     // This is a custom event
 *     yield event.event;
 *   } else {
 *     // This is an Agent SDK event
 *     processAgentEvent(event);
 *   }
 * }
 * ```
 */
export async function* mergeAsyncGenerators<T1, T2>(
  a: AsyncIterator<T1>,
  b: AsyncIterator<T2>,
  onFirstComplete?: () => void
): AsyncGenerator<T1 | EventWrapper<T2>> {
  // Track which iterators are still active
  const iterators = new Map<string, AsyncIterator<T1 | T2>>();
  iterators.set('a', a as AsyncIterator<T1 | T2>);
  iterators.set('b', b as AsyncIterator<T1 | T2>);

  // Create promises for the next value from each iterator
  const pending = new Map<string, Promise<IteratorResult<T1 | T2>>>();

  const createPromise = (_iteratorKey: string, iterator: AsyncIterator<T1 | T2>) => {
    return iterator.next().catch(() => ({ done: true, value: undefined } as IteratorResult<T1 | T2>));
  };

  // Initialize pending promises for both iterators
  for (const [key, iterator] of iterators) {
    pending.set(key, createPromise(key, iterator));
  }

  while (pending.size > 0) {
    // Race to see which iterator produces a value first
    const raceResult = await Promise.race(
      Array.from(pending.entries()).map(async ([key, promise]) => ({
        key,
        result: await promise,
      }))
    );

    const { key, result } = raceResult;

    // Remove the completed promise
    pending.delete(key);

    if (result.done) {
      // This iterator is exhausted
      iterators.delete(key);

      // If the first iterator (agent stream) completes, call the callback
      if (key === 'a' && onFirstComplete) {
        onFirstComplete();
      }

      // If both are done, we're finished
      if (iterators.size === 0) {
        break;
      }
    } else {
      // Yield the value
      if (key === 'b') {
        // Wrap custom events (from second iterator)
        yield new EventWrapper(result.value as T2);
      } else {
        // Pass through Agent SDK events (from first iterator)
        yield result.value as T1;
      }

      // Schedule next value from this iterator
      const iterator = iterators.get(key);
      if (iterator) {
        pending.set(key, createPromise(key, iterator));
      }
    }
  }
}
