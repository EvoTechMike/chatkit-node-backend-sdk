import type { ThreadMetadata } from '../types/thread.js';
import type { Store } from '../store/Store.js';

/**
 * Context object passed to Agent execution that combines ChatKit-specific data
 * with user-defined request context.
 *
 * This allows Agents to access the current thread, store, and any custom
 * context data (like user ID, tenant ID, etc.) during execution.
 *
 * @template TContext - The user-defined context type (default: unknown)
 *
 * @example
 * ```typescript
 * interface MyContext {
 *   userId: string;
 *   tenantId: string;
 * }
 *
 * const agentContext: AgentContext<MyContext> = {
 *   thread: currentThread,
 *   store: myStore,
 *   requestContext: { userId: 'user123', tenantId: 'tenant456' }
 * };
 * ```
 */
export interface AgentContext<TContext = unknown> {
  /** The current ChatKit thread being processed */
  thread: ThreadMetadata;

  /** The store instance for persisting thread data */
  store: Store<TContext>;

  /** User-defined request context (e.g., user ID, session data, etc.) */
  requestContext: TContext;
}
