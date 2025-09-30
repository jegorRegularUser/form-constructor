import { PropertyType, DimensionUnit, FontWeightOption, BorderStyleOption } from '../enums/property-type.enum';
import { PropertySection, PropertyGroup, SelectOption } from '../models/property-schema.model';
import { 
  COMMON_PROPERTY_DEFINITIONS,
  createTextPropertyDefinition,
  createNumberPropertyDefinition,
  createBooleanPropertyDefinition,
  createSelectPropertyDefinition,
  createDimensionPropertyDefinition
} from './property-configs';

/**
 * Property Definitions for Common Element Types
 * 
 * Predefined property sections and groups for common element types
 * to reduce duplication and make the property panel more maintainable
 */

/**
 * Basic Properties Section
 * 
 * Common properties for all element types
 */
export const BASIC_PROPERTIES_SECTION: PropertySection = {
  id: 'basic',
  title: 'Basic Properties',
  groups: [
    {
      id: 'basic',
      title: 'Basic Properties',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['id'],
        COMMON_PROPERTY_DEFINITIONS['type'],
        COMMON_PROPERTY_DEFINITIONS['label'],
        COMMON_PROPERTY_DEFINITIONS['name'],
        COMMON_PROPERTY_DEFINITIONS['placeholder'],
        COMMON_PROPERTY_DEFINITIONS['defaultValue'],
        COMMON_PROPERTY_DEFINITIONS['description'],
        COMMON_PROPERTY_DEFINITIONS['required'],
        COMMON_PROPERTY_DEFINITIONS['disabled'],
        COMMON_PROPERTY_DEFINITIONS['readOnly'],
        COMMON_PROPERTY_DEFINITIONS['visible'],
        COMMON_PROPERTY_DEFINITIONS['customClass']
      ]
    }
  ]
};

/**
 * Layout Properties Section
 * 
 * Layout-related properties for all element types
 */
export const LAYOUT_PROPERTIES_SECTION: PropertySection = {
  id: 'layout',
  title: 'Layout',
  groups: [
    {
      id: 'layout',
      title: 'Layout',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['width'],
        COMMON_PROPERTY_DEFINITIONS['height'],
        COMMON_PROPERTY_DEFINITIONS['minWidth'],
        COMMON_PROPERTY_DEFINITIONS['maxWidth'],
        COMMON_PROPERTY_DEFINITIONS['minHeight'],
        COMMON_PROPERTY_DEFINITIONS['maxHeight'],
        COMMON_PROPERTY_DEFINITIONS['autoExpand']
      ]
    }
  ]
};

/**
 * Validation Properties Section
 * 
 * Validation-related properties for input elements
 */
export const VALIDATION_PROPERTIES_SECTION: PropertySection = {
  id: 'validation',
  title: 'Validation',
  groups: [
    {
      id: 'validation',
      title: 'Validation',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['minLength'],
        COMMON_PROPERTY_DEFINITIONS['maxLength'],
        COMMON_PROPERTY_DEFINITIONS['pattern']
      ]
    }
  ]
};

/**
 * Style Properties Section
 * 
 * Style-related properties for all element types
 */
export const STYLE_PROPERTIES_SECTION: PropertySection = {
  id: 'style',
  title: 'Style',
  groups: [
    {
      id: 'typography',
      title: 'Typography',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['color'],
        COMMON_PROPERTY_DEFINITIONS['fontSize'],
        COMMON_PROPERTY_DEFINITIONS['fontWeight']
      ]
    },
    {
      id: 'border',
      title: 'Border',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['borderColor'],
        COMMON_PROPERTY_DEFINITIONS['borderWidth'],
        COMMON_PROPERTY_DEFINITIONS['borderStyle'],
        COMMON_PROPERTY_DEFINITIONS['borderRadius']
      ]
    },
    {
      id: 'spacing',
      title: 'Spacing',
      properties: [
        COMMON_PROPERTY_DEFINITIONS['padding'],
        COMMON_PROPERTY_DEFINITIONS['margin']
      ]
    }
  ]
};

/**
 * Placeholder Style Properties Group
 * 
 * Properties for styling placeholder text
 */
