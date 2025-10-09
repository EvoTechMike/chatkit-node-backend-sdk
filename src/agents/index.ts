/**
 * ChatKit Agents SDK Integration
 *
 * This module provides integration helpers for using the OpenAI Agents SDK
 * with ChatKit. It bridges the gap between Agent Runner streams and ChatKit
 * ThreadStreamEvents, making it easy to build agent-powered chat applications.
 *
 * @module agents
 */

export type { AgentContext } from './types.js';
export { simpleToAgentInput } from './input-converter.js';
export { streamAgentResponse } from './stream-converter.js';
export {
  ThreadItemConverter,
  DefaultThreadItemConverter,
} from './item-converter.js';
