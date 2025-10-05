import { PropertySection, PropertyGroup, PropertyDefinition } from '../models/property-schema.model';
import { PropertyType, DimensionUnit } from '../enums/property-type.enum';

/**
 * Element Property Sections Configuration
 * 
 * Defines property sections for different element types
 */

// Common property definitions
const COMMON_PROPERTIES = {
  id: {
    name: 'id',
    type: PropertyType.TEXT,
    label: 'ID',
    description: 'Unique identifier for the element',
    required: true,
    disabled: true
  } as PropertyDefinition,
  
  label: {
    name: 'label',
    type: PropertyType.TEXT,
    label: 'Label',
    description: 'Display label for the element',
    required: true,
    placeholder: 'Enter label...'
  } as PropertyDefinition,
  
  name: {
    name: 'name',
    type: PropertyType.TEXT,
    label: 'Name',
    description: 'Form field name',
    required: true,
    placeholder: 'Enter field name...'
  } as PropertyDefinition,
  
  placeholder: {
    name: 'placeholder',
    type: PropertyType.TEXT,
    label: 'Placeholder',
    description: 'Placeholder text for the input field',
    placeholder: 'Enter placeholder text...'
  } as PropertyDefinition,
  
  required: {
    name: 'required',
    type: PropertyType.BOOLEAN,
    label: 'Required',
    description: 'Whether the field is required',
    defaultValue: false
  } as PropertyDefinition,
  
  disabled: {
    name: 'disabled',
    type: PropertyType.BOOLEAN,
    label: 'Disabled',
    description: 'Whether the field is disabled',
    defaultValue: false
  } as PropertyDefinition,
  
  width: {
    name: 'width',
    type: PropertyType.DIMENSION,
    label: 'Width',
    description: 'Width of the element',
    min: 0,
    max: 2000,
    defaultUnit: DimensionUnit.PX,
    dimensionUnits: [DimensionUnit.PX, DimensionUnit.PERCENT]
  } as PropertyDefinition,
  
  customClass: {
    name: 'customClass',
    type: PropertyType.TEXT,
    label: 'CSS Class',
    description: 'Custom CSS class',
    placeholder: 'Enter CSS class...'
  } as PropertyDefinition
};

