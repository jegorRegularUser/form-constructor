/**
 * Property Type Enum
 *
 * Defines all supported property types for the form builder
 */
export enum PropertyType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  COLOR = 'color',
  DIMENSION = 'dimension',
  FONT_WEIGHT = 'font-weight',
  BORDER_STYLE = 'border-style',
  PLACEHOLDER_STYLE = 'placeholder-style',
  ARRAY = 'array',
  OBJECT = 'object',
  MULTI_SELECT = 'multi-select',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  FILE = 'file',
  RICHTEXT = 'richtext',
  CODE = 'code'
}

/**
 * Dimension Unit Enum
 * 
 * Defines supported dimension units for width/height properties
 */
export enum DimensionUnit {
  PX = 'px',
  PERCENT = '%',
  EM = 'em',
  REM = 'rem',
  VW = 'vw',
  VH = 'vh',
  PT = 'pt',
  CM = 'cm',
  MM = 'mm',
  IN = 'in'
}

/**
 * Font Weight Options Enum
 * 
 * Defines supported font weight options
 */
export enum FontWeightOption {
  NORMAL = 'normal',
  BOLD = 'bold',
  BOLDER = 'bolder',
  LIGHTER = 'lighter'
}

/**
 * Border Style Options Enum
 * 
 * Defines supported border style options
 */
export enum BorderStyleOption {
  NONE = 'none',
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double',
  GROOVE = 'groove',
  RIDGE = 'ridge',
  INSET = 'inset',
  OUTSET = 'outset'
}

/**
 * Alignment Options Enum
 * 
 * Defines supported alignment options
 */
export enum AlignmentOption {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
  START = 'start',
  END = 'end',
  STRETCH = 'stretch'
}

/**
 * Layout Options Enum
 * 
 * Defines supported layout options
 */
export enum LayoutOption {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  GRID = 'grid',
  FLEX = 'flex'
}

/**
 * Condition Operator Enum
 * 
 * Defines supported condition operators for conditional property visibility
 */
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists',
  IN = 'in',
  NOT_IN = 'notIn'
}

/**
 * Logical Operator Enum
 * 
 * Defines supported logical operators for combining conditions
 */
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

/**
 * Property Editor Component Mapping
 * 
 * Maps property types to their corresponding editor components
 */
export const PROPERTY_EDITOR_COMPONENTS: Record<PropertyType, string> = {
  [PropertyType.TEXT]: 'app-text-property-editor',
  [PropertyType.NUMBER]: 'app-number-property-editor',
  [PropertyType.BOOLEAN]: 'app-boolean-property-editor',
  [PropertyType.SELECT]: 'app-select-property-editor',
  [PropertyType.COLOR]: 'app-color-property-editor',
  [PropertyType.DIMENSION]: 'app-number-property-editor',
  [PropertyType.FONT_WEIGHT]: 'app-select-property-editor',
  [PropertyType.BORDER_STYLE]: 'app-select-property-editor',
  [PropertyType.PLACEHOLDER_STYLE]: 'app-object-property-editor',
  [PropertyType.ARRAY]: 'app-array-property-editor',
  [PropertyType.OBJECT]: 'app-object-property-editor',
  [PropertyType.MULTI_SELECT]: 'app-multi-select-property-editor',
  [PropertyType.DATE]: 'app-text-property-editor', // Placeholder, would need a proper date editor
  [PropertyType.TIME]: 'app-text-property-editor', // Placeholder, would need a proper time editor
  [PropertyType.DATETIME]: 'app-text-property-editor', // Placeholder, would need a proper datetime editor
  [PropertyType.FILE]: 'app-text-property-editor', // Placeholder, would need a proper file editor
  [PropertyType.RICHTEXT]: 'app-text-property-editor', // Placeholder, would need a proper richtext editor
  [PropertyType.CODE]: 'app-text-property-editor' // Placeholder, would need a proper code editor
};

/**
 * Default Property Configuration
 * 
 * Default configuration values for each property type
 */
export const DEFAULT_PROPERTY_CONFIG: Record<PropertyType, any> = {
  [PropertyType.TEXT]: {
    placeholder: 'Enter value...',
    maxLength: 255
  },
  [PropertyType.NUMBER]: {
    min: 0,
    max: 100,
    step: 1
  },
  [PropertyType.BOOLEAN]: {
    defaultValue: false
  },
  [PropertyType.SELECT]: {
    options: [],
    placeholder: 'Select an option'
  },
  [PropertyType.COLOR]: {
    defaultValue: '#000000',
    placeholder: '#000000'
  },
  [PropertyType.DIMENSION]: {
    min: 0,
    max: 1000,
    step: 1,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT, DimensionUnit.EM, DimensionUnit.REM]
  },
  [PropertyType.FONT_WEIGHT]: {
    defaultValue: FontWeightOption.NORMAL,
    options: [
      { label: 'Normal', value: FontWeightOption.NORMAL },
      { label: 'Bold', value: FontWeightOption.BOLD },
      { label: 'Bolder', value: FontWeightOption.BOLDER },
      { label: 'Lighter', value: FontWeightOption.LIGHTER }
    ]
  },
  [PropertyType.BORDER_STYLE]: {
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
    ]
  },
  [PropertyType.PLACEHOLDER_STYLE]: {
    defaultValue: {}
  },
  [PropertyType.ARRAY]: {
    defaultValue: [],
    canAdd: true,
    canRemove: true,
    canReorder: true,
    minItems: 0,
    maxItems: 100
  },
  [PropertyType.OBJECT]: {
    defaultValue: {}
  },
  [PropertyType.MULTI_SELECT]: {
    defaultValue: [],
    options: [],
    placeholder: 'Select options',
    allowClear: true,
    minSelected: 0,
    maxSelected: 100
  },
  [PropertyType.DATE]: {
    placeholder: 'Select date',
    format: 'YYYY-MM-DD'
  },
  [PropertyType.TIME]: {
    placeholder: 'Select time',
    format: 'HH:mm:ss'
  },
  [PropertyType.DATETIME]: {
    placeholder: 'Select date and time',
    format: 'YYYY-MM-DD HH:mm:ss'
  },
  [PropertyType.FILE]: {
    placeholder: 'Select file',
    multiple: false,
    accept: '*/*'
  },
  [PropertyType.RICHTEXT]: {
    placeholder: 'Enter rich text...',
    toolbar: ['bold', 'italic', 'underline', 'link']
  },
  [PropertyType.CODE]: {
    placeholder: 'Enter code...',
    language: 'typescript',
    theme: 'vs'
  }
};