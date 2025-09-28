import { Injectable, signal } from '@angular/core';
import { FormBuilderService } from '../../../services/form-builder.service';
import { DroppedComponent, ComponentType, ComponentProperties } from '../../../core/models/component.model';

@Injectable({
  providedIn: 'root'
})
export class EditorPanelService {
  // Expose the form components signal from FormBuilderService
  public formComponents: any;
  
  constructor(private formBuilder: FormBuilderService) {
    this.formComponents = this.formBuilder.getDroppedComponents();
  }
  
  /**
   * Generate HTML representation of the form
   */
  generateFormHtml(): string {
    try {
      const components = this.formComponents();
      let html = '<form class="generated-form">\n';
      
      components.forEach((component: DroppedComponent) => {
        html += this.generateComponentHtml(component);
      });
      
      html += '</form>';
      return html;
    } catch (error) {
      console.error('Error generating form HTML:', error);
      return '<form class="generated-form error"><!-- Error generating form --></form>';
    }
  }
  
  /**
   * Generate HTML for a single component
   */
  private generateComponentHtml(component: DroppedComponent, indent: number = 2): string {
    const spaces = ' '.repeat(indent);
    let html = '';
    
    switch (component.type) {
      case 'input':
      case 'text-input':
      case 'email-input':
        html += `${spaces}<div class="form-group">\n`;
        html += `${spaces}  <label>${component.properties?.label || 'Input'}</label>\n`;
        html += `${spaces}  <input type="${component.type === 'email-input' ? 'email' : 'text'}" 
          placeholder="${component.properties?.placeholder || ''}"
          ${component.properties?.required ? 'required' : ''}>\n`;
        html += `${spaces}</div>\n`;
        break;
        
      case 'textarea':
        html += `${spaces}<div class="form-group">\n`;
        html += `${spaces}  <label>${component.properties?.label || 'Textarea'}</label>\n`;
        html += `${spaces}  <textarea rows="${component.properties?.['rows'] || 3}"
          placeholder="${component.properties?.['placeholder'] || ''}"></textarea>\n`;
        html += `${spaces}</div>\n`;
        break;
        
      case 'select':
        html += `${spaces}<div class="form-group">\n`;
        html += `${spaces}  <label>${component.properties?.label || 'Select'}</label>\n`;
        html += `${spaces}  <select>\n`;
        (component.properties?.['options'] || []).forEach((option: string) => {
          html += `${spaces}    <option value="${option}">${option}</option>\n`;
        });
        html += `${spaces}  </select>\n`;
        html += `${spaces}</div>\n`;
        break;
        
      case 'checkbox':
        html += `${spaces}<div class="form-check">\n`;
        html += `${spaces}  <input type="checkbox" id="${component.id}"
          ${component.properties?.['checked'] ? 'checked' : ''}>\n`;
        html += `${spaces}  <label for="${component.id}">${component.properties?.label || 'Checkbox'}</label>\n`;
        html += `${spaces}</div>\n`;
        break;
        
      case 'button':
        html += `${spaces}<button type="${component.properties?.['type'] || 'button'}"
          class="btn ${component.properties?.['variant'] || 'primary'}">\n`;
        html += `${spaces}  ${component.properties?.['text'] || 'Button'}\n`;
        html += `${spaces}</button>\n`;
        break;
        
      case 'container':
        html += `${spaces}<div class="container" style="${this.generateContainerStyles(component)}">\n`;
        if (component.children) {
          component.children.forEach(child => {
            html += this.generateComponentHtml(child, indent + 2);
          });
        }
        html += `${spaces}</div>\n`;
        break;
        
      default:
        html += `${spaces}<div class="component ${component.type}">Unknown component type: ${component.type}</div>\n`;
    }
    
    return html;
  }
  
  /**
   * Generate CSS styles for container components
   */
  private generateContainerStyles(component: DroppedComponent): string {
    const styles: string[] = [];
    
    if (component.properties?.['layout'] === 'flex') {
      styles.push('display: flex');
      styles.push(`flex-direction: ${component.properties?.['direction'] || 'column'}`);
      if (component.properties?.['gap']) {
        styles.push(`gap: ${component.properties['gap']}`);
      }
      if (component.properties?.['padding']) {
        styles.push(`padding: ${component.properties['padding']}`);
      }
    }
    
    if (component.properties?.['width']) {
      styles.push(`width: ${component.properties['width']}`);
    }
    
    return styles.join('; ');
  }
  
  /**
   * Clear all components from the form
   */
  clearComponents(): void {
    this.formBuilder.clearComponents();
  }
  
  /**
   * Add a component to the form
   */
  addComponent(component: DroppedComponent): void {
    this.formBuilder.addComponent(component);
  }
  
  /**
   * Find a container component by its type
   */
  findContainerByType(containerType: 'vertical' | 'horizontal'): DroppedComponent | null {
    const components = this.formComponents();
    
    for (const component of components) {
      if (component.type === 'container') {
        const layoutType = component.properties?.containerType || 
                         (component.properties?.direction === 'column' ? 'vertical' : 'horizontal');
        if (layoutType === containerType) {
          return component;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Add a component to a specific container
   */
  addComponentToContainer(containerId: string, component: DroppedComponent): void {
    this.formBuilder.addComponent(component, containerId);
  }
  
  /**
   * Get a component by its ID
   */
  getComponentById(componentId: string): DroppedComponent | null {
    const components = this.formComponents();
    return this.findComponentByIdRecursive(components, componentId);
  }
  
  /**
   * Recursively find a component by ID
   */
  private findComponentByIdRecursive(components: DroppedComponent[], componentId: string): DroppedComponent | null {
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
      
      if (component.children) {
        const found = this.findComponentByIdRecursive(component.children, componentId);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Update a component
   */
  updateComponent(componentId: string, updates: Partial<DroppedComponent>): void {
    this.formBuilder.updateComponent(componentId, updates);
  }
  
  /**
   * Remove a component
   */
  removeComponent(componentId: string): void {
    this.formBuilder.removeComponent(componentId);
  }
}