// Input element property sections
const INPUT_PROPERTY_SECTIONS: PropertySection[] = [
  {
    id: 'basic',
    title: 'Basic',
    groups: [
      {
        title: 'General',
        properties: [
          COMMON_PROPERTIES.id,
          COMMON_PROPERTIES.label,
          COMMON_PROPERTIES.name,
          COMMON_PROPERTIES.placeholder
        ]
      },
      {
        title: 'Validation',
        properties: [
          COMMON_PROPERTIES.required,
          {
            name: 'minLength',
            type: PropertyType.NUMBER,
            label: 'Min Length',
            description: 'Minimum length of the input',
            min: 0,
            max: 1000
          },
          {
            name: 'maxLength',
            type: PropertyType.NUMBER,
            label: 'Max Length',
            description: 'Maximum length of the input',
            min: 0,
            max: 1000
          }
        ]
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    groups: [
      {
        title: 'Layout',
        properties: [
          COMMON_PROPERTIES.width,
          COMMON_PROPERTIES.disabled
        ]
      },
      {
        title: 'Style',
        properties: [
          COMMON_PROPERTIES.customClass
        ]
      }
    ]
  }
];

// Textarea element property sections
const TEXTAREA_PROPERTY_SECTIONS: PropertySection[] = [
  {
    id: 'basic',
    title: 'Basic',
    groups: [
      {
        title: 'General',
        properties: [
          COMMON_PROPERTIES.id,
          COMMON_PROPERTIES.label,
          COMMON_PROPERTIES.name,
          COMMON_PROPERTIES.placeholder
        ]
      },
      {
        title: 'Configuration',
        properties: [
          {
            name: 'rows',
            type: PropertyType.NUMBER,
            label: 'Rows',
            description: 'Number of visible text lines',
            min: 1,
            max: 20,
            defaultValue: 4
          },
          {
            name: 'autoSize',
            type: PropertyType.BOOLEAN,
            label: 'Auto Size',
            description: 'Automatically adjust height',
            defaultValue: false
          }
        ]
      },
      {
        title: 'Validation',
        properties: [
          COMMON_PROPERTIES.required,
          {
            name: 'minLength',
            type: PropertyType.NUMBER,
            label: 'Min Length',
            description: 'Minimum length of the input',
            min: 0,
            max: 1000
          },
          {
            name: 'maxLength',
            type: PropertyType.NUMBER,
            label: 'Max Length',
            description: 'Maximum length of the input',
            min: 0,
            max: 1000
          }
        ]
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    groups: [
      {
        title: 'Layout',
        properties: [
          COMMON_PROPERTIES.width,
          COMMON_PROPERTIES.disabled
        ]
      },
      {
        title: 'Style',
        properties: [
          COMMON_PROPERTIES.customClass
        ]
      }
    ]
  }
];

// Select element property sections
const SELECT_PROPERTY_SECTIONS: PropertySection[] = [
  {
    id: 'basic',
    title: 'Basic',
    groups: [
      {
        title: 'General',
        properties: [
          COMMON_PROPERTIES.id,
          COMMON_PROPERTIES.label,
          COMMON_PROPERTIES.name,
          COMMON_PROPERTIES.placeholder
        ]
      },
      {
        title: 'Options',
        properties: [
          {
            name: 'options',
            type: PropertyType.ARRAY,
            label: 'Options',
            description: 'List of available options',
            defaultValue: [],
            canAdd: true,
            canRemove: true,
            canReorder: true
          },
          {
            name: 'multiple',
            type: PropertyType.BOOLEAN,
            label: 'Multiple',
            description: 'Allow multiple selections',
            defaultValue: false
          }
        ]
      },
      {
        title: 'Validation',
        properties: [
          COMMON_PROPERTIES.required
        ]
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    groups: [
      {
        title: 'Layout',
        properties: [
          COMMON_PROPERTIES.width,
          COMMON_PROPERTIES.disabled
        ]
      },
      {
        title: 'Style',
        properties: [
          COMMON_PROPERTIES.customClass
        ]
      }
    ]
  }
];

// Button element property sections
const BUTTON_PROPERTY_SECTIONS: PropertySection[] = [
  {
    id: 'basic',
    title: 'Basic',
    groups: [
      {
        title: 'General',
        properties: [
          COMMON_PROPERTIES.id,
          COMMON_PROPERTIES.label,
          {
            name: 'type',
            type: PropertyType.SELECT,
            label: 'Type',
            description: 'Button type',
            defaultValue: 'button',
            options: [
              { label: 'Button', value: 'button' },
              { label: 'Submit', value: 'submit' },
              { label: 'Reset', value: 'reset' }
            ]
          }
        ]
      },
      {
        title: 'Style',
        properties: [
          {
            name: 'buttonType',
            type: PropertyType.SELECT,
            label: 'Button Style',
            description: 'Visual style of the button',
            defaultValue: 'default',
            options: [
              { label: 'Default', value: 'default' },
              { label: 'Primary', value: 'primary' },
              { label: 'Dashed', value: 'dashed' },
              { label: 'Text', value: 'text' },
              { label: 'Link', value: 'link' }
            ]
          },
          {
            name: 'size',
            type: PropertyType.SELECT,
            label: 'Size',
            description: 'Button size',
            defaultValue: 'default',
            options: [
              { label: 'Small', value: 'small' },
              { label: 'Default', value: 'default' },
              { label: 'Large', value: 'large' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    groups: [
      {
        title: 'Layout',
        properties: [
          COMMON_PROPERTIES.width,
          COMMON_PROPERTIES.disabled
        ]
      },
      {
        title: 'Style',
        properties: [
          COMMON_PROPERTIES.customClass
        ]
      }
    ]
  }
];

/**
 * Get property sections for a specific element type
 */
export function getElementPropertySections(elementType: string): PropertySection[] {
  switch (elementType) {
    case 'input':
      return INPUT_PROPERTY_SECTIONS;
    case 'textarea':
      return TEXTAREA_PROPERTY_SECTIONS;
    case 'select':
      return SELECT_PROPERTY_SECTIONS;
    case 'button':
      return BUTTON_PROPERTY_SECTIONS;
    default:
      return INPUT_PROPERTY_SECTIONS; // Default fallback
  }
}

/**
 * Get all available element types with their property sections
 */
export function getAllElementPropertySections(): Record<string, PropertySection[]> {
  return {
    input: INPUT_PROPERTY_SECTIONS,
    textarea: TEXTAREA_PROPERTY_SECTIONS,
    select: SELECT_PROPERTY_SECTIONS,
    button: BUTTON_PROPERTY_SECTIONS
  };
}