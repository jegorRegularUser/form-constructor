import { FormElementProperties } from './element-properties.model';
import { FormProperties } from './form-properties.model';

/**
 * Element position in the form grid
 */
export interface ElementPosition {
  id: string;
  rowIndex: number;
  colIndex: number;
}

/**
 * Form state interface representing the complete state of the form
 */
export interface FormState {
  elements: FormElement[][];
  elementProperties: Record<string, FormElementProperties>;
  elementPositions: Record<string, ElementPosition>;
  formProperties: FormProperties;
  lastSaved: Date | null;
}

/**
 * Editor element interface for elements in the form builder
 */
export interface FormElement {
  id: string;
  type: string;
  label?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  visible?: boolean;
  customClass?: string;
  style?: Record<string, string>;
  validation?: any;
  layout?: any;
  customProperties?: Record<string, any>;
  // Type-specific properties
  value?: any;
  checked?: boolean;
  options?: any[];
  inputType?: string;
  rows?: number;
  maxRows?: number;
  autoSize?: boolean;
  showCount?: boolean;
  multiple?: boolean;
  selectAllowClear?: boolean;
  showSearch?: boolean;
  text?: string;
  buttonType?: string;
  htmlButtonType?: string;
  size?: string;
  shape?: string;
  icon?: string;
  loading?: boolean;
  action?: any;
  block?: boolean;
  ghost?: boolean;
  danger?: boolean;
  href?: string;
  target?: string;
  format?: string;
  disabledDate?: string;
  showTime?: boolean;
  showToday?: boolean;
  picker?: string;
  ranges?: Record<string, [Date, Date]>;
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  listType?: string;
  showUploadList?: boolean;
  customRequest?: string;
  checkedChildren?: string;
  unCheckedChildren?: string;
  min?: number;
  max?: number;
  step?: number;
  marks?: Record<number, string>;
  dots?: boolean;
  included?: boolean;
  range?: boolean;
  vertical?: boolean;
  sliderTooltip?: any;
  count?: number;
  allowHalf?: boolean;
  rateAllowClear?: boolean;
  character?: string;
  tooltips?: string[];
  orientation?: string;
  dashed?: boolean;
  plain?: boolean;
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  preview?: boolean;
  fallback?: string;
  content?: string;
  sanitize?: boolean;
  children?: string[];
  containerLayout?: string;
  spacing?: number;
  justify?: string;
  align?: string;
  wrap?: boolean;
}

/**
 * Form submission data interface
 */
export interface FormSubmissionData {
  [key: string]: any;
}

/**
 * Form validation result interface
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
  warnings?: FormValidationWarning[];
}

/**
 * Form validation error interface
 */
export interface FormValidationError {
  elementId: string;
  propertyName: string;
  message: string;
  value?: any;
}

/**
 * Form validation warning interface
 */
export interface FormValidationWarning {
  elementId: string;
  propertyName: string;
  message: string;
  value?: any;
}

/**
 * Form submit options interface
 */
export interface FormSubmitOptions {
  validateBeforeSubmit?: boolean;
  showValidationErrors?: boolean;
  resetOnSuccess?: boolean;
  customValidationFunction?: (data: FormSubmissionData) => FormValidationResult | Promise<FormValidationResult>;
}

/**
 * Form reset options interface
 */
export interface FormResetOptions {
  keepDefaultValues?: boolean;
  clearValidationErrors?: boolean;
}

/**
 * Element selection state interface
 */
export interface ElementSelectionState {
  selectedElement: FormElementProperties | null;
  selectionHistory: FormElementProperties[];
}

/**
 * Drag and drop state interface
 */
export interface DragDropState {
  isDragging: boolean;
  draggedElement: FormElement | null;
  dropTarget: FormElement | null;
  dragPosition: { x: number; y: number } | null;
}

/**
 * Property panel state interface
 */
export interface PropertyPanelState {
  isVisible: boolean;
  width: number | string;
  activeTab: string;
  expandedGroups: string[];
}

/**
 * Complete application state interface
 */
export interface AppState {
  formState: FormState;
  selectionState: ElementSelectionState;
  dragDropState: DragDropState;
  propertyPanelState: PropertyPanelState;
  validationState: FormValidationResult;
  isSubmitting: boolean;
  isSubmitted: boolean;
}