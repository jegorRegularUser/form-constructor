/**
 * Button Block Definition for GrapesJS
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

export const ButtonBlock: BlockDefinition = {
  id: 'angular-button',
  label: 'Button',
  category: 'Actions',
  media: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
  </svg>`,
  content: {
    type: 'angular-button',
    tagName: 'button',
    attributes: { 
      class: 'btn btn-primary',
      'data-component': 'button',
      type: 'button'
    },
    content: 'Button Text'
  }
};

export const ButtonComponent: ComponentDefinition = {
  id: 'angular-button',
  type: 'button',
  label: 'Button',
  category: 'actions',
  description: 'Interactive button with customizable styling and actions',
  properties: [
    {
      name: 'text',
      type: 'text',
      label: 'Button Text',
      defaultValue: 'Button Text',
      group: 'content'
    },
    {
      name: 'buttonType',
      type: 'select',
      label: 'Button Type',
      defaultValue: 'button',
      options: [
        { value: 'button', label: 'Button' },
        { value: 'submit', label: 'Submit' },
        { value: 'reset', label: 'Reset' }
      ],
      group: 'form'
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'success', label: 'Success' },
        { value: 'danger', label: 'Danger' },
        { value: 'warning', label: 'Warning' },
        { value: 'info', label: 'Info' },
        { value: 'ghost', label: 'Ghost' }
      ],
      group: 'styling'
    },
    {
      name: 'size',
      type: 'select',
      label: 'Size',
      defaultValue: 'md',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' }
      ],
      group: 'styling'
    },
    {
      name: 'disabled',
      type: 'boolean',
      label: 'Disabled',
      defaultValue: false,
      group: 'content'
    },
    {
      name: 'loading',
      type: 'boolean',
      label: 'Loading State',
      defaultValue: false,
      group: 'content'
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      label: 'Full Width',
      defaultValue: false,
      group: 'styling'
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon (SVG or class)',
      group: 'content'
    },
    {
      name: 'iconPosition',
      type: 'select',
      label: 'Icon Position',
      defaultValue: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' }
      ],
      group: 'content',
      conditional: {
        property: 'icon',
        operator: 'not-equals',
        value: ''
      }
    },
    {
      name: 'onClick',
      type: 'text',
      label: 'Click Handler',
      defaultValue: 'onButtonClick()',
      group: 'events'
    }
  ],
  defaultStyling: {
    classes: ['btn', 'btn-primary'],
    styles: {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'padding': 'var(--space-2) var(--space-4)',
      'border-radius': 'var(--radius-md)',
      'transition': 'all var(--transition-fast)'
    }
  },
  template: {
    html: `<button 
      type="{{buttonType}}" 
      class="btn btn-{{variant}} btn-{{size}}{{#if fullWidth}} w-full{{/if}}"
      {{#if disabled}}disabled{{/if}}
      (click)="{{onClick}}"
    >
      {{#if icon}}{{#if iconPosition === 'left'}}<i class="{{icon}} mr-1"></i>{{/if}}{{/if}}
      {{#if loading}}<span class="loading-spinner mr-1"></span>{{/if}}
      {{text}}
      {{#if icon}}{{#if iconPosition === 'right'}}<i class="{{icon}} ml-1"></i>{{/if}}{{/if}}
    </button>`,
    variables: [
      { name: 'text', type: 'string', defaultValue: 'Button Text' },
      { name: 'buttonType', type: 'string', defaultValue: 'button' },
      { name: 'variant', type: 'string', defaultValue: 'primary' },
      { name: 'size', type: 'string', defaultValue: 'md' },
      { name: 'disabled', type: 'boolean', defaultValue: false },
      { name: 'loading', type: 'boolean', defaultValue: false },
      { name: 'fullWidth', type: 'boolean', defaultValue: false },
      { name: 'icon', type: 'string', defaultValue: '' },
      { name: 'iconPosition', type: 'string', defaultValue: 'left' },
      { name: 'onClick', type: 'string', defaultValue: 'onButtonClick()' }
    ]
  },
  preview: {
    width: '200px',
    height: '50px',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNMTIgNnY2bTAgMHY2bTAtNmg2bS02IDBINU2iLz4KPC9zdmc+'
  }
};

// GrapesJS specific registration
export function registerButtonBlock(editor: any): void {
  const blockManager = editor.Blocks;
  const domComponents = editor.DomComponents;

  // Register the component type
  domComponents.addType('angular-button', {
    model: {
      defaults: {
        tagName: 'button',
        attributes: { 
          class: 'btn btn-primary',
          'data-component': 'button',
          type: 'button'
        },
        content: 'Button Text',
        traits: [
          {
            type: 'text',
            name: 'text',
            label: 'Button Text',
            changeProp: true
          },
          {
            type: 'select',
            name: 'buttonType',
            label: 'Button Type',
            options: [
              { value: 'button', name: 'Button' },
              { value: 'submit', name: 'Submit' },
              { value: 'reset', name: 'Reset' }
            ]
          },
          {
            type: 'select',
            name: 'variant',
            label: 'Style Variant',
            options: [
              { value: 'primary', name: 'Primary' },
              { value: 'secondary', name: 'Secondary' },
              { value: 'success', name: 'Success' },
              { value: 'danger', name: 'Danger' },
              { value: 'warning', name: 'Warning' },
              { value: 'ghost', name: 'Ghost' }
            ]
          },
          {
            type: 'select',
            name: 'size',
            label: 'Size',
            options: [
              { value: 'sm', name: 'Small' },
              { value: 'md', name: 'Medium' },
              { value: 'lg', name: 'Large' }
            ]
          },
          {
            type: 'checkbox',
            name: 'disabled',
            label: 'Disabled'
          },
          {
            type: 'checkbox',
            name: 'fullWidth',
            label: 'Full Width'
          },
          {
            type: 'text',
            name: 'onClick',
            label: 'Click Handler'
          }
        ]
      }
    },
    view: {
      events: {
        dblclick: 'onActive'
      },
      onActive() {
        console.log('Button activated for editing');
      }
    }
  });

  // Add the block to the block manager
  blockManager.add(ButtonBlock.id, {
    label: ButtonBlock.label,
    category: ButtonBlock.category,
    media: ButtonBlock.media,
    content: { type: 'angular-button' }
  });
}