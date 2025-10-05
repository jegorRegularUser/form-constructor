// Property type definitions
export type PropertyType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'custom'
  | 'dimension'
  | 'font-weight'
  | 'border-style'
  | 'placeholder-style'
  | 'array'
  | 'object'
  | 'multi-select'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'richtext'
  | 'code';

// Supported dimension units for width/height properties
export type DimensionUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'pt' | 'cm' | 'mm' | 'in';

// Supported font weight options
export type FontWeightOption = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

// Supported border style options
export type BorderStyleOption = 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

// Supported alignment options
export type AlignmentOption = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end' | 'stretch';

// Supported layout options
export type LayoutOption = 'vertical' | 'horizontal' | 'grid' | 'flex';

// Property condition interface for conditional visibility
export interface PropertyCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists' | 'in' | 'notIn';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Base property definition interface
export interface PropertyDefinition {
  name: string;
  type: PropertyType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  disabled?: boolean;
  visible?: boolean;
  required?: boolean;
  
  // Type-specific properties
  min?: number; // For number type
  max?: number; // For number type
  step?: number; // For number type
  options?: SelectOption[]; // For select type
  validator?: (value: any) => boolean | string; // Custom validator
  
  // Advanced properties
  group?: string;
  order?: number;
  condition?: PropertyCondition | PropertyCondition[]; // Conditional visibility
  
  // Dimension-specific properties (for width/height)
  dimensionUnits?: DimensionUnit[]; // Available units for dimension properties
  defaultUnit?: DimensionUnit; // Default unit for dimension properties
  
  // Placeholder-specific properties
  placeholderStyleProperties?: PlaceholderStyleProperty[];
  
  // Array-specific properties
  itemSchema?: PropertyDefinition; // Schema for array items
  minItems?: number;
  maxItems?: number;
  canAdd?: boolean;
  canRemove?: boolean;
  canReorder?: boolean;
  
  // Object-specific properties
  properties?: Record<string, PropertyDefinition>; // Object properties
  nestedGroups?: PropertyGroup[]; // Nested property groups
  
  // Multi-select specific properties
  maxSelections?: number;
  
  // UI properties
  ui?: {
    widget?: string; // Custom widget name
    widgetConfig?: Record<string, any>; // Widget configuration
    className?: string; // Custom CSS class
    style?: Record<string, string>; // Custom inline styles
    tooltip?: string; // Tooltip text
    icon?: string; // Icon name
    // Auto-expand specific properties
    affectsProperties?: string[]; // Properties that are affected by this property
  };
}

// Placeholder style property definition
export interface PlaceholderStyleProperty {
  name: string;
  type: PropertyType;
  label: string;
  description?: string;
  defaultValue?: any;
  options?: SelectOption[];
  min?: number;
  max?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Property group definition
export interface PropertyGroup {
  id?: string;
  title: string;
  description?: string;
  properties: PropertyDefinition[];
  groups?: PropertyGroup[]; // Nested property groups
  expanded?: boolean;
  order?: number;
  condition?: PropertyCondition | PropertyCondition[]; // Conditional visibility
  collapsible?: boolean;
  className?: string; // Custom CSS class
  icon?: string; // Icon name
}

// Property section definition (for organizing groups)
export interface PropertySection {
  id: string;
  title: string;
  description?: string;
  groups: PropertyGroup[];
  order?: number;
  condition?: PropertyCondition | PropertyCondition[]; // Conditional visibility
  className?: string; // Custom CSS class
  icon?: string; // Icon name
}

// Property change event
export interface PropertyChangeEvent {
  propertyName: string;
  value: any;
}

// Property validation result
export interface PropertyValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Element type configuration
export interface ElementTypeConfig {
  type: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  category?: string;
  defaultProperties: Record<string, any>;
  propertySections: PropertySection[];
  component: any; // Component class reference
  previewComponent?: any; // Optional preview component
  validators?: Record<string, (value: any) => boolean | string>; // Custom validators
  dependencies?: string[]; // Required element types
  compatibility?: string[]; // Compatible form types
  tags?: string[]; // For search and filtering
}

// Property editor configuration
export interface PropertyEditorConfig {
  type: PropertyType;
  component: any; // Component class reference
  selector?: string; // Component selector
  inputs?: Record<string, any>; // Default input values
  outputs?: Record<string, string>; // Output event handlers
}

// Property configuration
export interface PropertyConfig {
  title?: string;
  width?: string | number;
  resizable?: boolean;
  collapsible?: boolean;
  className?: string;
  showHelp?: boolean;
  showValidation?: boolean;
  livePreview?: boolean;
}

// Element registry configuration
export interface ElementRegistryConfig {
  elementTypes: ElementTypeConfig[];
  propertyEditors: PropertyEditorConfig[];
  categories?: ElementCategory[];
  searchEnabled?: boolean;
  filterEnabled?: boolean;
  customGroups?: ElementGroup[];
}

// Element category
export interface ElementCategory {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  order?: number;
  elementTypes?: string[]; // Array of element type IDs
}

// Element group
export interface ElementGroup {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  elementTypes: string[]; // Array of element type IDs
  order?: number;
}