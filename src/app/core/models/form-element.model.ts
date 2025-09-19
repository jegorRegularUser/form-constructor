/**
 * Form-specific element models and interfaces
 */

import { BaseComponent, FormComponent, ValidationRule, ComponentProperties } from './component.model';

// Input field specific interfaces
export interface InputFieldComponent extends FormComponent {
  type: 'input';
  inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  properties: InputFieldProperties;
}

export interface InputFieldProperties extends ComponentProperties {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: number; // for number inputs
  min?: number | string; // for number/date inputs
  max?: number | string; // for number/date inputs
  autocomplete?: string;
  spellcheck?: boolean;
}

// Textarea specific interfaces
export interface TextareaComponent extends FormComponent {
  type: 'textarea';
  properties: TextareaProperties;
}

export interface TextareaProperties extends ComponentProperties {
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  wrap?: 'hard' | 'soft';
}

// Select dropdown specific interfaces
export interface SelectComponent extends FormComponent {
  type: 'select';
  properties: SelectProperties;
}

export interface SelectProperties extends ComponentProperties {
  options: SelectOption[];
  multiple?: boolean;
  size?: number; // for multiple selects
  optgroups?: SelectOptgroup[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface SelectOptgroup {
  label: string;
  disabled?: boolean;
  options: SelectOption[];
}

// Checkbox specific interfaces
export interface CheckboxComponent extends FormComponent {
  type: 'checkbox';
  properties: CheckboxProperties;
}

export interface CheckboxProperties extends ComponentProperties {
  checked?: boolean;
  value?: string;
  indeterminate?: boolean;
}

// Radio button specific interfaces
export interface RadioComponent extends FormComponent {
  type: 'radio';
  properties: RadioProperties;
}

export interface RadioProperties extends ComponentProperties {
  name: string; // Required for radio groups
  value: string;
  checked?: boolean;
  options?: RadioOption[];
}

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  checked?: boolean;
}

// Button specific interfaces
export interface ButtonComponent extends BaseComponent {
  type: 'button';
  properties: ButtonProperties;
  actionType: 'submit' | 'reset' | 'button' | 'custom';
}

export interface ButtonProperties extends ComponentProperties {
  text: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

// Label specific interfaces
export interface LabelComponent extends BaseComponent {
  type: 'label';
  properties: LabelProperties;
}

export interface LabelProperties extends ComponentProperties {
  text: string;
  for?: string; // Associated form control ID
  required?: boolean; // Show required indicator
}

// Container/Layout specific interfaces
export interface FormContainerComponent extends BaseComponent {
  type: 'container' | 'grid' | 'flex';
  properties: ContainerProperties;
  children: FormElementType[];
}

export interface ContainerProperties extends ComponentProperties {
  layout: 'block' | 'flex' | 'grid';
  gap?: string;
  padding?: string;
  margin?: string;
  background?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
}

// Grid layout specific interfaces
export interface GridContainerComponent extends Omit<FormContainerComponent, 'type'> {
  type: 'grid';
  properties: GridContainerProperties;
}

export interface GridContainerProperties extends ContainerProperties {
  columns: number;
  rows?: number;
  columnGap?: string;
  rowGap?: string;
  templateColumns?: string;
  templateRows?: string;
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
}

// Flex layout specific interfaces
export interface FlexContainerComponent extends Omit<FormContainerComponent, 'type'> {
  type: 'flex';
  properties: FlexContainerProperties;
}

export interface FlexContainerProperties extends ContainerProperties {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  gap?: string;
}

// Union type for all form elements
export type FormElementType = 
  | InputFieldComponent
  | TextareaComponent
  | SelectComponent
  | CheckboxComponent
  | RadioComponent
  | ButtonComponent
  | LabelComponent
  | FormContainerComponent
  | GridContainerComponent
  | FlexContainerComponent;

// Form validation specific interfaces
export interface FormValidationConfig {
  enableClientSideValidation: boolean;
  enableServerSideValidation: boolean;
  showErrorsOnSubmit: boolean;
  showErrorsOnBlur: boolean;
  showErrorsOnChange: boolean;
  errorDisplayStyle: 'inline' | 'tooltip' | 'modal';
  customValidators?: CustomValidator[];
}

export interface CustomValidator {
  name: string;
  function: string; // Function body as string
  message: string;
  async?: boolean;
}

// Form submission interfaces
export interface FormSubmissionConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  action?: string;
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: '_self' | '_blank' | '_parent' | '_top';
  novalidate?: boolean;
  onSubmit?: string; // Function name or code
  onSuccess?: string;
  onError?: string;
}

// Complete form structure
export interface FormStructure {
  id: string;
  name: string;
  title?: string;
  description?: string;
  elements: FormElementType[];
  validation: FormValidationConfig;
  submission: FormSubmissionConfig;
  styling: FormStyling;
  metadata: FormMetadata;
}

export interface FormStyling {
  theme?: string;
  customCSS?: string;
  responsive: boolean;
  breakpoints?: ResponsiveBreakpoints;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface FormMetadata {
  version: string;
  created: Date;
  modified: Date;
  author?: string;
  tags?: string[];
  category?: string;
  isTemplate?: boolean;
}

// Form builder state management
export interface FormBuilderState {
  currentForm: FormStructure | null;
  selectedElement: FormElementType | null;
  undoStack: FormStructure[];
  redoStack: FormStructure[];
  isDirty: boolean;
  isLoading: boolean;
  lastSaved?: Date;
}

// Export specific interfaces for forms
export interface FormExportOptions {
  includeValidation: boolean;
  includeSubmissionHandling: boolean;
  generateFormModule: boolean;
  generateFormService: boolean;
  generateValidators: boolean;
  targetAngularVersion: string;
  useReactiveForms: boolean;
  useTemplateDrivenForms: boolean;
}

export interface GeneratedFormFiles {
  component: {
    typescript: string;
    html: string;
    css: string;
    spec?: string;
  };
  service?: {
    typescript: string;
    spec?: string;
  };
  validators?: {
    typescript: string;
    spec?: string;
  };
  module?: {
    typescript: string;
  };
}

// Utility types
export type FormElementCategory = 'input' | 'selection' | 'action' | 'layout' | 'display';
export type ValidationTrigger = 'blur' | 'change' | 'submit' | 'manual';
export type FormFieldState = 'valid' | 'invalid' | 'pending' | 'pristine' | 'dirty' | 'touched' | 'untouched';

// Helper functions type definitions
export interface FormElementFactory {
  createInputField(config: Partial<InputFieldComponent>): InputFieldComponent;
  createTextarea(config: Partial<TextareaComponent>): TextareaComponent;
  createSelect(config: Partial<SelectComponent>): SelectComponent;
  createCheckbox(config: Partial<CheckboxComponent>): CheckboxComponent;
  createRadio(config: Partial<RadioComponent>): RadioComponent;
  createButton(config: Partial<ButtonComponent>): ButtonComponent;
  createContainer(config: Partial<FormContainerComponent>): FormContainerComponent;
}

export interface FormValidator {
  validate(element: FormElementType): ValidationResult;
  validateForm(form: FormStructure): FormValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface FormValidationResult {
  isValid: boolean;
  elementResults: Map<string, ValidationResult>;
  globalErrors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  elementId?: string;
  propertyName?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
  elementId?: string;
}