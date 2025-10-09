# ChatKit Widgets

This reference is generated from the `chatkit-node/widgets` module. Every component inherits the common props `id`, `key`, and `type`. Optional props default to `null` or `undefined` unless noted.

## Badge

Small badge indicating status or categorization.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Badge'` | 'Badge' |
| `label` | `string` |  |
| `color` | `'secondary' \| 'success' \| 'danger' \| 'warning' \| 'info' \| 'discovery' \| null` | null |
| `variant` | `'solid' \| 'soft' \| 'outline' \| null` | null |
| `size` | `'sm' \| 'md' \| 'lg' \| null` | null |
| `pill` | `boolean \| null` | null |

## Box

Generic flex container with direction control.

| Field | Type | Default |
| --- | --- | --- |
| `children` | `WidgetComponent[] \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch' \| null` | null |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' \| 'stretch' \| null` | null |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse' \| null` | null |
| `flex` | `number \| string \| null` | null |
| `gap` | `number \| string \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `padding` | `number \| string \| Spacing \| null` | null |
| `margin` | `number \| string \| Spacing \| null` | null |
| `border` | `number \| Border \| Borders \| null` | null |
| `radius` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| 'full' \| '100%' \| 'none' \| null` | null |
| `background` | `string \| ThemeColor \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Box'` | 'Box' |
| `direction` | `'row' \| 'col' \| null` | null |

## Button

Button component optionally wired to an action.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Button'` | 'Button' |
| `submit` | `boolean \| null` | null |
| `label` | `string \| null` | null |
| `onClickAction` | `ActionConfig \| null` | null |
| `iconStart` | `WidgetIcon \| null` | null |
| `iconEnd` | `WidgetIcon \| null` | null |
| `style` | `'primary' \| 'secondary' \| null` | null |
| `iconSize` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| null` | null |
| `color` | `'primary' \| 'secondary' \| 'info' \| 'discovery' \| 'success' \| 'caution' \| 'warning' \| 'danger' \| null` | null |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost' \| null` | null |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |
| `pill` | `boolean \| null` | null |
| `uniform` | `boolean \| null` | null |
| `block` | `boolean \| null` | null |
| `disabled` | `boolean \| null` | null |

## Caption

Widget rendering supporting caption text.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Caption'` | 'Caption' |
| `value` | `string` |  |
| `color` | `string \| ThemeColor \| null` | null |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold' \| null` | null |
| `size` | `'sm' \| 'md' \| 'lg' \| null` | null |
| `textAlign` | `'start' \| 'center' \| 'end' \| null` | null |
| `truncate` | `boolean \| null` | null |
| `maxLines` | `number \| null` | null |

## Card

Versatile container used for structuring widget content.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Card'` | 'Card' |
| `asForm` | `boolean \| null` | null |
| `children` | `WidgetComponent[]` |  |
| `background` | `string \| ThemeColor \| null` | null |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full' \| null` | null |
| `padding` | `number \| string \| Spacing \| null` | null |
| `status` | `WidgetStatusWithFavicon \| WidgetStatusWithIcon \| null` | null |
| `collapsed` | `boolean \| null` | null |
| `confirm` | `CardAction \| null` | null |
| `cancel` | `CardAction \| null` | null |
| `theme` | `'light' \| 'dark' \| null` | null |

## Chart

Data visualization component for simple bar/line/area charts.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Chart'` | 'Chart' |
| `data` | `Record<string, string \| number>[]` |  |
| `series` | `Series[]` |  |
| `xAxis` | `string \| XAxisConfig` |  |
| `showYAxis` | `boolean \| null` | null |
| `showLegend` | `boolean \| null` | null |
| `showTooltip` | `boolean \| null` | null |
| `barGap` | `number \| null` | null |
| `barCategoryGap` | `number \| null` | null |
| `flex` | `number \| string \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |

## Checkbox

Checkbox input component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Checkbox'` | 'Checkbox' |
| `name` | `string` |  |
| `label` | `string \| null` | null |
| `defaultChecked` | `string \| null` | null |
| `onChangeAction` | `ActionConfig \| null` | null |
| `disabled` | `boolean \| null` | null |
| `required` | `boolean \| null` | null |

## Col

Vertical flex container.

| Field | Type | Default |
| --- | --- | --- |
| `children` | `WidgetComponent[] \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch' \| null` | null |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' \| 'stretch' \| null` | null |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse' \| null` | null |
| `flex` | `number \| string \| null` | null |
| `gap` | `number \| string \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `padding` | `number \| string \| Spacing \| null` | null |
| `margin` | `number \| string \| Spacing \| null` | null |
| `border` | `number \| Border \| Borders \| null` | null |
| `radius` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| 'full' \| '100%' \| 'none' \| null` | null |
| `background` | `string \| ThemeColor \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Col'` | 'Col' |

