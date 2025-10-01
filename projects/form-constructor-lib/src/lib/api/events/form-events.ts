import { FormSubmissionData, FormValidationResult } from '../../models/form-state.model';

/**
 * Base event interface for all form events
 */
export interface BaseFormEvent {
  /**
   * Unique identifier for the event
   */
  id: string;
  
  /**
   * Timestamp when the event occurred
   */
  timestamp: Date;
  
  /**
   * Type of the event
   */
  type: string;
  
  /**
   * Additional event data
   */
  data?: any;
}

/**
 * Form submit event interface
 */
export interface FormSubmitEvent extends BaseFormEvent {
  type: 'form:submit';
  
  /**
   * Form submission data
   */
  formData: FormSubmissionData;
  
  /**
   * Whether the submission was successful
   */
  success: boolean;
  
  /**
   * Error message if submission failed
   */
  error?: string;
  
  /**
   * Validation result
   */
  validationResult?: FormValidationResult;
}

/**
 * Form change event interface
 */
export interface FormChangeEvent extends BaseFormEvent {
  type: 'form:change';
  
  /**
   * ID of the form element that changed
   */
  elementId: string;
  
  /**
   * Name of the property that changed
   */
  propertyName: string;
  
  /**
   * Old value of the property
   */
  oldValue: any;
  
  /**
   * New value of the property
   */
  newValue: any;
  
  /**
   * Whether the change was made by the user (true) or programmatically (false)
   */
  userInitiated: boolean;
}

/**
 * Form validate event interface
 */
export interface FormValidateEvent extends BaseFormEvent {
  type: 'form:validate';
  
  /**
   * Validation result
   */
  validationResult: FormValidationResult;
  
  /**
   * Whether validation was triggered automatically (true) or manually (false)
   */
  autoTriggered: boolean;
  
  /**
   * ID of the element that triggered validation, if applicable
   */
  elementId?: string;
}

/**
 * Form reset event interface
 */
export interface FormResetEvent extends BaseFormEvent {
  type: 'form:reset';
  
  /**
   * Whether default values were kept
   */
  keepDefaultValues: boolean;
  
  /**
   * Whether validation errors were cleared
   */
  clearValidationErrors: boolean;
}

/**
 * Form initialize event interface
 */
export interface FormInitializeEvent extends BaseFormEvent {
  type: 'form:initialize';
  
  /**
   * Initial form data
   */
  initialData: FormSubmissionData;
  
  /**
   * Form configuration
   */
  config: any;
}

/**
 * Form destroy event interface
 */
export interface FormDestroyEvent extends BaseFormEvent {
  type: 'form:destroy';
  
  /**
   * Reason for destruction
   */
  reason: 'user_action' | 'page_unload' | 'programmatic';
}

/**
 * Form state change event interface
 */
export interface FormStateChangeEvent extends BaseFormEvent {
  type: 'form:stateChange';
  
  /**
   * Previous form state
   */
  previousState: any;
  
  /**
   * New form state
   */
  newState: any;
  
  /**
   * Type of state change
   */
  changeType: 'element_add' | 'element_remove' | 'element_update' | 'property_change' | 'structure_change';
}

/**
 * Form error event interface
 */
export interface FormErrorEvent extends BaseFormEvent {
  type: 'form:error';
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error details
   */
  details?: any;
  
  /**
   * Error severity
   */
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  /**
   * Whether the error is recoverable
   */
  recoverable: boolean;
}

/**
 * Form load event interface
 */
export interface FormLoadEvent extends BaseFormEvent {
  type: 'form:load';
  
  /**
   * Form data that was loaded
   */
  formData: FormSubmissionData;
  
  /**
   * Source of the loaded data (e.g., 'local_storage', 'api', 'file')
   */
  source: string;
  
  /**
   * Whether the load was successful
   */
  success: boolean;
  
  /**
   * Error message if load failed
   */
  error?: string;
}

/**
 * Form save event interface
 */
export interface FormSaveEvent extends BaseFormEvent {
  type: 'form:save';
  
  /**
   * Form data that was saved
   */
  formData: FormSubmissionData;
  
  /**
   * Target where the data was saved (e.g., 'local_storage', 'api', 'file')
   */
  target: string;
  
  /**
   * Whether the save was successful
   */
  success: boolean;
  
  /**
   * Error message if save failed
   */
  error?: string;
}

/**
 * Form render event interface
 */
export interface FormRenderEvent extends BaseFormEvent {
  type: 'form:render';
  
  /**
   * Render time in milliseconds
   */
  renderTime: number;
  
  /**
   * Number of elements rendered
   */
  elementCount: number;
  
  /**
   * Whether this is the initial render or a re-render
   */
  isInitialRender: boolean;
}

/**
 * Union type for all form events
 */
export type FormEvent = 
  | FormSubmitEvent
  | FormChangeEvent
  | FormValidateEvent
  | FormResetEvent
  | FormInitializeEvent
  | FormDestroyEvent
  | FormStateChangeEvent
  | FormErrorEvent
  | FormLoadEvent
  | FormSaveEvent
  | FormRenderEvent;