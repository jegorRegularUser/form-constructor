/**
 * Base event interface for all property events
 */
export interface BasePropertyEvent {
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
 * Property change event interface
 */
export interface PropertyChangeEvent extends BasePropertyEvent {
  type: 'property:change';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property that changed
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
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
  
  /**
   * Whether the change is still in progress (e.g., during typing)
   */
  isIntermediate: boolean;
}

/**
 * Form property change event interface
 */
export interface FormPropertyChangeEvent extends BasePropertyEvent {
  type: 'property:formChange';
  
  /**
   * ID of the form associated with the property
   */
  formId: string;
  
  /**
   * Name of the form property that changed
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
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
 * Property validate event interface
 */
export interface PropertyValidateEvent extends BasePropertyEvent {
  type: 'property:validate';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property being validated
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
  /**
   * Value that was validated
   */
  value: any;
  
  /**
   * Validation result
   */
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  /**
   * Whether validation was triggered automatically (true) or manually (false)
   */
  autoTriggered: boolean;
}

/**
 * Property panel event interface
 */
export interface PropertyPanelEvent extends BasePropertyEvent {
  type: 'property:panel';
  
  /**
   * Property panel event type
   */
  panelEventType: 'open' | 'close' | 'resize' | 'tabChange' | 'groupExpand' | 'groupCollapse';
  
  /**
   * ID of the selected element (if applicable)
   */
  elementId?: string;
  
  /**
   * ID of the active tab (if applicable)
   */
  activeTab?: string;
  
  /**
   * ID of the expanded/collapsed group (if applicable)
   */
  groupId?: string;
  
  /**
   * New width of the property panel (if applicable)
   */
  newWidth?: number;
  
  /**
   * Previous width of the property panel (if applicable)
   */
  previousWidth?: number;
}

/**
 * Property editor focus event interface
 */
export interface PropertyEditorFocusEvent extends BasePropertyEvent {
  type: 'property:editorFocus';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
  /**
   * Focus event type
   */
  focusType: 'focus' | 'blur';
  
  /**
   * Type of the property editor
   */
  editorType: string;
}

/**
 * Property error event interface
 */
export interface PropertyErrorEvent extends BasePropertyEvent {
  type: 'property:error';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
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
 * Property suggestion event interface
 */
export interface PropertySuggestionEvent extends BasePropertyEvent {
  type: 'property:suggestion';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
  /**
   * Current value of the property
   */
  currentValue: any;
  
  /**
   * Suggested value
   */
  suggestedValue: any;
  
  /**
   * Reason for the suggestion
   */
  reason: string;
  
  /**
   * Confidence level of the suggestion (0-1)
   */
  confidence: number;
  
  /**
   * Whether the suggestion was accepted
   */
  accepted?: boolean;
}

/**
 * Property batch change event interface
 */
export interface PropertyBatchChangeEvent extends BasePropertyEvent {
  type: 'property:batchChange';
  
  /**
   * Array of property changes
   */
  changes: Array<{
    elementId?: string;
    formId?: string;
    propertyName: string;
    propertyPath?: string;
    oldValue: any;
    newValue: any;
  }>;
  
  /**
   * Whether the changes were made by the user (true) or programmatically (false)
   */
  userInitiated: boolean;
  
  /**
   * Reason for the batch change
   */
  reason: 'undo' | 'redo' | 'paste' | 'import' | 'programmatic';
}

/**
 * Property reset event interface
 */
export interface PropertyResetEvent extends BasePropertyEvent {
  type: 'property:reset';
  
  /**
   * ID of the element associated with the property
   */
  elementId?: string;
  
  /**
   * ID of the form associated with the property (if applicable)
   */
  formId?: string;
  
  /**
   * Name of the property
   */
  propertyName: string;
  
  /**
   * Path to the property (for nested properties)
   */
  propertyPath?: string;
  
  /**
   * Value before reset
   */
  previousValue: any;
  
  /**
   * Value after reset
   */
  resetValue: any;
  
  /**
   * Default value that was used for reset
   */
  defaultValue: any;
  
  /**
   * Whether the reset was made by the user (true) or programmatically (false)
   */
  userInitiated: boolean;
}

/**
 * Union type for all property events
 */
export type PropertyEvent = 
  | PropertyChangeEvent
  | FormPropertyChangeEvent
  | PropertyValidateEvent
  | PropertyPanelEvent
  | PropertyEditorFocusEvent
  | PropertyErrorEvent
  | PropertySuggestionEvent
  | PropertyBatchChangeEvent
  | PropertyResetEvent;