export const PLACEHOLDER_STYLE_PROPERTIES_GROUP: PropertyGroup = {
  id: 'placeholder-style',
  title: 'Placeholder Style',
  properties: [
    {
      name: 'placeholderStyle.color',
      type: PropertyType.COLOR,
      label: 'Color',
      description: 'Placeholder text color',
      defaultValue: '#999999'
    },
    {
      name: 'placeholderStyle.fontSize',
      type: PropertyType.DIMENSION,
      label: 'Font Size',
      description: 'Placeholder text font size',
      defaultValue: { value: 14, unit: DimensionUnit.PX },
      dimensionUnits: [DimensionUnit.PX]
    },
    {
      name: 'placeholderStyle.fontStyle',
      type: PropertyType.SELECT,
      label: 'Font Style',
      description: 'Placeholder text font style',
      defaultValue: 'normal',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Italic', value: 'italic' },
        { label: 'Oblique', value: 'oblique' }
      ] as SelectOption[]
    },
    {
      name: 'placeholderStyle.fontWeight',
      type: PropertyType.SELECT,
      label: 'Font Weight',
      description: 'Placeholder text font weight',
      defaultValue: FontWeightOption.NORMAL,
      options: [
        { label: 'Normal', value: FontWeightOption.NORMAL },
        { label: 'Bold', value: FontWeightOption.BOLD },
        { label: 'Bolder', value: FontWeightOption.BOLDER },
        { label: 'Lighter', value: FontWeightOption.LIGHTER }
      ] as SelectOption[]
    }
  ]
};

/**
 * Input Type Options
 */
export const INPUT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Text', value: 'text' },
  { label: 'Password', value: 'password' },
  { label: 'Email', value: 'email' },
  { label: 'Number', value: 'number' },
  { label: 'Telephone', value: 'tel' },
  { label: 'URL', value: 'url' }
];

/**
 * Input Element Property Sections
 */
export const INPUT_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'input-specific',
    title: 'Input Specific',
    groups: [
      {
        id: 'input-options',
        title: 'Input Options',
        properties: [
          {
            name: 'inputType',
            type: PropertyType.SELECT,
            label: 'Input Type',
            description: 'Type of input field',
            defaultValue: 'text',
            options: INPUT_TYPE_OPTIONS
          },
          {
            name: 'prefix',
            type: PropertyType.TEXT,
            label: 'Prefix',
            description: 'Prefix text or icon',
            placeholder: 'Enter prefix...'
          },
          {
            name: 'suffix',
            type: PropertyType.TEXT,
            label: 'Suffix',
            description: 'Suffix text or icon',
            placeholder: 'Enter suffix...'
          }
        ]
      },
      PLACEHOLDER_STYLE_PROPERTIES_GROUP
    ]
  },
  VALIDATION_PROPERTIES_SECTION,
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Textarea Element Property Sections
 */
export const TEXTAREA_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'textarea-specific',
    title: 'Textarea Specific',
    groups: [
      {
        id: 'textarea-options',
        title: 'Textarea Options',
        properties: [
          {
            name: 'rows',
            type: PropertyType.NUMBER,
            label: 'Rows',
            description: 'Number of visible text lines',
            defaultValue: 3,
            min: 1,
            max: 20
          },
          {
            name: 'maxRows',
            type: PropertyType.NUMBER,
            label: 'Max Rows',
            description: 'Maximum number of rows before scrolling',
            defaultValue: 10,
            min: 1,
            max: 50
          },
          {
            name: 'autoSize',
            type: PropertyType.BOOLEAN,
            label: 'Auto Size',
            description: 'Automatically adjust height based on content',
            defaultValue: false
          },
          {
            name: 'showCount',
            type: PropertyType.BOOLEAN,
            label: 'Show Character Count',
            description: 'Display character count below the textarea',
            defaultValue: false
          }
        ]
      },
      PLACEHOLDER_STYLE_PROPERTIES_GROUP
    ]
  },
  VALIDATION_PROPERTIES_SECTION,
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Select Element Property Sections
 */
export const SELECT_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'select-specific',
    title: 'Select Specific',
    groups: [
      {
        id: 'select-options',
        title: 'Select Options',
        properties: [
          {
            name: 'multiple',
            type: PropertyType.BOOLEAN,
            label: 'Multiple Selection',
            description: 'Allow selecting multiple options',
            defaultValue: false
          },
          {
            name: 'allowClear',
            type: PropertyType.BOOLEAN,
            label: 'Allow Clear',
            description: 'Show clear button to remove selection',
            defaultValue: true
          },
          {
            name: 'showSearch',
            type: PropertyType.BOOLEAN,
            label: 'Show Search',
            description: 'Enable search functionality',
            defaultValue: false
          },
          {
            name: 'options',
            type: PropertyType.ARRAY,
            label: 'Options',
            description: 'List of selectable options',
            defaultValue: [],
            itemSchema: {
              name: 'option',
              type: 'object',
              label: 'Option',
              properties: {
                label: { name: 'label', type: 'text', label: 'Label' },
                value: { name: 'value', type: 'text', label: 'Value' },
                disabled: { name: 'disabled', type: 'boolean', label: 'Disabled', defaultValue: false }
              }
            },
            canAdd: true,
            canRemove: true,
            canReorder: true
          }
        ]
      }
    ]
  },
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Checkbox Element Property Sections
 */
