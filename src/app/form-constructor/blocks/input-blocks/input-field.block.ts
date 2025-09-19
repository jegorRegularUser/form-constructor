/**
 * Input Field Block Definition for GrapesJS
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

export const InputFieldBlock: BlockDefinition = {
  id: 'angular-input-field',
  label: 'Text Input',
  category: 'Form Elements',
  media: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>`,
  content: {
    type: 'angular-input-field',
    tagName: 'div',
    attributes: { 
      class: 'form-group',
      'data-component': 'input-field'
    },
    components: [
      {
        tagName: 'label',
        type: 'text',
        content: 'Input Label',
        attributes: { 
          class: 'form-label',
          for: 'input-{{id}}'
        }
      },
      {
        tagName: 'input',
        attributes: {
          type: 'text',
          class: 'form-control',
          placeholder: 'Enter your text',
          id: 'input-{{id}}',
          name: 'inputField'
        }
      }
    ]
  }
};

export const InputFieldComponent: ComponentDefinition = {
  id: 'angular-input-field',
  type: 'input',
  label: 'Input Field',
  category: 'form-elements',
  description: 'Text input field with label and validation support',
  properties: [
    {
      name: 'label',
      type: 'text',
      label: 'Label Text',
      defaultValue: 'Input Label',
      group: 'content'
    },
    {
      name: 'placeholder',
      type: 'text',
      label: 'Placeholder',
      defaultValue: 'Enter your text',
      group: 'content'
    },
    {
      name: 'inputType',
      type: 'select',
      label: 'Input Type',
      defaultValue: 'text',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'email', label: 'Email' },
        { value: 'password', label: 'Password' },
        { value: 'number', label: 'Number' },
        { value: 'tel', label: 'Phone' },
        { value: 'url', label: 'URL' },
        { value: 'date', label: 'Date' },
        { value: 'time', label: 'Time' }
      ],
      group: 'content'
    },
    {
      name: 'formControlName',
      type: 'text',
      label: 'Form Control Name',
      defaultValue: 'inputField',
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
      name: 'readonly',
      type: 'boolean',
      label: 'Read Only',
      defaultValue: false,
      group: 'content'
    },
    {
      name: 'minLength',
      type: 'number',
      label: 'Minimum Length',
      group: 'validation'
    },
    {
      name: 'maxLength',
      type: 'number',
      label: 'Maximum Length',
      group: 'validation'
    },
    {
      name: 'pattern',
      type: 'text',
      label: 'Pattern (Regex)',
      group: 'validation'
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
      <input 
        type="{{inputType}}" 
        class="form-control" 
        id="{{id}}"
        name="{{formControlName}}"
        placeholder="{{placeholder}}"
        {{#if required}}required{{/if}}
        {{#if disabled}}disabled{{/if}}
        {{#if readonly}}readonly{{/if}}
      />
      {{#if required}}<div class="form-error" *ngIf="form.get('{{formControlName}}')?.invalid && form.get('{{formControlName}}')?.touched">
        This field is required
      </div>{{/if}}
    </div>`,
    variables: [
      { name: 'id', type: 'string', defaultValue: 'input-field' },
      { name: 'label', type: 'string', defaultValue: 'Input Label' },
      { name: 'inputType', type: 'string', defaultValue: 'text' },
      { name: 'formControlName', type: 'string', defaultValue: 'inputField' },
      { name: 'placeholder', type: 'string', defaultValue: 'Enter your text' },
      { name: 'required', type: 'boolean', defaultValue: false },
      { name: 'disabled', type: 'boolean', defaultValue: false },
      { name: 'readonly', type: 'boolean', defaultValue: false }
    ]
  },
  preview: {
    width: '300px',
    height: '80px',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNOSAxMmg2bS02IDRoNm0yIDVIN2EyIDIgMCAwMS0yLTJWNWEyIDIgMCAwMTItMmg1LjU4NmExIDEgMCAwMS43MDcuMjkzbDUuNDE0IDUuNDE0YTEgMSAwIDAxLjI5My43MDdWMTlhMiAyIDAgMDEtMiAyeiIvPgo8L3N2Zz4='
  }
};

// GrapesJS specific registration
export function registerInputFieldBlock(editor: any): void {
  const blockManager = editor.Blocks;
  const domComponents = editor.DomComponents;

  // Register the component type
  domComponents.addType('angular-input-field', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          class: 'form-group',
          'data-component': 'input-field'
        },
        components: [
          {
            tagName: 'label',
            type: 'textnode',
            content: 'Input Label',
            attributes: {
              class: 'form-label',
              for: 'input-{{id}}'
            }
          },
          {
            tagName: 'input',
            attributes: {
              type: 'text',
              class: 'form-control',
              placeholder: 'Enter your text',
              id: 'input-{{id}}',
              name: 'inputField'
            }
          }
        ],
        traits: [
          {
            type: 'text',
            name: 'label',
            label: 'Label Text',
            changeProp: true
          },
          {
            type: 'text',
            name: 'placeholder',
            label: 'Placeholder',
            changeProp: true
          },
          {
            type: 'select',
            name: 'inputType',
            label: 'Input Type',
            options: [
              { value: 'text', name: 'Text' },
              { value: 'email', name: 'Email' },
              { value: 'password', name: 'Password' },
              { value: 'number', name: 'Number' },
              { value: 'tel', name: 'Phone' },
              { value: 'url', name: 'URL' },
              { value: 'date', name: 'Date' },
              { value: 'time', name: 'Time' }
            ],
            changeProp: true
          },
          {
            type: 'text',
            name: 'formControlName',
            label: 'Form Control Name',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'required',
            label: 'Required',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: 'Disabled',
            changeProp: true
          },
          {
            type: 'checkbox',
            name: 'readonly',
            label: 'Read Only',
            changeProp: true
          },
          {
            type: 'number',
            name: 'minLength',
            label: 'Min Length',
            changeProp: true
          },
          {
            type: 'number',
            name: 'maxLength',
            label: 'Max Length',
            changeProp: true
          }
        ]
      }
    },
    view: {
      events: {
        dblclick: 'onActive'
      },
      
      onActive() {
        // Custom behavior when component is activated for editing
        console.log('Input field activated for editing');
      }
    }
  });

  // Setup global event listeners for input field property changes
  editor.on('component:update', (component: any) => {
    if (component.get('data-component') === 'input-field') {
      // Update label text
      const label = component.get('attributes').label;
      if (label) {
        const components = component.get('components');
        const labelComponent = components.find((c: any) => c.get('tagName') === 'label');
        if (labelComponent) {
          labelComponent.set('content', label);
        }
      }
      
      // Update input placeholder
      const placeholder = component.get('attributes').placeholder;
      if (placeholder) {
        const components = component.get('components');
        const inputComponent = components.find((c: any) => c.get('tagName') === 'input');
        if (inputComponent) {
          const attrs = inputComponent.get('attributes');
          attrs.placeholder = placeholder;
          inputComponent.set('attributes', attrs);
        }
      }
      
      // Update input type
      const inputType = component.get('attributes').inputType;
      if (inputType) {
        const components = component.get('components');
        const inputComponent = components.find((c: any) => c.get('tagName') === 'input');
        if (inputComponent) {
          const attrs = inputComponent.get('attributes');
          attrs.type = inputType;
          inputComponent.set('attributes', attrs);
        }
      }
      
      // Update required attribute
      const required = component.get('attributes').required;
      const components = component.get('components');
      const inputComponent = components.find((c: any) => c.get('tagName') === 'input');
      if (inputComponent) {
        const attrs = inputComponent.get('attributes');
        if (required) {
          attrs.required = '';
        } else {
          delete attrs.required;
        }
        inputComponent.set('attributes', attrs);
      }
    }
  });

  // Add the block to the block manager
  blockManager.add(InputFieldBlock.id, {
    label: InputFieldBlock.label,
    category: InputFieldBlock.category,
    media: InputFieldBlock.media,
    content: { type: 'angular-input-field' }
  });
}