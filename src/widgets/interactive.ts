/**
 * Interactive widgets for ChatKit.
 *
 * These widgets handle user interactions.
 */

import type { ActionConfig } from '../types/actions.js';
import type { WidgetComponentBase, WidgetIcon, ControlVariant, ControlSize } from './common.js';

/**
 * Button component optionally wired to an action.
 */
export interface Button extends WidgetComponentBase {
  type: 'Button';
  /** Configure the button as a submit button for the nearest form. */
  submit?: boolean | null;
  /** Text to display inside the button. */
  label?: string | null;
  /** Action dispatched on click. */
  onClickAction?: ActionConfig | null;
  /** Icon shown before the label; can be used for icon-only buttons. */
  iconStart?: WidgetIcon | null;
  /** Optional icon shown after the label. */
  iconEnd?: WidgetIcon | null;
  /** Convenience preset for button style. */
  style?: 'primary' | 'secondary' | null;
  /** Controls the size of icons within the button; accepts an icon size token. */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null;
  /** Color of the button; accepts a button color token. */
  color?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'discovery'
    | 'success'
    | 'caution'
    | 'warning'
    | 'danger'
    | null;
  /** Visual variant of the button; accepts a control variant token. */
  variant?: ControlVariant | null;
  /** Controls the overall size of the button. */
  size?: ControlSize | null;
  /** Determines if the button should be fully rounded (pill). */
  pill?: boolean | null;
  /** Determines if the button should have matching width and height. */
  uniform?: boolean | null;
  /** Extend the button to 100% of the available width. */
  block?: boolean | null;
  /** Disable interactions and apply disabled styles. */
  disabled?: boolean | null;
}
