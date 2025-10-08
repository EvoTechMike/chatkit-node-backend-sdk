/**
 * Action types - interactive behaviors for widgets
 */

export type Handler = 'client' | 'server';
export type LoadingBehavior = 'auto' | 'none' | 'self' | 'container';

/**
 * Configuration for an action that can be triggered by a widget component.
 */
export interface ActionConfig {
  type: string;
  payload?: unknown;
  handler?: Handler;
  loadingBehavior?: LoadingBehavior;
}

/**
 * Action - represents an interactive action from a widget
 * (Full implementation in Phase 6; for now just an alias to ActionConfig)
 */
export type Action = ActionConfig;
