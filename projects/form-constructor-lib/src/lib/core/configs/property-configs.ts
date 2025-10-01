import { PropertyType, DimensionUnit, FontWeightOption, BorderStyleOption, DEFAULT_PROPERTY_CONFIG } from '../enums/property-type.enum';
import { PropertyDefinition, SelectOption } from '../../models/property-schema.model';

/**
 * Property Configuration Arrays
 * 
 * Predefined configurations for common property types to reduce duplication
 * and make the property panel more maintainable
 */

/**
 * Text Property Configuration
 */
export const TEXT_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.TEXT,
  placeholder: 'Enter text...'
};

/**
 * Number Property Configuration
 */
export const NUMBER_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.NUMBER,
  min: 0,
  max: 100,
  step: 1
};

/**
 * Boolean Property Configuration
 */
export const BOOLEAN_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.BOOLEAN,
  defaultValue: false,
  description: 'Toggle between true and false values'
};

/**
 * Select Property Configuration
 */
export const SELECT_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.SELECT,
  placeholder: 'Select an option',
  options: []
};

/**
 * Color Property Configuration
 */
export const COLOR_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.COLOR,
  defaultValue: '#000000',
  placeholder: '#000000'
};

/**
 * Dimension Property Configuration
 */
export const DIMENSION_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.DIMENSION,
  min: 0,
  max: 1000,
  step: 1,
  defaultUnit: DimensionUnit.PX,
  dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT, DimensionUnit.EM, DimensionUnit.REM]
};

/**
 * Font Weight Property Configuration
 */
export const FONT_WEIGHT_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.FONT_WEIGHT,
  defaultValue: FontWeightOption.NORMAL,
  options: [
    { label: 'Normal', value: FontWeightOption.NORMAL },
    { label: 'Bold', value: FontWeightOption.BOLD },
    { label: 'Bolder', value: FontWeightOption.BOLDER },
    { label: 'Lighter', value: FontWeightOption.LIGHTER }
  ] as SelectOption[]
};

/**
 * Border Style Property Configuration
 */
export const BORDER_STYLE_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.BORDER_STYLE,
  defaultValue: BorderStyleOption.SOLID,
  options: [
    { label: 'None', value: BorderStyleOption.NONE },
    { label: 'Solid', value: BorderStyleOption.SOLID },
    { label: 'Dashed', value: BorderStyleOption.DASHED },
    { label: 'Dotted', value: BorderStyleOption.DOTTED },
    { label: 'Double', value: BorderStyleOption.DOUBLE },
    { label: 'Groove', value: BorderStyleOption.GROOVE },
    { label: 'Ridge', value: BorderStyleOption.RIDGE },
    { label: 'Inset', value: BorderStyleOption.INSET },
    { label: 'Outset', value: BorderStyleOption.OUTSET }
  ] as SelectOption[]
};

/**
 * Array Property Configuration
 */
export const ARRAY_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.ARRAY,
  defaultValue: [],
  canAdd: true,
  canRemove: true,
  canReorder: true,
  minItems: 0,
  maxItems: 100,
  description: 'Collection of items that can be added, removed, and reordered'
};

/**
 * Object Property Configuration
 */
export const OBJECT_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.OBJECT,
  defaultValue: {}
};

/**
 * Multi-Select Property Configuration
 */
export const MULTI_SELECT_PROPERTY_CONFIG: Partial<PropertyDefinition> = {
  type: PropertyType.MULTI_SELECT,
  defaultValue: [],
  placeholder: 'Select options',
  options: []
};

/**
 * Common Property Definitions
 * 
 * Predefined property definitions for commonly used properties
 */
