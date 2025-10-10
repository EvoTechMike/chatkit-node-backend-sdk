/**
 * Content widgets for ChatKit.
 *
 * These widgets display text, images, and other content.
 */

import type {
  WidgetComponentBase,
  ThemeColor,
  TextAlign,
  TextSize,
  TitleSize,
  CaptionSize,
  IconSize,
  RadiusValue,
  WidgetIcon,
  EditableProps,
  Spacing,
} from './common.js';

/**
 * Widget rendering plain text with typography controls.
 */
export interface Text extends WidgetComponentBase {
  type: 'Text';
  /** Text content to display. */
  value: string;
  /** Enables streaming-friendly transitions for incremental updates. */
  streaming?: boolean | null;
  /** Render text in italic style. */
  italic?: boolean | null;
  /** Render text with a line-through decoration. */
  lineThrough?: boolean | null;
  /**
   * Text color; accepts a text color token, a primitive color token, a CSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
  /** Font weight; accepts a font weight token. */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | null;
  /** Constrain the text container width; px or CSS string. */
  width?: number | string | null;
  /** Size of the text; accepts a text size token. */
  size?: TextSize | null;
  /** Horizontal text alignment. */
  textAlign?: TextAlign | null;
  /** Truncate overflow with ellipsis. */
  truncate?: boolean | null;
  /** Reserve space for a minimum number of lines. */
  minLines?: number | null;
  /** Limit text to a maximum number of lines (line clamp). */
  maxLines?: number | null;
  /** Enable inline editing for this text node. */
  editable?: false | EditableProps | null;
}

/**
 * Widget rendering prominent headline text.
 */
export interface Title extends WidgetComponentBase {
  type: 'Title';
  /** Text content to display. */
  value: string;
  /**
   * Text color; accepts a text color token, a primitive color token, a CSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
  /** Font weight; accepts a font weight token. */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | null;
  /** Size of the title text; accepts a title size token. */
  size?: TitleSize | null;
  /** Horizontal text alignment. */
  textAlign?: TextAlign | null;
  /** Truncate overflow with ellipsis. */
  truncate?: boolean | null;
  /** Limit text to a maximum number of lines (line clamp). */
  maxLines?: number | null;
}

/**
 * Widget rendering supporting caption text.
 */
export interface Caption extends WidgetComponentBase {
  type: 'Caption';
  /** Text content to display. */
  value: string;
  /**
   * Text color; accepts a text color token, a primitive color token, a CSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
  /** Font weight; accepts a font weight token. */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | null;
  /** Size of the caption text; accepts a caption size token. */
  size?: CaptionSize | null;
  /** Horizontal text alignment. */
  textAlign?: TextAlign | null;
  /** Truncate overflow with ellipsis. */
  truncate?: boolean | null;
  /** Limit text to a maximum number of lines (line clamp). */
  maxLines?: number | null;
}

/**
 * Widget rendering Markdown content, optionally streamed.
 */
export interface Markdown extends WidgetComponentBase {
  type: 'Markdown';
  /** Markdown source string to render. */
  value: string;
  /** Applies streaming-friendly transitions for incremental updates. */
  streaming?: boolean | null;
}

/**
 * Small badge indicating status or categorization.
 */
export interface Badge extends WidgetComponentBase {
  type: 'Badge';
  /** Text to display inside the badge. */
  label: string;
  /** Color of the badge; accepts a badge color token. */
  color?: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery' | null;
  /** Visual style of the badge. */
  variant?: 'solid' | 'soft' | 'outline' | null;
  /** Size of the badge. */
  size?: 'sm' | 'md' | 'lg' | null;
  /** Determines if the badge should be fully rounded (pill). */
  pill?: boolean | null;
}

/**
 * Icon component referencing a built-in icon name.
 */
export interface Icon extends WidgetComponentBase {
  type: 'Icon';
  /** Name of the icon to display. */
  name: WidgetIcon;
  /**
   * Icon color; accepts a text color token, a primitive color token, a CSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
  /** Size of the icon; accepts an icon size token. */
  size?: IconSize | null;
}

/**
 * Image component with sizing and fitting controls.
 */
export interface Image extends WidgetComponentBase {
  type: 'Image';
  /** Image URL source. */
  src: string;
  /** Alternate text for accessibility. */
  alt?: string | null;
  /** How the image should fit within the container. */
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none' | null;
  /** Focal position of the image within the container. */
  position?:
    | 'top left'
    | 'top'
    | 'top right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom left'
    | 'bottom'
    | 'bottom right'
    | null;
  /** Border radius; accepts a radius token. */
  radius?: RadiusValue | null;
  /** Draw a subtle frame around the image. */
  frame?: boolean | null;
  /** Flush the image to the container edge, removing surrounding padding. */
  flush?: boolean | null;
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
  /** Outer margin; spacing unit, CSS string, or margin object. */
  margin?: number | string | Spacing | null;
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
  /** Flex growth/shrink factor. */
  flex?: number | string | null;
}
