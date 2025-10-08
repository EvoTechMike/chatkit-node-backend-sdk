/**
 * Widget types - UI components for rich interactions
 *
 * Note: This is a simplified version for Phase 1.
 * Full widget component definitions will be added in Phase 5.
 */

import type { ActionConfig } from './actions.js';

/**
 * Base interface for all widget components.
 */
export interface WidgetComponentBase {
  type: string;
  key?: string | null;
  id?: string | null;
}

/**
 * Placeholder for widget component union.
 * Will be fully defined in Phase 5.
 */
export type WidgetComponent = WidgetComponentBase & Record<string, unknown>;

/**
 * Root widget types that can be top-level items.
 * Will be fully defined in Phase 5.
 */
export type WidgetRoot = WidgetComponent;

/**
 * Icon names accepted by widgets that render icons.
 */
export type WidgetIcon =
  | 'agent'
  | 'analytics'
  | 'atom'
  | 'bolt'
  | 'book-open'
  | 'book-clock'
  | 'book-closed'
  | 'calendar'
  | 'chart'
  | 'check'
  | 'check-circle'
  | 'check-circle-filled'
  | 'chevron-left'
  | 'chevron-right'
  | 'circle-question'
  | 'compass'
  | 'confetti'
  | 'cube'
  | 'desktop'
  | 'document'
  | 'dot'
  | 'dots-horizontal'
  | 'dots-vertical'
  | 'empty-circle'
  | 'external-link'
  | 'globe'
  | 'keys'
  | 'lab'
  | 'images'
  | 'info'
  | 'lifesaver'
  | 'lightbulb'
  | 'mail'
  | 'map-pin'
  | 'maps'
  | 'mobile'
  | 'name'
  | 'notebook'
  | 'notebook-pencil'
  | 'page-blank'
  | 'phone'
  | 'play'
  | 'plus'
  | 'profile'
  | 'profile-card'
  | 'reload'
  | 'star'
  | 'star-filled'
  | 'search'
  | 'sparkle'
  | 'sparkle-double'
  | 'square-code'
  | 'square-image'
  | 'square-text'
  | 'suitcase'
  | 'settings-slider'
  | 'user'
  | 'wreath'
  | 'write'
  | 'write-alt'
  | 'write-alt2';

export { ActionConfig };
