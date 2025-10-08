/**
 * Base types used throughout the ChatKit SDK
 */

/**
 * Paginated collection of records returned from the API.
 */
export interface Page<T> {
  data: T[];
  has_more: boolean;
  after: string | null;
}

/**
 * Model and tool configuration for message processing.
 */
export interface InferenceOptions {
  tool_choice?: ToolChoice | null;
  model?: string | null;
}

/**
 * Explicit tool selection for the assistant to invoke.
 */
export interface ToolChoice {
  id: string;
}

/**
 * Literal type for feedback sentiment.
 */
export type FeedbackKind = 'positive' | 'negative';

/**
 * Literal names of supported progress icons.
 */
export type IconName =
  | 'analytics'
  | 'atom'
  | 'bolt'
  | 'book-open'
  | 'book-closed'
  | 'calendar'
  | 'chart'
  | 'circle-question'
  | 'compass'
  | 'cube'
  | 'globe'
  | 'keys'
  | 'lab'
  | 'images'
  | 'lifesaver'
  | 'lightbulb'
  | 'map-pin'
  | 'name'
  | 'notebook'
  | 'notebook-pencil'
  | 'page-blank'
  | 'profile'
  | 'profile-card'
  | 'search'
  | 'sparkle'
  | 'sparkle-double'
  | 'square-code'
  | 'square-image'
  | 'square-text'
  | 'suitcase'
  | 'write'
  | 'write-alt'
  | 'write-alt2';