## DatePicker

Date picker input component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'DatePicker'` | 'DatePicker' |
| `name` | `string` | |
| `onChangeAction` | `ActionConfig \| null` | null |
| `placeholder` | `string \| null` | null |
| `defaultValue` | `Date \| null` | null |
| `min` | `Date \| null` | null |
| `max` | `Date \| null` | null |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost' \| null` | null |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right' \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| null` | null |
| `pill` | `boolean \| null` | null |
| `block` | `boolean \| null` | null |
| `clearable` | `boolean \| null` | null |
| `disabled` | `boolean \| null` | null |

## Divider

Visual divider separating content sections.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Divider'` | 'Divider' |
| `color` | `string \| ThemeColor \| null` | null |
| `size` | `number \| string \| null` | null |
| `spacing` | `number \| string \| null` | null |
| `flush` | `boolean \| null` | null |

## Form

Form wrapper capable of submitting `onSubmitAction`.

| Field | Type | Default |
| --- | --- | --- |
| `children` | `WidgetComponent[] \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch' \| null` | null |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' \| 'stretch' \| null` | null |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse' \| null` | null |
| `flex` | `number \| string \| null` | null |
| `gap` | `number \| string \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `padding` | `number \| string \| Spacing \| null` | null |
| `margin` | `number \| string \| Spacing \| null` | null |
| `border` | `number \| Border \| Borders \| null` | null |
| `radius` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| 'full' \| '100%' \| 'none' \| null` | null |
| `background` | `string \| ThemeColor \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Form'` | 'Form' |
| `onSubmitAction` | `ActionConfig \| null` | null |
| `direction` | `'row' \| 'col' \| null` | null |

## Icon

Icon component referencing a built-in icon name.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Icon'` | 'Icon' |
| `name` | `WidgetIcon` | |
| `color` | `string \| ThemeColor \| null` | null |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |

## Image

Image component with sizing and fitting controls.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Image'` | 'Image' |
| `src` | `string` | |
| `alt` | `string \| null` | null |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'scale-down' \| 'none' \| null` | null |
| `position` | `'top left' \| 'top' \| 'top right' \| 'left' \| 'center' \| 'right' \| 'bottom left' \| 'bottom' \| 'bottom right' \| null` | null |
| `radius` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| 'full' \| '100%' \| 'none' \| null` | null |
| `frame` | `boolean \| null` | null |
| `flush` | `boolean \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `margin` | `number \| string \| Spacing \| null` | null |
| `background` | `string \| ThemeColor \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |
| `flex` | `number \| string \| null` | null |

## Input

Single-line text input component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Input'` | 'Input' |
| `name` | `string` | |
| `inputType` | `'number' \| 'email' \| 'text' \| 'password' \| 'tel' \| 'url' \| null` | null |
| `defaultValue` | `string \| null` | null |
| `required` | `boolean \| null` | null |
| `pattern` | `string \| null` | null |
| `placeholder` | `string \| null` | null |
| `allowAutofillExtensions` | `boolean \| null` | null |
| `autoSelect` | `boolean \| null` | null |
| `autoFocus` | `boolean \| null` | null |
| `disabled` | `boolean \| null` | null |
| `variant` | `'soft' \| 'outline' \| null` | null |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |
| `gutterSize` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| null` | null |
| `pill` | `boolean \| null` | null |

## Label

Form label associated with a field.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Label'` | 'Label' |
| `value` | `string` | |
| `fieldName` | `string` | |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| null` | null |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold' \| null` | null |
| `textAlign` | `'start' \| 'center' \| 'end' \| null` | null |
| `color` | `string \| ThemeColor \| null` | null |

## ListView

Container component for rendering collections of list items.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'ListView'` | 'ListView' |
| `children` | `ListViewItem[]` | |
| `limit` | `number \| 'auto' \| null` | null |
| `status` | `WidgetStatusWithFavicon \| WidgetStatusWithIcon \| null` | null |
| `theme` | `'light' \| 'dark' \| null` | null |

## ListViewItem

Single row inside a `ListView` component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'ListViewItem'` | 'ListViewItem' |
| `children` | `WidgetComponent[]` | |
| `onClickAction` | `ActionConfig \| null` | null |
| `gap` | `number \| string \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch' \| null` | null |

## Markdown