export const COMMON_PROPERTY_DEFINITIONS: Record<string, PropertyDefinition> = {
  // Basic properties
  id: {
    name: 'id',
    type: PropertyType.TEXT,
    label: 'ID',
    description: 'Unique identifier for the element',
    required: true,
    disabled: true
  },
  type: {
    name: 'type',
    type: PropertyType.TEXT,
    label: 'Type',
    description: 'Element type',
    required: true,
    disabled: true
  },
  label: {
    name: 'label',
    type: PropertyType.TEXT,
    label: 'Label',
    description: 'Display label for the element',
    required: true,
    placeholder: 'Enter label...'
  },
  name: {
    name: 'name',
    type: PropertyType.TEXT,
    label: 'Name',
    description: 'Form field name',
    required: true,
    placeholder: 'Enter field name...'
  },
  placeholder: {
    name: 'placeholder',
    type: PropertyType.TEXT,
    label: 'Placeholder',
    description: 'Placeholder text for the input field',
    placeholder: 'Enter placeholder text...'
  },
  defaultValue: {
    name: 'defaultValue',
    type: PropertyType.TEXT,
    label: 'Default Value',
    description: 'Default value for the field',
    placeholder: 'Enter default value...'
  },
  description: {
    name: 'description',
    type: PropertyType.TEXT,
    label: 'Description',
    description: 'Helper text for the field',
    placeholder: 'Enter description...'
  },
  required: {
    name: 'required',
    type: PropertyType.BOOLEAN,
    label: 'Required',
    description: 'Whether the field is required',
    defaultValue: false
  },
  disabled: {
    name: 'disabled',
    type: PropertyType.BOOLEAN,
    label: 'Disabled',
    description: 'Whether the field is disabled',
    defaultValue: false
  },
  readOnly: {
    name: 'readOnly',
    type: PropertyType.BOOLEAN,
    label: 'Read Only',
    description: 'Whether the field is read-only',
    defaultValue: false
  },
  visible: {
    name: 'visible',
    type: PropertyType.BOOLEAN,
    label: 'Visible',
    description: 'Whether the field is visible',
    defaultValue: true
  },
  customClass: {
    name: 'customClass',
    type: PropertyType.TEXT,
    label: 'Custom CSS Class',
    description: 'Custom CSS class for the element',
    placeholder: 'Enter CSS class name...'
  },
  
  // Layout properties
  width: {
    name: 'width',
    type: PropertyType.DIMENSION,
    label: 'Width',
    description: 'Width of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT, DimensionUnit.EM, DimensionUnit.REM]
  },
  height: {
    name: 'height',
    type: PropertyType.DIMENSION,
    label: 'Height',
    description: 'Height of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.EM, DimensionUnit.REM]
  },
  minWidth: {
    name: 'minWidth',
    type: PropertyType.DIMENSION,
    label: 'Min Width',
    description: 'Minimum width of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT, DimensionUnit.EM, DimensionUnit.REM]
  },
  maxWidth: {
    name: 'maxWidth',
    type: PropertyType.DIMENSION,
    label: 'Max Width',
    description: 'Maximum width of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT, DimensionUnit.EM, DimensionUnit.REM]
  },
  minHeight: {
    name: 'minHeight',
    type: PropertyType.DIMENSION,
    label: 'Min Height',
    description: 'Minimum height of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.EM, DimensionUnit.REM]
  },
  maxHeight: {
    name: 'maxHeight',
    type: PropertyType.DIMENSION,
    label: 'Max Height',
    description: 'Maximum height of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.EM, DimensionUnit.REM]
  },
  autoExpand: {
    name: 'autoExpand',
    type: PropertyType.BOOLEAN,
    label: 'Auto Expand',
    description: 'When enabled, the element expands to full width/height of its container',
    defaultValue: true
  },
  
  // Validation properties
  minLength: {
    name: 'minLength',
    type: PropertyType.NUMBER,
    label: 'Min Length',
    description: 'Minimum length of the input',
    min: 0,
    max: 1000
  },
  maxLength: {
    name: 'maxLength',
    type: PropertyType.NUMBER,
    label: 'Max Length',
    description: 'Maximum length of the input',
    min: 0,
    max: 1000
  },
  pattern: {
    name: 'pattern',
    type: PropertyType.TEXT,
    label: 'Pattern',
    description: 'Regular expression pattern for validation',
    placeholder: 'Enter regex pattern...'
  },
  
  // Style properties
  color: {
    name: 'color',
    type: PropertyType.COLOR,
    label: 'Color',
    description: 'Color value',
    defaultValue: '#000000',
    placeholder: '#000000'
  },
  backgroundColor: {
    name: 'backgroundColor',
    type: PropertyType.COLOR,
    label: 'Background Color',
    description: 'Background color value',
    defaultValue: '#ffffff',
    placeholder: '#ffffff'
  },
  borderColor: {
    name: 'borderColor',
    type: PropertyType.COLOR,
    label: 'Border Color',
    description: 'Border color value',
    defaultValue: '#cccccc',
    placeholder: '#cccccc'
  },
  borderWidth: {
    name: 'borderWidth',
    type: PropertyType.DIMENSION,
    label: 'Border Width',
    description: 'Border width',
    min: 0,
    max: 20,
    defaultValue: { value: 1, unit: DimensionUnit.PX },
    dimensionUnits: [DimensionUnit.PX]
  },
  borderStyle: {
    name: 'borderStyle',
    type: PropertyType.BORDER_STYLE,
    label: 'Border Style',
    description: 'Border style',
    defaultValue: BorderStyleOption.SOLID,
    options: [
      { label: 'None', value: BorderStyleOption.NONE },
      { label: 'Solid', value: BorderStyleOption.SOLID },
      { label: 'Dashed', value: BorderStyleOption.DASHED },
      { label: 'Dotted', value: BorderStyleOption.DOTTED },
      { label: 'Double', value: BorderStyleOption.DOUBLE },
      { label: 'Groove', value: BorderStyleOption.GROOVE },
      { label: 'Ridge', value: BorderStyleOption.RIDGE },
      { label: 'Inset', value: BorderStyleOption.INSET },
      { label: 'Outset', value: BorderStyleOption.OUTSET }
    ] as SelectOption[]
  },
  borderRadius: {
    name: 'borderRadius',
    type: PropertyType.DIMENSION,
    label: 'Border Radius',
    description: 'Border radius',
    min: 0,
    max: 50,
    defaultValue: { value: 4, unit: DimensionUnit.PX },
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT]
  },
  fontSize: {
    name: 'fontSize',
    type: PropertyType.DIMENSION,
    label: 'Font Size',
    description: 'Font size',
    min: 8,
    max: 72,
    defaultValue: { value: 14, unit: DimensionUnit.PX },
    dimensionUnits: [DimensionUnit.PX]
  },
  fontWeight: {
    name: 'fontWeight',
    type: PropertyType.FONT_WEIGHT,
    label: 'Font Weight',
    description: 'Font weight',
    defaultValue: FontWeightOption.NORMAL,
    options: [
      { label: 'Normal', value: FontWeightOption.NORMAL },
      { label: 'Bold', value: FontWeightOption.BOLD },
      { label: 'Bolder', value: FontWeightOption.BOLDER },
      { label: 'Lighter', value: FontWeightOption.LIGHTER }
    ] as SelectOption[]
  },
  padding: {
    name: 'padding',
    type: PropertyType.TEXT,
    label: 'Padding',
    description: 'CSS padding value',
    placeholder: 'e.g., 8px 16px'
  },
  margin: {
    name: 'margin',
    type: PropertyType.TEXT,
    label: 'Margin',
    description: 'CSS margin value',
    placeholder: 'e.g., 0 0 16px 0'
  }
};

