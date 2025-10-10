/**
 * Widget types - UI components for rich interactions
 *
 * This module re-exports all widget types from the widgets directory.
 * The comprehensive widget definitions match the Python ChatKit SDK.
 */

// Re-export all widget types from the widgets module
export type {
  // Common types
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
  // Content widgets
  Text,
  Title,
  Caption,
  Markdown,
  Badge,
  Icon,
  Image,
  // Layout widgets
  Card,
  Box,
  Row,
  Col,
  Form,
  Divider,
  Spacer,
  ListViewItem,
  ListView,
  // Interactive widgets
  Button,
  // Form widgets
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Label,
  DatePicker,
  // Advanced widgets
  Chart,
  Transition,
  BarSeries,
  AreaSeries,
  LineSeries,
  Series,
  XAxisConfig,
  CurveType,
  // Union types
  WidgetComponent,
  WidgetRoot,
} from '../widgets/index.js';

// Re-export ActionConfig for convenience
export type { ActionConfig } from './actions.js';