Widget rendering Markdown content, optionally streamed.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Markdown'` | 'Markdown' |
| `value` | `string` | |
| `streaming` | `boolean \| null` | null |

## RadioGroup

Grouped radio input control.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'RadioGroup'` | 'RadioGroup' |
| `name` | `string` | |
| `options` | `RadioOption[] \| null` | null |
| `ariaLabel` | `string \| null` | null |
| `onChangeAction` | `ActionConfig \| null` | null |
| `defaultValue` | `string \| null` | null |
| `direction` | `'row' \| 'col' \| null` | null |
| `disabled` | `boolean \| null` | null |
| `required` | `boolean \| null` | null |

## Row

Horizontal flex container.

| Field | Type | Default |
| --- | --- | --- |
| `children` | `WidgetComponent[] \| null` | null |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch' \| null` | null |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly' \| 'stretch' \| null` | null |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse' \| null` | null |
| `flex` | `number \| string \| null` | null |
| `gap` | `number \| string \| null` | null |
| `height` | `number \| string \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `number \| string \| null` | null |
| `minHeight` | `number \| string \| null` | null |
| `minWidth` | `number \| string \| null` | null |
| `minSize` | `number \| string \| null` | null |
| `maxHeight` | `number \| string \| null` | null |
| `maxWidth` | `number \| string \| null` | null |
| `maxSize` | `number \| string \| null` | null |
| `padding` | `number \| string \| Spacing \| null` | null |
| `margin` | `number \| string \| Spacing \| null` | null |
| `border` | `number \| Border \| Borders \| null` | null |
| `radius` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| 'full' \| '100%' \| 'none' \| null` | null |
| `background` | `string \| ThemeColor \| null` | null |
| `aspectRatio` | `number \| string \| null` | null |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Row'` | 'Row' |

## Select

Select dropdown component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Select'` | 'Select' |
| `name` | `string` | |
| `options` | `SelectOption[]` |  |
| `onChangeAction` | `ActionConfig \| null` | null |
| `placeholder` | `string \| null` | null |
| `defaultValue` | `string \| null` | null |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost' \| null` | null |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |
| `pill` | `boolean \| null` | null |
| `block` | `boolean \| null` | null |
| `clearable` | `boolean \| null` | null |
| `disabled` | `boolean \| null` | null |

## Spacer

Flexible spacer used to push content apart.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Spacer'` | 'Spacer' |
| `minSize` | `number \| string \| null` | null |

## Text

Widget rendering plain text with typography controls.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Text'` | 'Text' |
| `value` | `string` | |
| `streaming` | `boolean \| null` | null |
| `italic` | `boolean \| null` | null |
| `lineThrough` | `boolean \| null` | null |
| `color` | `string \| ThemeColor \| null` | null |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold' \| null` | null |
| `width` | `number \| string \| null` | null |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| null` | null |
| `textAlign` | `'start' \| 'center' \| 'end' \| null` | null |
| `truncate` | `boolean \| null` | null |
| `minLines` | `number \| null` | null |
| `maxLines` | `number \| null` | null |
| `editable` | `false \| EditableProps \| null` | null |

## Textarea

Multiline text input component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Textarea'` | 'Textarea' |
| `name` | `string` |  |
| `defaultValue` | `string \| null` | null |
| `required` | `boolean \| null` | null |
| `pattern` | `string \| null` | null |
| `placeholder` | `string \| null` | null |
| `autoSelect` | `boolean \| null` | null |
| `autoFocus` | `boolean \| null` | null |
| `disabled` | `boolean \| null` | null |
| `variant` | `'soft' \| 'outline' \| null` | null |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| null` | null |
| `gutterSize` | `'2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| null` | null |
| `rows` | `number \| null` | null |
| `autoResize` | `boolean \| null` | null |
| `maxRows` | `number \| null` | null |
| `allowAutofillExtensions` | `boolean \| null` | null |

## Title

Widget rendering prominent headline text.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Title'` | 'Title' |
| `value` | `string` |  |
| `color` | `string \| ThemeColor \| null` | null |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold' \| null` | null |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl' \| null` | null |
| `textAlign` | `'start' \| 'center' \| 'end' \| null` | null |
| `truncate` | `boolean \| null` | null |
| `maxLines` | `number \| null` | null |

## Transition

Wrapper enabling transitions for a child component.

| Field | Type | Default |
| --- | --- | --- |
| `key` | `string \| null` | null |
| `id` | `string \| null` | null |
| `type` | `'Transition'` | 'Transition' |
| `children` | `WidgetComponent \| null` |  |