/**
 * Create a property definition with common configuration
 * 
 * @param name Property name
 * @param label Property label
 * @param type Property type
 * @param overrides Additional property configuration to override defaults
 * @returns A complete property definition
 */
export function createPropertyDefinition(
  name: string,
  label: string,
  type: PropertyType,
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  // Get the default configuration for this property type
  const defaultConfig = DEFAULT_PROPERTY_CONFIG[type] || {};
  
  // Get the common property definition if it exists
  const commonProperty = COMMON_PROPERTY_DEFINITIONS[name];
  
  // Start with the basic property definition
  const propertyDefinition: PropertyDefinition = {
    ...defaultConfig,
    ...(commonProperty || {}),
    ...overrides,
    name,
    type,
    label
  };
  
  return propertyDefinition;
}

/**
 * Create a text property definition
 * 
 * @param name Property name
 * @param label Property label
 * @param overrides Additional property configuration
 * @returns A text property definition
 */
export function createTextPropertyDefinition(
  name: string,
  label: string,
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  return createPropertyDefinition(name, label, PropertyType.TEXT, {
    ...TEXT_PROPERTY_CONFIG,
    ...overrides
  });
}

/**
 * Create a number property definition
 * 
 * @param name Property name
 * @param label Property label
 * @param overrides Additional property configuration
 * @returns A number property definition
 */
export function createNumberPropertyDefinition(
  name: string,
  label: string,
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  return createPropertyDefinition(name, label, PropertyType.NUMBER, {
    ...NUMBER_PROPERTY_CONFIG,
    ...overrides
  });
}

/**
 * Create a boolean property definition
 * 
 * @param name Property name
 * @param label Property label
 * @param overrides Additional property configuration
 * @returns A boolean property definition
 */
export function createBooleanPropertyDefinition(
  name: string,
  label: string,
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  return createPropertyDefinition(name, label, PropertyType.BOOLEAN, {
    ...BOOLEAN_PROPERTY_CONFIG,
    ...overrides
  });
}

/**
 * Create a select property definition
 * 
 * @param name Property name
 * @param label Property label
 * @param options Select options
 * @param overrides Additional property configuration
 * @returns A select property definition
 */
export function createSelectPropertyDefinition(
  name: string,
  label: string,
  options: SelectOption[],
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  return createPropertyDefinition(name, label, PropertyType.SELECT, {
    ...SELECT_PROPERTY_CONFIG,
    options,
    ...overrides
  });
}

/**
 * Create a dimension property definition
 * 
 * @param name Property name
 * @param label Property label
 * @param overrides Additional property configuration
 * @returns A dimension property definition
 */
export function createDimensionPropertyDefinition(
  name: string,
  label: string,
  overrides: Partial<PropertyDefinition> = {}
): PropertyDefinition {
  return createPropertyDefinition(name, label, PropertyType.DIMENSION, {
    ...DIMENSION_PROPERTY_CONFIG,
    ...overrides
  });
}