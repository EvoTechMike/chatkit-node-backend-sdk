/**
 * Common types and utilities for ChatKit widgets.
 *
 * These types are shared across widget components and match the Python SDK.
 */

import type { ActionConfig } from '../types/actions.js';

/**
 * Color values for light and dark themes.
 */
export interface ThemeColor {
  /** Color to use when the theme is dark. */
  dark: string;
  /** Color to use when the theme is light. */
  light: string;
}

/**
 * Shorthand spacing values applied to a widget.
 */
export interface Spacing {
  /** Top spacing; accepts a spacing unit or CSS string. */
  top?: number | string;
  /** Right spacing; accepts a spacing unit or CSS string. */
  right?: number | string;
  /** Bottom spacing; accepts a spacing unit or CSS string. */
  bottom?: number | string;
  /** Left spacing; accepts a spacing unit or CSS string. */
  left?: number | string;
  /** Horizontal spacing; accepts a spacing unit or CSS string. */
  x?: number | string;
  /** Vertical spacing; accepts a spacing unit or CSS string. */
  y?: number | string;
}

/**
 * Border style definition for an edge.
 */
export interface Border {
  /** Thickness of the border in px. */
  size: number;
  /**
   * Border color; accepts border color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `default` `subtle` `strong`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor;
  /** Border line style. */
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
}

/**
 * Composite border configuration applied across edges.
 */
export interface Borders {
  /** Top border or thickness in px. */
  top?: number | Border;
  /** Right border or thickness in px. */
  right?: number | Border;
  /** Bottom border or thickness in px. */
  bottom?: number | Border;
  /** Left border or thickness in px. */
  left?: number | Border;
  /** Horizontal borders or thickness in px. */
  x?: number | Border;
  /** Vertical borders or thickness in px. */
  y?: number | Border;
}

/**
 * Integer minimum/maximum bounds.
 */
export interface MinMax {
  /** Minimum value (inclusive). */
  min?: number;
  /** Maximum value (inclusive). */
  max?: number;
}

/**
 * Editable field options for text widgets.
 */
export interface EditableProps {
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Autofocus the editable input when it appears. */
  autoFocus?: boolean;
  /** Select all text on focus. */
  autoSelect?: boolean;
  /** Native autocomplete hint for the input. */
  autoComplete?: string;
  /** Allow browser password/autofill extensions. */
  allowAutofillExtensions?: boolean;
  /** Regex pattern for input validation. */
  pattern?: string;
  /** Placeholder text for the editable input. */
  placeholder?: string;
  /** Mark the editable input as required. */
  required?: boolean;
}

/**
 * Widget status representation using a favicon.
 */
export interface WidgetStatusWithFavicon {
  /** Status text to display. */
  text: string;
  /** URL of a favicon to render at the start of the status. */
  favicon?: string;
  /** Show a frame around the favicon for contrast. */
  frame?: boolean;
}

/**
 * Widget status representation using an icon.
 */
export interface WidgetStatusWithIcon {
  /** Status text to display. */
  text: string;
  /** Icon to render at the start of the status. */
  icon?: WidgetIcon;
}

/**
 * Union for representing widget status messaging.
 */
export type WidgetStatus = WidgetStatusWithFavicon | WidgetStatusWithIcon;

/**
 * Configuration for confirm/cancel actions within a card.
 */
export interface CardAction {
  /** Button label shown in the card footer. */
  label: string;
  /** Declarative action dispatched to the host application. */
  action: ActionConfig;
}

/**
 * Selectable option used by the Select widget.
 */
export interface SelectOption {
  /** Option value submitted with the form. */
  value: string;
  /** Human-readable label for the option. */
  label: string;
  /** Disable the option. */
  disabled?: boolean;
  /** Displayed as secondary text below the option label. */
  description?: string;
}

/**
 * Option inside a RadioGroup widget.
 */
export interface RadioOption {
  /** Label displayed next to the radio option. */
  label: string;
  /** Value submitted when the radio option is selected. */
  value: string;
  /** Disables a specific radio option. */
  disabled?: boolean;
}

// ============================================================================
// Type Literals
// ============================================================================

/** Allowed corner radius tokens. */
export type RadiusValue =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | 'full'
  | '100%'
  | 'none';

/** Horizontal text alignment options. */
export type TextAlign = 'start' | 'center' | 'end';

/** Body text size tokens. */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Icon size tokens. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Title text size tokens. */
export type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

/** Caption text size tokens. */
export type CaptionSize = 'sm' | 'md' | 'lg';

/** Flexbox alignment options. */
export type Alignment = 'start' | 'center' | 'end' | 'baseline' | 'stretch';

/** Flexbox justification options. */
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | 'stretch';

/** Button and input style variants. */
export type ControlVariant = 'solid' | 'soft' | 'outline' | 'ghost';

/** Button and input size variants. */
export type ControlSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

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

// ============================================================================
// Base Widget Component
// ============================================================================

/**
 * Base properties for all ChatKit widget components.
 */
export interface WidgetComponentBase {
  /** Unique identifier for the widget. */
  id?: string | null;
  /** React key for the widget. */
  key?: string | null;
  /** Widget type discriminator. */
  type: string;
}

/**
 * Shared layout props for flexible container widgets.
 */
export interface BoxBase extends WidgetComponentBase {
  /** Child components to render inside the container. */
  children?: WidgetComponent[] | null;
  /** Cross-axis alignment of children. */
  align?: Alignment | null;
  /** Main-axis distribution of children. */
  justify?: Justification | null;
  /** Wrap behavior for flex items. */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | null;
  /** Flex growth/shrink factor. */
  flex?: number | string | null;
  /** Gap between direct children; spacing unit or CSS string. */
  gap?: number | string | null;
  /** Explicit height; px or CSS string. */
  height?: number | string | null;
  /** Explicit width; px or CSS string. */
  width?: number | string | null;
  /** Shorthand to set both width and height; px or CSS string. */
  size?: number | string | null;
  /** Minimum height; px or CSS string. */
  minHeight?: number | string | null;
  /** Minimum width; px or CSS string. */
  minWidth?: number | string | null;
  /** Shorthand to set both minWidth and minHeight; px or CSS string. */
  minSize?: number | string | null;
  /** Maximum height; px or CSS string. */
  maxHeight?: number | string | null;
  /** Maximum width; px or CSS string. */
  maxWidth?: number | string | null;
  /** Shorthand to set both maxWidth and maxHeight; px or CSS string. */
  maxSize?: number | string | null;
  /** Inner padding; spacing unit, CSS string, or padding object. */
  padding?: number | string | Spacing | null;
  /** Outer margin; spacing unit, CSS string, or margin object. */
  margin?: number | string | Spacing | null;
  /** Border applied to the container; px or border object/shorthand. */
  border?: number | Border | Borders | null;
  /** Border radius; accepts a radius token. */
  radius?: RadiusValue | null;
  /**
   * Background color; accepts background color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `surface` `surface-secondary` `surface-tertiary` `surface-elevated` `surface-elevated-secondary`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  background?: string | ThemeColor | null;
  /** Aspect ratio of the box (e.g., 16/9); number or CSS string. */
  aspectRatio?: number | string | null;
}

// Forward declaration - will be defined in other files
export type WidgetComponent = any;
