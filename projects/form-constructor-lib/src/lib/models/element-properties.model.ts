// Base interface for all element properties
export interface BaseElementProperties {
  id: string;
  type: string;
  label?: string;
  width?: string | number;
  height?: string | number;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  visible?: boolean;
  customClass?: string;
  style?: Record<string, string>;
  validation?: ValidationRules;
  layout?: LayoutProperties;
  customProperties?: Record<string, any>;
  // Inline editing properties
  isEditingLabel?: boolean;
  labelMinLength?: number;
  labelMaxLength?: number;
  labelRequired?: boolean;
}

// Extended base interface with additional common properties
export interface ExtendedElementProperties extends BaseElementProperties {
  name?: string;
  description?: string;
  tooltip?: string;
  placeholder?: string;
  defaultValue?: any;
  conditional?: ConditionalProperties;
  dependencies?: string[];
  events?: EventBindings;
}

// Conditional properties for showing/hiding elements
export interface ConditionalProperties {
  show?: ConditionalRule[];
  enable?: ConditionalRule[];
  require?: ConditionalRule[];
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Event bindings for element interactions
export interface EventBindings {
  onClick?: string;
  onChange?: string;
  onFocus?: string;
  onBlur?: string;
  onHover?: string;
  custom?: Record<string, string>;
}

// Layout properties for width and height configuration
export interface LayoutProperties {
  width?: DimensionValue;
  height?: DimensionValue;
  minWidth?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxHeight?: DimensionValue;
  autoExpand?: boolean;
}

// Dimension value with unit specification
export interface DimensionValue {
  value: number;
  unit: DimensionUnit;
}

// Supported dimension units
export type DimensionUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh';

// Validation rules interface
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  message: string;
  validator: string; // Function name or expression
}

// Placeholder style properties
export interface PlaceholderStyle {
  color?: string;
  fontSize?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
}

// Input element properties
export interface InputElementProperties extends ExtendedElementProperties {
  type: 'input';
  value?: string;
  placeholderStyle?: PlaceholderStyle;
  inputType?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  minLength?: number;
}

// Textarea element properties
export interface TextareaElementProperties extends ExtendedElementProperties {
  type: 'textarea';
  value?: string;
  placeholderStyle?: PlaceholderStyle;
  rows?: number;
  maxRows?: number;
  autoSize?: boolean;
  showCount?: boolean;
}

// Select element properties
export interface SelectElementProperties extends ExtendedElementProperties {
  type: 'select';
  value?: string | string[];
  options: SelectOption[];
  multiple?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  searchable?: boolean;
  optionFilterProp?: string;
  mode?: 'default' | 'multiple' | 'tags';
  maxTagCount?: number;
  maxTagPlaceholder?: string;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
  icon?: string;
  description?: string;
}

// Checkbox element properties
export interface CheckboxElementProperties extends ExtendedElementProperties {
  type: 'checkbox';
  checked?: boolean;
  indeterminate?: boolean;
  autoFocus?: boolean;
}

// Radio group element properties
export interface RadioGroupElementProperties extends ExtendedElementProperties {
  type: 'radio-group';
  value?: string;
  options: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  buttonStyle?: 'outline' | 'solid';
  size?: 'large' | 'default' | 'small';
}

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

// Button element properties
export interface ButtonElementProperties extends ExtendedElementProperties {
  type: 'button';
  text: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  htmlButtonType?: 'submit' | 'button' | 'reset';
  size?: 'large' | 'default' | 'small';
  shape?: 'circle' | 'round';
  icon?: string;
  loading?: boolean;
  action?: ButtonAction;
  block?: boolean;
  ghost?: boolean;
  danger?: boolean;
  href?: string;
  target?: string;
}

export interface ButtonAction {
  type: 'submit' | 'reset' | 'custom' | 'navigate';
  handler?: string; // Function name or expression
  url?: string; // For navigate type
  confirmation?: string; // Confirmation message
}

// Date picker element properties
export interface DatePickerElementProperties extends ExtendedElementProperties {
  type: 'date-picker';
  value?: Date | string;
  format?: string;
  disabledDate?: string; // Function name or expression
  showTime?: boolean;
  showToday?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year';
  ranges?: Record<string, [Date, Date]>;
}

// File upload element properties
export interface FileUploadElementProperties extends ExtendedElementProperties {
  type: 'file-upload';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxCount?: number;
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  customRequest?: string; // Function name or expression
}

// Switch element properties
export interface SwitchElementProperties extends ExtendedElementProperties {
  type: 'switch';
  checked?: boolean;
  checkedChildren?: string;
  unCheckedChildren?: string;
  loading?: boolean;
  size?: 'default' | 'small';
  autoFocus?: boolean;
}

// Slider element properties
export interface SliderElementProperties extends ExtendedElementProperties {
  type: 'slider';
  value?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  marks?: Record<number, string>;
  dots?: boolean;
  included?: boolean;
  range?: boolean;
  vertical?: boolean;
  sliderTooltip?: TooltipConfig;
}

export interface TooltipConfig {
  formatter?: string; // Function name or expression
  visible?: boolean;
  getPopupContainer?: string; // Function name or expression
}

// Rate element properties
export interface RateElementProperties extends ExtendedElementProperties {
  type: 'rate';
  value?: number;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  character?: string;
  tooltips?: string[];
}

// Divider element properties
export interface DividerElementProperties extends ExtendedElementProperties {
  type: 'divider';
  orientation?: 'left' | 'right' | 'center';
  dashed?: boolean;
  plain?: boolean;
}

// Image element properties
export interface ImageElementProperties extends ExtendedElementProperties {
  type: 'image';
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  preview?: boolean;
  fallback?: string;
  placeholder?: string;
}

// HTML element properties
export interface HtmlElementProperties extends ExtendedElementProperties {
  type: 'html';
  content?: string;
  sanitize?: boolean;
}

// Container element properties
export interface ContainerElementProperties extends ExtendedElementProperties {
  type: 'container';
  children?: string[]; // Array of element IDs
  containerLayout?: 'vertical' | 'horizontal' | 'grid';
  spacing?: number;
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  align?: 'start' | 'end' | 'center' | 'stretch';
  wrap?: boolean;
}

// Union type for all element properties
export type FormElementProperties =
  | InputElementProperties
  | TextareaElementProperties
  | SelectElementProperties
  | CheckboxElementProperties
  | RadioGroupElementProperties
  | ButtonElementProperties
  | DatePickerElementProperties
  | FileUploadElementProperties
  | SwitchElementProperties
  | SliderElementProperties
  | RateElementProperties
  | DividerElementProperties
  | ImageElementProperties
  | HtmlElementProperties
  | ContainerElementProperties;