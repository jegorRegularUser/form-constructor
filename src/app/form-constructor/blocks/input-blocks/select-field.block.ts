/**
 * Select Dropdown Block Definition for GrapesJS
 */

import { ComponentDefinition } from '../../../core/models';

// Define block structure interface
interface BlockDefinition {
  id: string;
  label: string;
  category: string;
  media: string;
  content: any;
}

export const SelectFieldBlock: BlockDefinition = {
  id: 'angular-select-field',
  label: 'Select Dropdown',
  category: 'Form Elements',
  media: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
  </svg>`,
  content: {
    type: 'angular-select-field',
    tagName: 'div',
    attributes: { 
      class: 'form-group',
      'data-component': 'select-field'
    },
    components: [
      {
        tagName: 'label',
        type: 'text',
        content: 'Select Label',
        attributes: { 
          class: 'form-label',
          for: 'select-{{id}}'
        }
      },
      {
        tagName: 'select',
        attributes: {
          class: 'form-control',
          id: 'select-{{id}}',
          name: 'selectField'
        },
        components: [
          {
            tagName: 'option',
            content: 'Choose an option',
            attributes: { value: '', disabled: true, selected: true }
          },
          {
            tagName: 'option',
            content: 'Option 1',
            attributes: { value: 'option1' }
          },
          {
            tagName: 'option',
            content: 'Option 2',
            attributes: { value: 'option2' }
          },
          {
            tagName: 'option',
            content: 'Option 3',
            attributes: { value: 'option3' }
          }
        ]
      }
    ]
  }
};

export const SelectFieldComponent: ComponentDefinition = {
  id: 'angular-select-field',
  type: 'select',
  label: 'Select Dropdown',
  category: 'form-elements',
  description: 'Dropdown selection field with customizable options',
  properties: [
    {
      name: 'label',
      type: 'text',
      label: 'Label Text',
      defaultValue: 'Select Label',
      group: 'content'
    },
    {
      name: 'formControlName',
      type: 'text',
      label: 'Form Control Name',
      defaultValue: 'selectField',
      group: 'form'
    },
    {
      name: 'required',
      type: 'boolean',
      label: 'Required',
      defaultValue: false,
      group: 'validation'
    },
    {
      name: 'disabled',
      type: 'boolean',
      label: 'Disabled',
      defaultValue: false,
      group: 'content'
    },
    {
      name: 'multiple',
      type: 'boolean',
      label: 'Multiple Selection',
      defaultValue: false,
      group: 'content'
    },
    {
      name: 'size',
      type: 'number',
      label: 'Visible Options',
      defaultValue: 1,
      group: 'content',
      conditional: {
        property: 'multiple',
        operator: 'equals',
        value: true
      }
    },
    {
      name: 'options',
      type: 'array',
      label: 'Options',
      defaultValue: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      group: 'content'
    }
  ],
  defaultStyling: {
    classes: ['form-group'],
    styles: {
      'margin-bottom': 'var(--space-4)'
    }
  },
  template: {
    html: `<div class="form-group">
      <label class="form-label" for="{{id}}">{{label}}</label>
      <select 
        class="form-control" 
        id="{{id}}"
        name="{{formControlName}}"
        {{#if required}}required{{/if}}
        {{#if disabled}}disabled{{/if}}
        {{#if multiple}}multiple{{/if}}
        {{#if size}}size="{{size}}"{{/if}}
      >
        <option value="" disabled selected>Choose an option</option>
        {{#each options}}
        <option value="{{value}}" {{#if disabled}}disabled{{/if}}>{{label}}</option>
        {{/each}}
      </select>
      {{#if required}}<div class="form-error" *ngIf="form.get('{{formControlName}}')?.invalid && form.get('{{formControlName}}')?.touched">
        Please select an option
      </div>{{/if}}
    </div>`,
    variables: [
      { name: 'id', type: 'string', defaultValue: 'select-field' },
      { name: 'label', type: 'string', defaultValue: 'Select Label' },
      { name: 'formControlName', type: 'string', defaultValue: 'selectField' },
      { name: 'required', type: 'boolean', defaultValue: false },
      { name: 'disabled', type: 'boolean', defaultValue: false },
      { name: 'multiple', type: 'boolean', defaultValue: false },
      { name: 'size', type: 'number', defaultValue: 1 },
      { name: 'options', type: 'array', defaultValue: [] }
    ]
  },
  preview: {
    width: '300px',
    height: '80px',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNOCA5bDQtNCA0IDRtMCA2bC00IDQtNC00Ii8+Cjwvc3ZnPg=='
  }
};

// GrapesJS specific registration
export function registerSelectFieldBlock(editor: any): void {
  const blockManager = editor.Blocks;
  const domComponents = editor.DomComponents;

  // Register the component type
  domComponents.addType('angular-select-field', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'form-group',
          'data-component': 'select-field'
        },
        components: SelectFieldBlock.content.components,
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label Text',
            changeProp: true
          },
          {
            type: 'text',
            name: 'formControlName',
            label: 'Form Control Name'
          },
          {
            type: 'checkbox',
            name: 'required',
            label: 'Required'
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: 'Disabled'
          },
          {
            type: 'checkbox',
            name: 'multiple',
            label: 'Multiple Selection'
          },
          {
            type: 'number',
            name: 'size',
            label: 'Visible Options',
            min: 1,
            max: 10
          }
        ]
      }
    },
    view: {
      events: {
        dblclick: 'onActive'
      },
      onActive() {
        console.log('Select field activated for editing');
      }
    }
  });

  // Add the block to the block manager
  blockManager.add(SelectFieldBlock.id, {
    label: SelectFieldBlock.label,
    category: SelectFieldBlock.category,
    media: SelectFieldBlock.media,
    content: { type: 'angular-select-field' }
  });
}