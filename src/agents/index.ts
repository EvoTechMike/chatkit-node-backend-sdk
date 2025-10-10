/**
 * ChatKit Agents SDK Integration
 *
 * This module provides integration helpers for using the OpenAI Agents SDK
 * with ChatKit. It bridges the gap between Agent Runner streams and ChatKit
 * ThreadStreamEvents, making it easy to build agent-powered chat applications.
 *
 * Includes support for:
 * - Agent response streaming
 * - Widget streaming from tools
 * - Event merging (multi-agent workflows)
 * - Thread item conversion
 *
 * @module agents
 */

// Core types and context
export type { AgentContext } from './types.js';
export { AsyncEventQueue } from './types.js';
export { createAgentContext } from './context-helpers.js';

// Input/output conversion
export { simpleToAgentInput } from './input-converter.js';
export { streamAgentResponse } from './stream-converter.js';
export {
  ThreadItemConverter,
  DefaultThreadItemConverter,
} from './item-converter.js';

// Widget helpers
export { diffWidget, accumulateText } from './widget-helpers.js';

// Stream merging (for advanced use cases)
export { mergeAsyncGenerators, EventWrapper } from './merge-streams.js';
