/**
 * Form widgets for ChatKit.
 *
 * These widgets handle user input and form submissions.
 */

import type { ActionConfig } from '../types/actions.js';
import type {
  WidgetComponentBase,
  SelectOption,
  RadioOption,
  ControlVariant,
  ControlSize,
  TextSize,
  TextAlign,
  ThemeColor,
} from './common.js';

/**
 * Single-line text input component.
 */
export interface Input extends WidgetComponentBase {
  type: 'Input';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Native input type. */
  inputType?: 'number' | 'email' | 'text' | 'password' | 'tel' | 'url' | null;
  /** Initial value of the input. */
  defaultValue?: string | null;
  /** Mark the input as required for form submission. */
  required?: boolean | null;
  /** Regex pattern for input validation. */
  pattern?: string | null;
  /** Placeholder text shown when empty. */
  placeholder?: string | null;
  /** Allow password managers / autofill extensions to appear. */
  allowAutofillExtensions?: boolean | null;
  /** Select all contents of the input when it mounts. */
  autoSelect?: boolean | null;
  /** Autofocus the input when it mounts. */
  autoFocus?: boolean | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
  /** Visual style of the input. */
  variant?: 'soft' | 'outline' | null;
  /** Controls the size of the input control. */
  size?: ControlSize | null;
  /** Controls gutter on the edges of the input; overrides value from `size`. */
  gutterSize?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null;
  /** Determines if the input should be fully rounded (pill). */
  pill?: boolean | null;
}

/**
 * Multiline text input component.
 */
export interface Textarea extends WidgetComponentBase {
  type: 'Textarea';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Initial value of the textarea. */
  defaultValue?: string | null;
  /** Mark the textarea as required for form submission. */
  required?: boolean | null;
  /** Regex pattern for input validation. */
  pattern?: string | null;
  /** Placeholder text shown when empty. */
  placeholder?: string | null;
  /** Select all contents of the textarea when it mounts. */
  autoSelect?: boolean | null;
  /** Autofocus the textarea when it mounts. */
  autoFocus?: boolean | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
  /** Visual style of the textarea. */
  variant?: 'soft' | 'outline' | null;
  /** Controls the size of the textarea control. */
  size?: ControlSize | null;
  /** Controls gutter on the edges of the textarea; overrides value from `size`. */
  gutterSize?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null;
  /** Initial number of visible rows. */
  rows?: number | null;
  /** Automatically grow/shrink to fit content. */
  autoResize?: boolean | null;
  /** Maximum number of rows when auto-resizing. */
  maxRows?: number | null;
  /** Allow password managers / autofill extensions to appear. */
  allowAutofillExtensions?: boolean | null;
}

/**
 * Select dropdown component.
 */
export interface Select extends WidgetComponentBase {
  type: 'Select';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** List of selectable options. */
  options: SelectOption[];
  /** Action dispatched when the value changes. */
  onChangeAction?: ActionConfig | null;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string | null;
  /** Initial value of the select. */
  defaultValue?: string | null;
  /** Visual style of the select; accepts a control variant token. */
  variant?: ControlVariant | null;
  /** Controls the size of the select control. */
  size?: ControlSize | null;
  /** Determines if the select should be fully rounded (pill). */
  pill?: boolean | null;
  /** Extend the select to 100% of the available width. */
  block?: boolean | null;
  /** Show a clear control to unset the value. */
  clearable?: boolean | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
}

/**
 * Checkbox input component.
 */
export interface Checkbox extends WidgetComponentBase {
  type: 'Checkbox';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Optional label text rendered next to the checkbox. */
  label?: string | null;
  /** The initial checked state of the checkbox. */
  defaultChecked?: string | null;
  /** Action dispatched when the checked state changes. */
  onChangeAction?: ActionConfig | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
  /** Mark the checkbox as required for form submission. */
  required?: boolean | null;
}

/**
 * Grouped radio input control.
 */
export interface RadioGroup extends WidgetComponentBase {
  type: 'RadioGroup';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Array of options to render as radio items. */
  options?: RadioOption[] | null;
  /** Accessible label for the radio group; falls back to `name`. */
  ariaLabel?: string | null;
  /** Action dispatched when the selected value changes. */
  onChangeAction?: ActionConfig | null;
  /** Initial selected value of the radio group. */
  defaultValue?: string | null;
  /** Layout direction of the radio items. */
  direction?: 'row' | 'col' | null;
  /** Disable interactions and apply disabled styles for the entire group. */
  disabled?: boolean | null;
  /** Mark the group as required for form submission. */
  required?: boolean | null;
}

/**
 * Form label associated with a field.
 */
export interface Label extends WidgetComponentBase {
  type: 'Label';
  /** Text content of the label. */
  value: string;
  /** Name of the field this label describes. */
  fieldName: string;
  /** Size of the label text; accepts a text size token. */
  size?: TextSize | null;
  /** Font weight; accepts a font weight token. */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | null;
  /** Horizontal text alignment. */
  textAlign?: TextAlign | null;
  /**
   * Text color; accepts a text color token, a primitive color token, a CSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  color?: string | ThemeColor | null;
}

/**
 * Date picker input component.
 */
export interface DatePicker extends WidgetComponentBase {
  type: 'DatePicker';
  /** The name of the form control field used when submitting forms. */
  name: string;
  /** Action dispatched when the date value changes. */
  onChangeAction?: ActionConfig | null;
  /** Placeholder text shown when no date is selected. */
  placeholder?: string | null;
  /** Initial value of the date picker. */
  defaultValue?: string | null;
  /** Earliest selectable date (inclusive). */
  min?: string | null;
  /** Latest selectable date (inclusive). */
  max?: string | null;
  /** Visual variant of the datepicker control. */
  variant?: ControlVariant | null;
  /** Controls the size of the datepicker control. */
  size?: ControlSize | null;
  /** Preferred side to render the calendar. */
  side?: 'top' | 'bottom' | 'left' | 'right' | null;
  /** Preferred alignment of the calendar relative to the control. */
  align?: 'start' | 'center' | 'end' | null;
  /** Determines if the datepicker should be fully rounded (pill). */
  pill?: boolean | null;
  /** Extend the datepicker to 100% of the available width. */
  block?: boolean | null;
  /** Show a clear control to unset the value. */
  clearable?: boolean | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
}
