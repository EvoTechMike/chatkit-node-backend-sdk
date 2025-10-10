/**
 * Advanced widgets for ChatKit.
 *
 * These widgets provide complex functionality like charts and transitions.
 */

import type { WidgetComponentBase, ThemeColor } from './common.js';

// Forward declaration
type WidgetComponent = any;

/**
 * Interpolation curve types for area and line series.
 */
export type CurveType =
  | 'basis'
  | 'basisClosed'
  | 'basisOpen'
  | 'bumpX'
  | 'bumpY'
  | 'bump'
  | 'linear'
  | 'linearClosed'
  | 'natural'
  | 'monotoneX'
  | 'monotoneY'
  | 'monotone'
  | 'step'
  | 'stepBefore'
  | 'stepAfter';

/**
 * Configuration object for the X axis.
 */
export interface XAxisConfig {
  /** Field name from each data row to use for X-axis categories. */
  dataKey: string;
  /** Hide the X axis line, ticks, and labels when true. */
  hide?: boolean;
  /** Custom mapping of tick values to display labels. */
  labels?: Record<string, string>;
}

/**
 * A bar series plotted from a numeric dataKey. Supports stacking.
 */
export interface BarSeries {
  type: 'bar';
  /** Legend label for the series. */
  label?: string | null;
  /** Field name from each data row that contains the numeric value. */
  dataKey: string;
  /** Optional stack group ID. Series with the same ID stack together. */
  stack?: string | null;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware { light, dark }.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token, e.g., `red-100`, `blue-900`, `gray-500`
   *
   * Note: By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor | null;
}

/**
 * An area series plotted from a numeric dataKey. Supports stacking and curves.
 */
export interface AreaSeries {
  type: 'area';
  /** Legend label for the series. */
  label?: string | null;
  /** Field name from each data row that contains the numeric value. */
  dataKey: string;
  /** Optional stack group ID. Series with the same ID stack together. */
  stack?: string | null;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware { light, dark }.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token, e.g., `red-100`, `blue-900`, `gray-500`
   *
   * Note: By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor | null;
  /** Interpolation curve type used to connect points. */
  curveType?: CurveType | null;
}

/**
 * A line series plotted from a numeric dataKey. Supports curves.
 */
export interface LineSeries {
  type: 'line';
  /** Legend label for the series. */
  label?: string | null;
  /** Field name from each data row that contains the numeric value. */
  dataKey: string;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware { light, dark }.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token, e.g., `red-100`, `blue-900`, `gray-500`
   *
   * Note: By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor | null;
  /** Interpolation curve type used to connect points. */
  curveType?: CurveType | null;
}

/**
 * Union of all supported chart series types.
 */
export type Series = BarSeries | AreaSeries | LineSeries;

/**
 * Data visualization component for simple bar/line/area charts.
 */
export interface Chart extends WidgetComponentBase {
  type: 'Chart';
  /** Tabular data for the chart, where each row maps field names to values. */
  data: Array<Record<string, string | number>>;
  /** One or more series definitions that describe how to visualize data fields. */
  series: Series[];
  /** X-axis configuration; either a dataKey string or a config object. */
  xAxis: string | XAxisConfig;
  /** Controls whether the Y axis is rendered. */
  showYAxis?: boolean | null;
  /** Controls whether a legend is rendered. */
  showLegend?: boolean | null;
  /** Controls whether a tooltip is rendered when hovering over a datapoint. */
  showTooltip?: boolean | null;
  /** Gap between bars within the same category (in px). */
  barGap?: number | null;
  /** Gap between bar categories/groups (in px). */
  barCategoryGap?: number | null;
  /** Flex growth/shrink factor for layout. */
  flex?: number | string | null;
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
  /** Aspect ratio of the chart area (e.g., 16/9); number or CSS string. */
  aspectRatio?: number | string | null;
}

/**
 * Wrapper enabling transitions for a child component.
 */
export interface Transition extends WidgetComponentBase {
  type: 'Transition';
  /** The child component to animate layout changes for. */
  children?: WidgetComponent | null;
}