export const CHECKBOX_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'checkbox-specific',
    title: 'Checkbox Specific',
    groups: [
      {
        id: 'checkbox-options',
        title: 'Checkbox Options',
        properties: [
          {
            name: 'checked',
            type: PropertyType.BOOLEAN,
            label: 'Checked',
            description: 'Initial checked state',
            defaultValue: false
          },
          {
            name: 'indeterminate',
            type: PropertyType.BOOLEAN,
            label: 'Indeterminate',
            description: 'Display in indeterminate state',
            defaultValue: false
          },
          {
            name: 'autoFocus',
            type: PropertyType.BOOLEAN,
            label: 'Auto Focus',
            description: 'Focus automatically when page loads',
            defaultValue: false
          }
        ]
      }
    ]
  },
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Radio Group Element Property Sections
 */
export const RADIO_GROUP_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'radio-group-specific',
    title: 'Radio Group Specific',
    groups: [
      {
        id: 'radio-group-options',
        title: 'Radio Group Options',
        properties: [
          {
            name: 'direction',
            type: PropertyType.SELECT,
            label: 'Direction',
            description: 'Layout direction of radio buttons',
            defaultValue: 'vertical',
            options: [
              { label: 'Vertical', value: 'vertical' },
              { label: 'Horizontal', value: 'horizontal' }
            ] as SelectOption[]
          },
          {
            name: 'buttonStyle',
            type: PropertyType.SELECT,
            label: 'Button Style',
            description: 'Style of radio buttons',
            defaultValue: 'outline',
            options: [
              { label: 'Outline', value: 'outline' },
              { label: 'Solid', value: 'solid' }
            ] as SelectOption[]
          },
          {
            name: 'size',
            type: PropertyType.SELECT,
            label: 'Size',
            description: 'Size of radio buttons',
            defaultValue: 'default',
            options: [
              { label: 'Large', value: 'large' },
              { label: 'Default', value: 'default' },
              { label: 'Small', value: 'small' }
            ] as SelectOption[]
          },
          {
            name: 'options',
            type: PropertyType.ARRAY,
            label: 'Options',
            description: 'List of radio options',
            defaultValue: []
          }
        ]
      }
    ]
  },
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Button Element Property Sections
 */
export const BUTTON_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'button-specific',
    title: 'Button Specific',
    groups: [
      {
        id: 'button-options',
        title: 'Button Options',
        properties: [
          {
            name: 'text',
            type: PropertyType.TEXT,
            label: 'Button Text',
            description: 'Text displayed on the button',
            required: true,
            placeholder: 'Enter button text...'
          },
          {
            name: 'htmlButtonType',
            type: PropertyType.SELECT,
            label: 'HTML Button Type',
            description: 'HTML button type attribute',
            defaultValue: 'button',
            options: [
              { label: 'Button', value: 'button' },
              { label: 'Submit', value: 'submit' },
              { label: 'Reset', value: 'reset' }
            ] as SelectOption[]
          },
          {
            name: 'buttonType',
            type: PropertyType.SELECT,
            label: 'Button Type',
            description: 'Visual style of the button',
            defaultValue: 'default',
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Default', value: 'default' },
              { label: 'Dashed', value: 'dashed' },
              { label: 'Text', value: 'text' },
              { label: 'Link', value: 'link' }
            ] as SelectOption[]
          },
          {
            name: 'size',
            type: PropertyType.SELECT,
            label: 'Size',
            description: 'Size of the button',
            defaultValue: 'default',
            options: [
              { label: 'Large', value: 'large' },
              { label: 'Default', value: 'default' },
              { label: 'Small', value: 'small' }
            ] as SelectOption[]
          },
          {
            name: 'shape',
            type: PropertyType.SELECT,
            label: 'Shape',
            description: 'Shape of the button',
            defaultValue: undefined,
            options: [
              { label: 'Default', value: undefined },
              { label: 'Circle', value: 'circle' },
              { label: 'Round', value: 'round' }
            ] as SelectOption[]
          },
          {
            name: 'icon',
            type: PropertyType.TEXT,
            label: 'Icon',
            description: 'Icon name (from ng-zorro icons)',
            placeholder: 'Enter icon name...'
          },
          {
            name: 'loading',
            type: PropertyType.BOOLEAN,
            label: 'Loading State',
            description: 'Show loading spinner',
            defaultValue: false
          },
          {
            name: 'block',
            type: PropertyType.BOOLEAN,
            label: 'Block',
            description: 'Make button full width',
            defaultValue: false
          },
          {
            name: 'ghost',
            type: PropertyType.BOOLEAN,
            label: 'Ghost',
            description: 'Make button background transparent',
            defaultValue: false
          },
          {
            name: 'danger',
            type: PropertyType.BOOLEAN,
            label: 'Danger',
            description: 'Use danger styling',
            defaultValue: false
          },
          {
            name: 'href',
            type: PropertyType.TEXT,
            label: 'Link URL',
            description: 'URL to navigate to when clicked',
            placeholder: 'Enter URL...'
          },
          {
            name: 'target',
            type: PropertyType.SELECT,
            label: 'Link Target',
            description: 'How to open the link',
            defaultValue: '_self',
            options: [
              { label: 'Current Tab', value: '_self' },
              { label: 'New Tab', value: '_blank' },
              { label: 'Parent Frame', value: '_parent' },
              { label: 'Top Frame', value: '_top' }
            ] as SelectOption[],
            condition: {
              field: 'href',
              operator: 'exists',
              value: true
            }
          }
        ]
      }
    ]
  },
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Container Element Property Sections
 */
