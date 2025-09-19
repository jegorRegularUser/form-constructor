/**
 * Core component models for the form constructor application
 */

export type ComponentType = 
  | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'button' | 'container' | 'grid' | 'flex' | 'card'
  | 'label' | 'divider' | 'spacer';

export type LayoutType = 'block' | 'flex' | 'grid' | 'inline';

export interface ComponentProperties {
  [key: string]: any;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  cssClasses?: string[];
  customAttributes?: { [key: string]: string };
}

export interface ResponsiveStyles {
  mobile?: { [property: string]: string };
  tablet?: { [property: string]: string };
  desktop?: { [property: string]: string };
}

export interface ComponentStyling {
  classes?: string[];
  styles?: { [property: string]: string };
  responsive?: ResponsiveStyles;
  theme?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  value?: any;
  message: string;
  errorCode?: string;
}

export interface ComponentEvent {
  type: 'click' | 'change' | 'focus' | 'blur' | 'input' | 'submit';
  handler: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  parameters?: any[];
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  label: string;
  properties: ComponentProperties;
  validation?: ValidationRule[];
  styling: ComponentStyling;
  events?: ComponentEvent[];
  metadata?: {
    created: Date;
    modified: Date;
    version: string;
    author?: string;
  };
}

export interface FormComponent extends BaseComponent {
  formControlName?: string;
  validators?: ValidatorConfig[];
  errorMessages?: { [key: string]: string };
  valueType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

export interface ContainerComponent extends BaseComponent {
  children: BaseComponent[];
  layout: LayoutType;
  gridConfig?: GridConfiguration;
  flexConfig?: FlexConfiguration;
  allowedChildTypes?: ComponentType[];
  maxChildren?: number;
}

export interface GridConfiguration {
  columns: number;
  rows?: number;
  gap?: string;
  templateColumns?: string;
  templateRows?: string;
  areas?: string[];
}

export interface FlexConfiguration {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  gap?: string;
}

export interface ValidatorConfig {
  name: string;
  options?: any;
  message?: string;
}

export interface ComponentStructure {
  id: string;
  name: string;
  selector: string;
  className: string;
  components: BaseComponent[];
  globalStyles?: string;
  imports?: string[];
  dependencies?: string[];
}

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  label: string;
  category: string;
  icon?: string;
  description?: string;
  properties: PropertyDefinition[];
  defaultStyling: ComponentStyling;
  template: ComponentTemplate;
  preview?: PreviewConfig;
}

export interface PropertyDefinition {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'spacing' | 'array' | 'object';
  label: string;
  description?: string;
  defaultValue?: any;
  options?: SelectOption[];
  validators?: ValidatorConfig[];
  group?: string;
  conditional?: ConditionalDisplay;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ConditionalDisplay {
  property: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains';
  value: any;
}

export interface ComponentTemplate {
  html: string;
  css?: string;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: string;
  defaultValue: any;
  description?: string;
}

export interface PreviewConfig {
  width?: string;
  height?: string;
  thumbnail?: string;
  mockData?: any;
}

// Export utility types
export type ComponentWithChildren = ContainerComponent;
export type FormElements = FormComponent;
export type AllComponents = BaseComponent | FormComponent | ContainerComponent;