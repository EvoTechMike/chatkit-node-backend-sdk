/**
 * Layout widgets for ChatKit.
 *
 * These widgets provide structure and organization for content.
 */

import type { ActionConfig } from '../types/actions.js';
import type {
  WidgetComponentBase,
  BoxBase,
  ThemeColor,
  Spacing,
  Alignment,
  WidgetStatus,
  CardAction,
} from './common.js';

// Forward declaration
type WidgetComponent = any;

/**
 * Versatile container used for structuring widget content.
 */
export interface Card extends WidgetComponentBase {
  type: 'Card';
  /** Treat the card as an HTML form so confirm/cancel capture form data. */
  asForm?: boolean | null;
  /** Child components rendered inside the card. */
  children: WidgetComponent[];
  /**
   * Background color; accepts background color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `surface` `surface-secondary` `surface-tertiary` `surface-elevated` `surface-elevated-secondary`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  background?: string | ThemeColor | null;
  /** Visual size of the card; accepts a size token. No preset default is documented. */
  size?: 'sm' | 'md' | 'lg' | 'full' | null;
  /** Inner spacing of the card; spacing unit, CSS string, or padding object. */
  padding?: number | string | Spacing | null;
  /** Optional status header displayed above the card. */
  status?: WidgetStatus | null;
  /** Collapse card body after the main action has completed. */
  collapsed?: boolean | null;
  /** Confirmation action button shown in the card footer. */
  confirm?: CardAction | null;
  /** Cancel action button shown in the card footer. */
  cancel?: CardAction | null;
  /** Force light or dark theme for this subtree. */
  theme?: 'light' | 'dark' | null;
}

/**
 * Generic flex container with direction control.
 */
export interface Box extends BoxBase {
  type: 'Box';
  /** Flex direction for content within this container. */
  direction?: 'row' | 'col' | null;
}

/**
 * Horizontal flex container.
 */
export interface Row extends BoxBase {
  type: 'Row';
}

/**
 * Vertical flex container.
 */
export interface Col extends BoxBase {
  type: 'Col';
}

/**
 * Form wrapper capable of submitting onSubmitAction.
 */
export interface Form extends BoxBase {
  type: 'Form';
  /** Action dispatched when the form is submitted. */
  onSubmitAction?: ActionConfig | null;
  /** Flex direction for laying out form children. */
  direction?: 'row' | 'col' | null;
}

/**
 * Visual divider separating content sections.
 */
export interface Divider extends WidgetComponentBase {
  type: 'Divider';
  /**
   * Divider color; accepts border color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `default` `subtle` `strong`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
  /** Thickness of the divider line; px or CSS string. */
  size?: number | string | null;
  /** Outer spacing above and below the divider; spacing unit or CSS string. */
  spacing?: number | string | null;
  /** Flush the divider to the container edge, removing surrounding padding. */
  flush?: boolean | null;
}

/**
 * Flexible spacer used to push content apart.
 */
export interface Spacer extends WidgetComponentBase {
  type: 'Spacer';
  /** Minimum size the spacer should occupy along the flex direction. */
  minSize?: number | string | null;
}

/**
 * Single row inside a ListView component.
 */
export interface ListViewItem extends WidgetComponentBase {
  type: 'ListViewItem';
  /** Content for the list item. */
  children: WidgetComponent[];
  /** Optional action triggered when the list item is clicked. */
  onClickAction?: ActionConfig | null;
  /** Gap between children within the list item; spacing unit or CSS string. */
  gap?: number | string | null;
  /** Y-axis alignment for content within the list item. */
  align?: Alignment | null;
}

/**
 * Container component for rendering collections of list items.
 */
export interface ListView extends WidgetComponentBase {
  type: 'ListView';
  /** Items to render in the list. */
  children: ListViewItem[];
  /** Max number of items to show before a "Show more" control. */
  limit?: number | 'auto' | null;
  /** Optional status header displayed above the list. */
  status?: WidgetStatus | null;
  /** Force light or dark theme for this subtree. */
  theme?: 'light' | 'dark' | null;
}
