/**
 * Checkbox Field Block Definition for GrapesJS
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

export const CheckboxFieldBlock: BlockDefinition = {
  id: 'angular-checkbox-field',
  label: 'Checkbox',
  category: 'Form Elements',
  media: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`,
  content: {
    type: 'angular-checkbox-field',
    tagName: 'div',
    attributes: { 
      class: 'form-group form-check',
      'data-component': 'checkbox-field'
    },
    components: [
      {
        tagName: 'input',
        attributes: {
          type: 'checkbox',
          class: 'form-check-input',
          id: 'checkbox-{{id}}',
          name: 'checkboxField',
          value: 'true'
        }
      },
      {
        tagName: 'label',
        type: 'text',
        content: 'Checkbox Label',
        attributes: { 
          class: 'form-check-label',
          for: 'checkbox-{{id}}'
        }
      }
    ]
  }
};

export const CheckboxFieldComponent: ComponentDefinition = {
  id: 'angular-checkbox-field',
  type: 'checkbox',
  label: 'Checkbox Field',
  category: 'form-elements',
  description: 'Checkbox input with label and validation support',
  properties: [
    {
      name: 'label',
      type: 'text',
      label: 'Label Text',
      defaultValue: 'Checkbox Label',
      group: 'content'
    },
    {
      name: 'formControlName',
      type: 'text',
      label: 'Form Control Name',
      defaultValue: 'checkboxField',
      group: 'form'
    },
    {
      name: 'value',
      type: 'text',
      label: 'Value',
      defaultValue: 'true',
      group: 'content'
    },
    {
      name: 'checked',
      type: 'boolean',
      label: 'Initially Checked',
      defaultValue: false,
      group: 'content'
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
      name: 'indeterminate',
      type: 'boolean',
      label: 'Indeterminate State',
      defaultValue: false,
      group: 'content'
    }
  ],
  defaultStyling: {
    classes: ['form-group', 'form-check'],
    styles: {
      'margin-bottom': 'var(--space-4)',
      'display': 'flex',
      'align-items': 'center',
      'gap': 'var(--space-2)'
    }
  },
  template: {
    html: `<div class="form-group form-check">
      <input 
        type="checkbox" 
        class="form-check-input" 
        id="{{id}}"
        name="{{formControlName}}"
        value="{{value}}"
        {{#if checked}}checked{{/if}}
        {{#if required}}required{{/if}}
        {{#if disabled}}disabled{{/if}}
        {{#if indeterminate}}indeterminate{{/if}}
      />
      <label class="form-check-label" for="{{id}}">{{label}}</label>
      {{#if required}}<div class="form-error" *ngIf="form.get('{{formControlName}}')?.invalid && form.get('{{formControlName}}')?.touched">
        This field is required
      </div>{{/if}}
    </div>`,
    variables: [
      { name: 'id', type: 'string', defaultValue: 'checkbox-field' },
      { name: 'label', type: 'string', defaultValue: 'Checkbox Label' },
      { name: 'formControlName', type: 'string', defaultValue: 'checkboxField' },
      { name: 'value', type: 'string', defaultValue: 'true' },
      { name: 'checked', type: 'boolean', defaultValue: false },
      { name: 'required', type: 'boolean', defaultValue: false },
      { name: 'disabled', type: 'boolean', defaultValue: false },
      { name: 'indeterminate', type: 'boolean', defaultValue: false }
    ]
  },
  preview: {
    width: '300px',
    height: '60px',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNOSAxMmwyIDIgNC00bTYgMmE5IDkgMCAxMS0xOCAwIDkgOSAwIDAxMTggMHoiLz4KPC9zdmc+'
  }
};

// GrapesJS specific registration
export function registerCheckboxFieldBlock(editor: any): void {
  const blockManager = editor.Blocks;
  const domComponents = editor.DomComponents;

  // Register the component type
  domComponents.addType('angular-checkbox-field', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { 
          class: 'form-group form-check',
          'data-component': 'checkbox-field'
        },
        components: CheckboxFieldBlock.content.components,
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
            type: 'text',
            name: 'value',
            label: 'Value'
          },
          {
            type: 'checkbox',
            name: 'checked',
            label: 'Initially Checked'
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
          }
        ]
      }
    },
    view: {
      events: {
        dblclick: 'onActive'
      },
      onActive() {
        console.log('Checkbox field activated for editing');
      }
    }
  });

  // Add the block to the block manager
  blockManager.add(CheckboxFieldBlock.id, {
    label: CheckboxFieldBlock.label,
    category: CheckboxFieldBlock.category,
    media: CheckboxFieldBlock.media,
    content: { type: 'angular-checkbox-field' }
  });
}