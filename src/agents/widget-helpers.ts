/**
 * Widget Streaming Helper Functions
 *
 * This module provides utilities for streaming and updating widgets,
 * including diff calculation and text accumulation from Agent SDK streams.
 */

import type { RunStreamEvent } from '@openai/agents';
import type {
  WidgetRoot,
  Text,
  Markdown,
} from '../widgets/index.js';
import type {
  WidgetStreamingTextValueDelta,
  WidgetRootUpdated,
  WidgetComponentUpdated,
} from '../types/events.js';

/**
 * Compare two WidgetRoot structures and return a list of deltas.
 *
 * This function determines what has changed between two widget states and returns
 * the minimal set of updates needed to transform the `before` state into the `after` state.
 *
 * For Text and Markdown components with an `id`, it detects text value changes and
 * emits streaming text deltas if the new value is a prefix extension of the old value.
 *
 * @param before - The previous widget state
 * @param after - The new widget state
 * @returns Array of update events (text deltas, component updates, or full replacement)
 *
 * @example
 * ```typescript
 * const before: Card = { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Hello' }] };
 * const after: Card = { type: 'Card', children: [{ type: 'Text', id: 'msg', value: 'Hello World' }] };
 * const deltas = diffWidget(before, after);
 * // Returns: [{ type: 'widget.streaming_text.value_delta', component_id: 'msg', delta: ' World', done: false }]
 * ```
 */
export function diffWidget(
  before: WidgetRoot,
  after: WidgetRoot
): Array<WidgetStreamingTextValueDelta | WidgetRootUpdated | WidgetComponentUpdated> {
  /**
   * Check if a full replacement is needed (type, id, or key changed, or significant structural changes)
   */
  function needsFullReplace(before: any, after: any): boolean {
    // Type mismatch
    if (before.type !== after.type) {
      return true;
    }

    // ID or key mismatch
    if (before.id !== after.id || before.key !== after.key) {
      return true;
    }

    // Check if any non-value properties changed significantly
    const beforeKeys = new Set(Object.keys(before));
    const afterKeys = new Set(Object.keys(after));
    const allKeys = new Set([...beforeKeys, ...afterKeys]);

    for (const key of allKeys) {
      // Skip 'value' for Text/Markdown - we handle that specially
      if (
        (before.type === 'Text' || before.type === 'Markdown') &&
        key === 'value' &&
        typeof after.value === 'string' &&
        typeof before.value === 'string' &&
        after.value.startsWith(before.value)
      ) {
        continue;
      }

      const beforeVal = before[key];
      const afterVal = after[key];

      // Handle arrays
      if (Array.isArray(beforeVal) && Array.isArray(afterVal)) {
        if (beforeVal.length !== afterVal.length) {
          return true;
        }
        for (let i = 0; i < beforeVal.length; i++) {
          if (typeof beforeVal[i] === 'object' && typeof afterVal[i] === 'object') {
            if (needsFullReplace(beforeVal[i], afterVal[i])) {
              return true;
            }
          } else if (beforeVal[i] !== afterVal[i]) {
            return true;
          }
        }
      }
      // Handle objects
      else if (
        typeof beforeVal === 'object' &&
        beforeVal !== null &&
        typeof afterVal === 'object' &&
        afterVal !== null
      ) {
        if (needsFullReplace(beforeVal, afterVal)) {
          return true;
        }
      }
      // Primitive comparison
      else if (beforeVal !== afterVal) {
        return true;
      }
    }

    return false;
  }

  // If full replace needed, return root update
  if (needsFullReplace(before, after)) {
    return [
      {
        type: 'widget.root.updated',
        widget: after,
      },
    ];
  }

  // Find all Text/Markdown components with IDs
  const deltas: Array<WidgetStreamingTextValueDelta | WidgetComponentUpdated | WidgetRootUpdated> =
    [];

  function findAllStreamingTextComponents(component: any): Map<string, Text | Markdown> {
    const components = new Map<string, Text | Markdown>();

    function recurse(comp: any): void {
      if (
        comp &&
        typeof comp === 'object' &&
        (comp.type === 'Text' || comp.type === 'Markdown') &&
        comp.id
      ) {
        components.set(comp.id, comp);
      }

      if (comp && typeof comp === 'object' && comp.children) {
        const children = Array.isArray(comp.children) ? comp.children : [];
        for (const child of children) {
          recurse(child);
        }
      }
    }

    recurse(component);
    return components;
  }

  const beforeNodes = findAllStreamingTextComponents(before);
  const afterNodes = findAllStreamingTextComponents(after);

  // Check each after node for changes
  for (const [id, afterNode] of afterNodes) {
    const beforeNode = beforeNodes.get(id);

    if (!beforeNode) {
      throw new Error(
        `Node ${id} was not present when the widget was initially rendered. ` +
          `All nodes with ID must persist across all widget updates.`
      );
    }

    const beforeValue = beforeNode.value || '';
    const afterValue = afterNode.value || '';

    if (beforeValue !== afterValue) {
      // Check if it's a valid streaming update (must be prefix)
      if (!afterValue.startsWith(beforeValue)) {
        throw new Error(
          `Node ${id} was updated with a new value that is not a prefix of the initial value. ` +
            `All widget updates must be cumulative.`
        );
      }

      const delta = afterValue.slice(beforeValue.length);
      const done = !afterNode.streaming;

      deltas.push({
        type: 'widget.streaming_text.value_delta',
        component_id: id,
        delta,
        done,
      });
    }
  }

  return deltas;
}

/**
 * Accumulate text from Agent SDK stream events into a Text or Markdown widget.
 *
 * This helper function listens to Agent SDK `output_text_delta` events and progressively
 * updates the widget's value property, yielding new widget states as text accumulates.
 *
 * @template TWidget - Type of widget (Text or Markdown)
 * @param events - Async iterable of Agent SDK RunStreamEvents
 * @param baseWidget - Initial widget to accumulate text into (must have id and streaming: true)
 * @returns Async generator yielding updated widget states
 *
 * @example
 * ```typescript
 * const agentRun = Runner.runStreamed(agent, input);
 *
 * for await (const textWidget of accumulateText(
 *   agentRun.streamEvents(),
 *   { type: 'Text', id: 'output', value: '', streaming: true }
 * )) {
 *   const card: Card = { type: 'Card', children: [textWidget] };
 *   yield card; // Emit updated widget with accumulated text
 * }
 * ```
 */
export async function* accumulateText<TWidget extends Text | Markdown>(
  events: AsyncIterable<RunStreamEvent>,
  baseWidget: TWidget
): AsyncGenerator<TWidget> {
  let accumulatedText = '';

  // Yield initial state
  yield baseWidget;

  for await (const event of events) {
    if (event.type === 'raw_model_stream_event') {
      const { data } = event;

      if (data.type === 'output_text_delta') {
        const delta = data.delta || '';
        accumulatedText += delta;

        // Yield updated widget with accumulated text
        yield {
          ...baseWidget,
          value: accumulatedText,
          streaming: true,
        } as TWidget;
      }
    }
  }

  // Yield final state with streaming: false
  yield {
    ...baseWidget,
    value: accumulatedText,
    streaming: false,
  } as TWidget;
}
