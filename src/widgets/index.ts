/**
 * ChatKit Widget System
 *
 * This module provides TypeScript type definitions for all ChatKit widgets.
 * Widgets are JSON structures that describe UI components rendered by the ChatKit frontend.
 *
 * The backend creates widget descriptions, and the ChatKit CDN bundle renders them.
 *
 * @example
 * ```typescript
 * import { Card, Text, Button } from './widgets';
 *
 * const widget: Card = {
 *   type: 'Card',
 *   children: [
 *     {
 *       type: 'Text',
 *       value: 'Hello, World!',
 *       size: 'lg'
 *     },
 *     {
 *       type: 'Button',
 *       label: 'Click me',
 *       variant: 'primary'
 *     }
 *   ]
 * };
 * ```
 */

// ============================================================================
// Re-export all common types
// ============================================================================

export type {
  ThemeColor,
  Spacing,
  Border,
  Borders,
  MinMax,
  EditableProps,
  WidgetStatusWithFavicon,
  WidgetStatusWithIcon,
  WidgetStatus,
  CardAction,
  SelectOption,
  RadioOption,
  RadiusValue,
  TextAlign,
  TextSize,
  IconSize,
  TitleSize,
  CaptionSize,
  Alignment,
  Justification,
  ControlVariant,
  ControlSize,
  WidgetIcon,
  WidgetComponentBase,
  BoxBase,
} from './common.js';

// ============================================================================
// Re-export all widget components
// ============================================================================

export type { Text, Title, Caption, Markdown, Badge, Icon, Image } from './content.js';

export type { Card, Box, Row, Col, Form, Divider, Spacer, ListViewItem, ListView } from './layout.js';

export type { Button } from './interactive.js';

export type {
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Label,
  DatePicker,
} from './form.js';

export type {
  Chart,
  Transition,
  BarSeries,
  AreaSeries,
  LineSeries,
  Series,
  XAxisConfig,
  CurveType,
} from './advanced.js';

// ============================================================================
// Import for union types
// ============================================================================

import type { Text, Title, Caption, Markdown, Badge, Icon, Image } from './content.js';
import type { Card, Box, Row, Col, Form, Divider, Spacer, ListViewItem, ListView } from './layout.js';
import type { Button } from './interactive.js';
import type { Input, Textarea, Select, Checkbox, RadioGroup, Label, DatePicker } from './form.js';
import type { Chart, Transition } from './advanced.js';

// ============================================================================
// Union types for widgets
// ============================================================================

/**
 * Union of all renderable widget components.
 *
 * This type represents any widget that can be used as a child in container widgets.
 */
export type WidgetComponent =
  | Text
  | Title
  | Caption
  | Markdown
  | Badge
  | Icon
  | Image
  | Box
  | Row
  | Col
  | Form
  | Divider
  | Spacer
  | ListViewItem
  | Button
  | Input
  | Textarea
  | Select
  | Checkbox
  | RadioGroup
  | Label
  | DatePicker
  | Chart
  | Transition;

/**
 * Union of valid root-level widget containers.
 *
 * These widgets can be used as the top-level widget in a WidgetItem.
 */
export type WidgetRoot = Card | ListView;
