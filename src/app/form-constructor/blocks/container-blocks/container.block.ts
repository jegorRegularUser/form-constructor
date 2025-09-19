/**
 * Container Block Definition for GrapesJS
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

export const ContainerBlock: BlockDefinition = {
  id: 'angular-container',
  label: 'Container',
  category: 'Layout',
  media: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
  </svg>`,
  content: {
    type: 'angular-container',
    tagName: 'div',
    attributes: { 
      class: 'form-container',
      'data-component': 'container'
    },
    content: '<p class="text-gray-500 text-center p-4">Drop form elements here</p>',
    droppable: true
  }
};

export const ContainerComponent: ComponentDefinition = {
  id: 'angular-container',
  type: 'container',
  label: 'Form Container',
  category: 'layout',
  description: 'Layout container for organizing form elements',
  properties: [
    {
      name: 'layout',
      type: 'select',
      label: 'Layout Type',
      defaultValue: 'block',
      options: [
        { value: 'block', label: 'Block' },
        { value: 'flex', label: 'Flexbox' },
        { value: 'grid', label: 'CSS Grid' }
      ],
      group: 'layout'
    },
    {
      name: 'direction',
      type: 'select',
      label: 'Flex Direction',
      defaultValue: 'column',
      options: [
        { value: 'row', label: 'Row' },
        { value: 'column', label: 'Column' },
        { value: 'row-reverse', label: 'Row Reverse' },
        { value: 'column-reverse', label: 'Column Reverse' }
      ],
      group: 'layout',
      conditional: {
        property: 'layout',
        operator: 'equals',
        value: 'flex'
      }
    },
    {
      name: 'justifyContent',
      type: 'select',
      label: 'Justify Content',
      defaultValue: 'flex-start',
      options: [
        { value: 'flex-start', label: 'Start' },
        { value: 'flex-end', label: 'End' },
        { value: 'center', label: 'Center' },
        { value: 'space-between', label: 'Space Between' },
        { value: 'space-around', label: 'Space Around' },
        { value: 'space-evenly', label: 'Space Evenly' }
      ],
      group: 'layout',
      conditional: {
        property: 'layout',
        operator: 'equals',
        value: 'flex'
      }
    },
    {
      name: 'alignItems',
      type: 'select',
      label: 'Align Items',
      defaultValue: 'stretch',
      options: [
        { value: 'stretch', label: 'Stretch' },
        { value: 'flex-start', label: 'Start' },
        { value: 'flex-end', label: 'End' },
        { value: 'center', label: 'Center' },
        { value: 'baseline', label: 'Baseline' }
      ],
      group: 'layout',
      conditional: {
        property: 'layout',
        operator: 'equals',
        value: 'flex'
      }
    },
    {
      name: 'columns',
      type: 'number',
      label: 'Grid Columns',
      defaultValue: 2,
      group: 'layout',
      conditional: {
        property: 'layout',
        operator: 'equals',
        value: 'grid'
      }
    },
    {
      name: 'gap',
      type: 'text',
      label: 'Gap',
      defaultValue: 'var(--space-4)',
      group: 'layout'
    },
    {
      name: 'padding',
      type: 'text',
      label: 'Padding',
      defaultValue: 'var(--space-4)',
      group: 'spacing'
    },
    {
      name: 'margin',
      type: 'text',
      label: 'Margin',
      defaultValue: '0',
      group: 'spacing'
    },
    {
      name: 'borderRadius',
      type: 'text',
      label: 'Border Radius',
      defaultValue: 'var(--radius-md)',
      group: 'styling'
    },
    {
      name: 'backgroundColor',
      type: 'color',
      label: 'Background Color',
      defaultValue: 'transparent',
      group: 'styling'
    },
    {
      name: 'border',
      type: 'text',
      label: 'Border',
      defaultValue: '1px solid var(--gray-200)',
      group: 'styling'
    }
  ],
  defaultStyling: {
    classes: ['form-container'],
    styles: {
      'padding': 'var(--space-4)',
      'border': '1px solid var(--gray-200)',
      'border-radius': 'var(--radius-md)',
      'min-height': '100px'
    }
  },
  template: {
    html: `<div 
      class="form-container {{#if layout}}layout-{{layout}}{{/if}}"
      style="
        {{#if layout === 'flex'}}
        display: flex;
        flex-direction: {{direction}};
        justify-content: {{justifyContent}};
        align-items: {{alignItems}};
        {{/if}}
        {{#if layout === 'grid'}}
        display: grid;
        grid-template-columns: repeat({{columns}}, 1fr);
        {{/if}}
        gap: {{gap}};
        padding: {{padding}};
        margin: {{margin}};
        border-radius: {{borderRadius}};
        background-color: {{backgroundColor}};
        border: {{border}};
      "
    >
      <!-- Child components will be inserted here -->
    </div>`,
    variables: [
      { name: 'layout', type: 'string', defaultValue: 'block' },
      { name: 'direction', type: 'string', defaultValue: 'column' },
      { name: 'justifyContent', type: 'string', defaultValue: 'flex-start' },
      { name: 'alignItems', type: 'string', defaultValue: 'stretch' },
      { name: 'columns', type: 'number', defaultValue: 2 },
      { name: 'gap', type: 'string', defaultValue: 'var(--space-4)' },
      { name: 'padding', type: 'string', defaultValue: 'var(--space-4)' },
      { name: 'margin', type: 'string', defaultValue: '0' },
      { name: 'borderRadius', type: 'string', defaultValue: 'var(--radius-md)' },
      { name: 'backgroundColor', type: 'string', defaultValue: 'transparent' },
      { name: 'border', type: 'string', defaultValue: '1px solid var(--gray-200)' }
    ]
  },
  preview: {
    width: '300px',
    height: '120px',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNMTkgMTFINW0xNCAwYTIgMiAwIDAxMiAydjZhMiAyIDAgMDEtMiAySDVhMiAyIDAgMDEtMi0ydi02YTIgMiAwIDAxMi0ybTE0IDBWOWEyIDIgMCAwMC0yLTJNNSAxMVY5YTIgMiAwIDAxMi0ybTAgMFY1YTIgMiAwIDAxMi0yaDZhMiAyIDAgMDEyIDJ2Mk03IDdoMTAiLz4KPC9zdmc+'
  }
};

// GrapesJS specific registration
export function registerContainerBlock(editor: any): void {
  const blockManager = editor.Blocks;
  const domComponents = editor.DomComponents;

  // Register the component type
  domComponents.addType('angular-container', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: {
          class: 'form-container',
          'data-component': 'container',
          'data-droppable': 'true'
        },
        content: '<p class="text-gray-500 text-center p-4">Drop form elements here</p>',
        droppable: true,
        draggable: true,
        selectable: true,
        hoverable: true,
        highlightable: true,
        resizable: true,
        editable: true,
        stylable: true,
        traits: [
          {
            type: 'select',
            name: 'layout',
            label: 'Layout Type',
            options: [
              { value: 'block', name: 'Block' },
              { value: 'flex', name: 'Flexbox' },
              { value: 'grid', name: 'CSS Grid' }
            ],
            changeProp: 1
          },
          {
            type: 'text',
            name: 'gap',
            label: 'Gap',
            changeProp: 1
          },
          {
            type: 'text',
            name: 'padding',
            label: 'Padding',
            changeProp: 1
          },
          {
            type: 'color',
            name: 'backgroundColor',
            label: 'Background Color',
            changeProp: 1
          }
        ]
      }
    },
    view: {
      events: {
        dblclick: 'onActive'
      },
      
      onActive() {
        console.log('Container activated for editing');
      }
    }
  });

  // Setup global event listeners for container interactions
  editor.on('component:drop', (component: any) => {
    // Check if the component was dropped inside a container
    if (component && component.parent) {
      const parent = component.parent();
      if (parent && parent.get('data-component') === 'container') {
        console.log('Component dropped inside container:', component);
        
        // Ensure the component is properly positioned
        if (component.set) {
          const currentStyle = component.get('style') || {};
          component.set('style', {
            ...currentStyle,
            position: 'relative',
            marginBottom: '1rem'
          });
        }
        
        // Remove placeholder text if it exists
        try {
          const components = parent.get('components');
          if (components && components.length > 1) {
            const placeholder = components.find((c: any) =>
              c.get('content') === '<p class="text-gray-500 text-center p-4">Drop form elements here</p>'
            );
            if (placeholder) {
              components.remove(placeholder);
            }
          }
        } catch (error) {
          console.warn('Error removing placeholder:', error);
        }
      }
    }
  });

  // Add the block to the block manager
  blockManager.add(ContainerBlock.id, {
    label: ContainerBlock.label,
    category: ContainerBlock.category,
    media: ContainerBlock.media,
    content: { type: 'angular-container' },
    attributes: { draggable: true }
  });
}