export const CONTAINER_ELEMENT_PROPERTY_SECTIONS: PropertySection[] = [
  BASIC_PROPERTIES_SECTION,
  {
    id: 'container-specific',
    title: 'Container Specific',
    groups: [
      {
        id: 'container-options',
        title: 'Container Options',
        properties: [
          {
            name: 'containerLayout',
            type: PropertyType.SELECT,
            label: 'Layout',
            description: 'Layout direction of child elements',
            defaultValue: 'vertical',
            options: [
              { label: 'Vertical', value: 'vertical' },
              { label: 'Horizontal', value: 'horizontal' },
              { label: 'Grid', value: 'grid' }
            ] as SelectOption[]
          },
          {
            name: 'spacing',
            type: PropertyType.NUMBER,
            label: 'Spacing',
            description: 'Spacing between child elements',
            defaultValue: 8,
            min: 0,
            max: 50
          },
          {
            name: 'justify',
            type: PropertyType.SELECT,
            label: 'Justify Content',
            description: 'How to justify child elements',
            defaultValue: 'start',
            options: [
              { label: 'Start', value: 'start' },
              { label: 'End', value: 'end' },
              { label: 'Center', value: 'center' },
              { label: 'Space Between', value: 'space-between' },
              { label: 'Space Around', value: 'space-around' }
            ] as SelectOption[]
          },
          {
            name: 'align',
            type: PropertyType.SELECT,
            label: 'Align Items',
            description: 'How to align child elements',
            defaultValue: 'start',
            options: [
              { label: 'Start', value: 'start' },
              { label: 'End', value: 'end' },
              { label: 'Center', value: 'center' },
              { label: 'Stretch', value: 'stretch' }
            ] as SelectOption[]
          },
          {
            name: 'wrap',
            type: PropertyType.BOOLEAN,
            label: 'Wrap',
            description: 'Allow child elements to wrap to next line',
            defaultValue: true
          }
        ]
      }
    ]
  },
  LAYOUT_PROPERTIES_SECTION,
  STYLE_PROPERTIES_SECTION
];

/**
 * Get property sections for an element type
 * 
 * @param elementType The type of element
 * @returns Array of property sections for the element type
 */
export function getElementPropertySections(elementType: string): PropertySection[] {
  switch (elementType) {
    case 'input':
      return INPUT_ELEMENT_PROPERTY_SECTIONS;
    case 'textarea':
      return TEXTAREA_ELEMENT_PROPERTY_SECTIONS;
    case 'select':
      return SELECT_ELEMENT_PROPERTY_SECTIONS;
    case 'checkbox':
      return CHECKBOX_ELEMENT_PROPERTY_SECTIONS;
    case 'radio-group':
      return RADIO_GROUP_ELEMENT_PROPERTY_SECTIONS;
    case 'button':
      return BUTTON_ELEMENT_PROPERTY_SECTIONS;
    case 'container':
      return CONTAINER_ELEMENT_PROPERTY_SECTIONS;
    default:
      // For unknown element types, return basic properties
      return [
        BASIC_PROPERTIES_SECTION,
        LAYOUT_PROPERTIES_SECTION,
        STYLE_PROPERTIES_SECTION
      ];
  }
}