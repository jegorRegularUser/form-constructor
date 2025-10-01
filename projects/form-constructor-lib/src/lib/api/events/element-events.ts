import { FormElementProperties } from '../../models/element-properties.model';

/**
 * Base event interface for all element events
 */
export interface BaseElementEvent {
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
   * ID of the element associated with the event
   */
  elementId: string;
  
  /**
   * Type of the element associated with the event
   */
  elementType: string;
  
  /**
   * Additional event data
   */
  data?: any;
}

/**
 * Element create event interface
 */
export interface ElementCreateEvent extends BaseElementEvent {
  type: 'element:create';
  
  /**
   * Properties of the created element
   */
  element: FormElementProperties;
  
  /**
   * Position where the element was created
   */
  position: {
    rowIndex: number;
    colIndex: number;
  };
  
  /**
   * Whether the element was created by the user (true) or programmatically (false)
   */
  userInitiated: boolean;
}

/**
 * Element update event interface
 */
export interface ElementUpdateEvent extends BaseElementEvent {
  type: 'element:update';
  
  /**
   * Name of the property that was updated
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
   * Whether the update was made by the user (true) or programmatically (false)
   */
  userInitiated: boolean;
}

/**
 * Element delete event interface
 */
export interface ElementDeleteEvent extends BaseElementEvent {
  type: 'element:delete';
  
  /**
   * Properties of the deleted element
   */
  element: FormElementProperties;
  
  /**
   * Position from which the element was deleted
   */
  position: {
    rowIndex: number;
    colIndex: number;
  };
  
  /**
   * Whether the deletion was confirmed by the user
   */
  confirmed: boolean;
  
  /**
   * Reason for deletion
   */
  reason: 'user_action' | 'programmatic';
}

/**
 * Element select event interface
 */
export interface ElementSelectEvent extends BaseElementEvent {
  type: 'element:select';
  
  /**
   * Properties of the selected element
   */
  element: FormElementProperties;
  
  /**
   * Previously selected element, if any
   */
  previousElement?: FormElementProperties;
  
  /**
   * Method of selection
   */
  selectionMethod: 'click' | 'keyboard' | 'programmatic';
}

/**
 * Element drag event interface
 */
export interface ElementDragEvent extends BaseElementEvent {
  type: 'element:drag';
  
  /**
   * Drag event type
   */
  dragType: 'start' | 'move' | 'end' | 'cancel';
  
  /**
   * Current position of the element being dragged
   */
  currentPosition: {
    x: number;
    y: number;
  };
  
  /**
   * Original position of the element before dragging started
   */
  originalPosition: {
    rowIndex: number;
    colIndex: number;
  };
  
  /**
   * Target position where the element will be dropped (only for 'move' and 'end' drag types)
   */
  targetPosition?: {
    rowIndex: number;
    colIndex: number;
  };
  
  /**
   * Element being dragged over, if any (only for 'move' drag type)
   */
  targetElement?: FormElementProperties;
}

/**
 * Element resize event interface
 */
export interface ElementResizeEvent extends BaseElementEvent {
  type: 'element:resize';
  
  /**
   * Resize event type
   */
  resizeType: 'start' | 'resize' | 'end' | 'cancel';
  
  /**
   * Current dimensions of the element being resized
   */
  currentDimensions: {
    width: number;
    height: number;
  };
  
  /**
   * Original dimensions of the element before resizing started
   */
  originalDimensions: {
    width: number;
    height: number;
  };
  
  /**
   * Resize handle being used
   */
  resizeHandle: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Element duplicate event interface
 */
export interface ElementDuplicateEvent extends BaseElementEvent {
  type: 'element:duplicate';
  
  /**
   * Properties of the original element that was duplicated
   */
  originalElement: FormElementProperties;
  
  /**
   * Properties of the new duplicated element
   */
  duplicatedElement: FormElementProperties;
  
  /**
   * Position where the duplicated element was placed
   */
  position: {
    rowIndex: number;
    colIndex: number;
  };
}

/**
 * Element focus event interface
 */
export interface ElementFocusEvent extends BaseElementEvent {
  type: 'element:focus';
  
  /**
   * Properties of the focused element
   */
  element: FormElementProperties;
  
  /**
   * Previously focused element, if any
   */
  previousElement?: FormElementProperties;
  
  /**
   * Method of focus
   */
  focusMethod: 'click' | 'keyboard' | 'programmatic';
}

/**
 * Element blur event interface
 */
export interface ElementBlurEvent extends BaseElementEvent {
  type: 'element:blur';
  
  /**
   * Properties of the blurred element
   */
  element: FormElementProperties;
  
  /**
   * Newly focused element, if any
   */
  newFocusElement?: FormElementProperties;
  
  /**
   * Method of blur
   */
  blurMethod: 'click' | 'keyboard' | 'programmatic';
}

/**
 * Element hover event interface
 */
export interface ElementHoverEvent extends BaseElementEvent {
  type: 'element:hover';
  
  /**
   * Hover event type
   */
  hoverType: 'enter' | 'leave';
  
  /**
   * Properties of the hovered element
   */
  element: FormElementProperties;
  
  /**
   * Mouse position relative to the element
   */
  mousePosition: {
    x: number;
    y: number;
  };
}

/**
 * Element value change event interface
 */
export interface ElementValueChangeEvent extends BaseElementEvent {
  type: 'element:valueChange';
  
  /**
   * Old value of the element
   */
  oldValue: any;
  
  /**
   * New value of the element
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
 * Element validation event interface
 */
export interface ElementValidationEvent extends BaseElementEvent {
  type: 'element:validation';
  
  /**
   * Validation event type
   */
  validationType: 'start' | 'success' | 'error' | 'warning';
  
  /**
   * Validation result
   */
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  /**
   * Value that was validated
   */
  value: any;
  
  /**
   * Whether validation was triggered automatically (true) or manually (false)
   */
  autoTriggered: boolean;
}

/**
 * Element visibility change event interface
 */
export interface ElementVisibilityChangeEvent extends BaseElementEvent {
  type: 'element:visibilityChange';
  
  /**
   * Previous visibility state
   */
  oldVisibility: boolean;
  
  /**
   * New visibility state
   */
  newVisibility: boolean;
  
  /**
   * Reason for visibility change
   */
  reason: 'user_action' | 'conditional_logic' | 'programmatic';
}

/**
 * Element enable/disable event interface
 */
export interface ElementEnableDisableEvent extends BaseElementEvent {
  type: 'element:enableDisable';
  
  /**
   * Previous enabled state
   */
  oldEnabledState: boolean;
  
  /**
   * New enabled state
   */
  newEnabledState: boolean;
  
  /**
   * Reason for state change
   */
  reason: 'user_action' | 'conditional_logic' | 'programmatic';
}

/**
 * Union type for all element events
 */
export type ElementEvent = 
  | ElementCreateEvent
  | ElementUpdateEvent
  | ElementDeleteEvent
  | ElementSelectEvent
  | ElementDragEvent
  | ElementResizeEvent
  | ElementDuplicateEvent
  | ElementFocusEvent
  | ElementBlurEvent
  | ElementHoverEvent
  | ElementValueChangeEvent
  | ElementValidationEvent
  | ElementVisibilityChangeEvent
  | ElementEnableDisableEvent;