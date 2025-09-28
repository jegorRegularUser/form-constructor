import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DroppedComponent, ComponentType } from '../../core/models/component.model';
import { COMPONENT_TYPES, LAYOUT_TYPES, DEFAULT_VALUES } from '../constants/editor.constants';

@Injectable({
  providedIn: 'root'
})
export class HtmlGenerationService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Generate safe HTML for the entire form
   */
  public generateFormHtml(components: DroppedComponent[]): SafeHtml {
    try {
      let html = '<form class="generated-form">\n';
      
      components.forEach((component) => {
        html += this.generateComponentHtml(component);
      });
      
      html += '</form>';
      
      // Sanitize the HTML to prevent XSS attacks
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error generating form HTML:', error);
      return this.sanitizer.bypassSecurityTrustHtml(
        '<form class="generated-form error"><!-- Error generating form --></form>'
      );
    }
  }

  /**
   * Generate safe HTML for a single component
   */
  private generateComponentHtml(component: DroppedComponent, indent: number = 2): string {
    const spaces = ' '.repeat(indent);
    let html = '';
    
    switch (component.type) {
      case COMPONENT_TYPES.TEXT_INPUT:
      case COMPONENT_TYPES.EMAIL_INPUT:
        html += this.generateInputHtml(component, spaces);
        break;
        
      case COMPONENT_TYPES.TEXTAREA:
        html += this.generateTextareaHtml(component, spaces);
        break;
        
      case COMPONENT_TYPES.SELECT:
        html += this.generateSelectHtml(component, spaces);
        break;
        
      case COMPONENT_TYPES.CHECKBOX:
        html += this.generateCheckboxHtml(component, spaces);
        break;
        
      case COMPONENT_TYPES.BUTTON:
        html += this.generateButtonHtml(component, spaces);
        break;
        
      case COMPONENT_TYPES.CONTAINER:
        html += this.generateContainerHtml(component, spaces);
        break;
        
      default:
        html += `${spaces}<div class="component ${this.escapeHtml(component.type)}">Unknown component type: ${this.escapeHtml(component.type)}</div>\n`;
    }
    
    return html;
  }

  /**
   * Generate HTML for input components
   */
  private generateInputHtml(component: DroppedComponent, spaces: string): string {
    const type = component.type === COMPONENT_TYPES.EMAIL_INPUT ? 'email' : 'text';
    const label = this.escapeHtml(component.properties?.label || 'Input');
    const placeholder = this.escapeHtml(component.properties?.placeholder || '');
    const required = component.properties?.required ? 'required' : '';
    
    return `${spaces}<div class="form-group">\n` +
           `${spaces}  <label>${label}</label>\n` +
           `${spaces}  <input type="${type}" ` +
           `placeholder="${placeholder}" ${required}>\n` +
           `${spaces}</div>\n`;
  }

  /**
   * Generate HTML for textarea components
   */
  private generateTextareaHtml(component: DroppedComponent, spaces: string): string {
    const label = this.escapeHtml(component.properties?.label || 'Textarea');
    const placeholder = this.escapeHtml(component.properties?.placeholder || '');
    const rows = component.properties?.['rows'] || DEFAULT_VALUES.TEXTAREA_ROWS;
    
    return `${spaces}<div class="form-group">\n` +
           `${spaces}  <label>${label}</label>\n` +
           `${spaces}  <textarea rows="${rows}" ` +
           `placeholder="${placeholder}"></textarea>\n` +
           `${spaces}</div>\n`;
  }

  /**
   * Generate HTML for select components
   */
  private generateSelectHtml(component: DroppedComponent, spaces: string): string {
    const label = this.escapeHtml(component.properties?.label || 'Select');
    const options = component.properties?.['options'] || [];
    
    let optionsHtml = '';
    options.forEach((option: string) => {
      optionsHtml += `${spaces}    <option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>\n`;
    });
    
    return `${spaces}<div class="form-group">\n` +
           `${spaces}  <label>${label}</label>\n` +
           `${spaces}  <select>\n` +
           optionsHtml +
           `${spaces}  </select>\n` +
           `${spaces}</div>\n`;
  }

  /**
   * Generate HTML for checkbox components
   */
  private generateCheckboxHtml(component: DroppedComponent, spaces: string): string {
    const label = this.escapeHtml(component.properties?.label || 'Checkbox');
    const checked = component.properties?.['checked'] ? 'checked' : '';
    
    return `${spaces}<div class="form-check">\n` +
           `${spaces}  <input type="checkbox" id="${component.id}" ${checked}>\n` +
           `${spaces}  <label for="${component.id}">${label}</label>\n` +
           `${spaces}</div>\n`;
  }

  /**
   * Generate HTML for button components
   */
  private generateButtonHtml(component: DroppedComponent, spaces: string): string {
    const type = this.escapeHtml(component.properties?.['type'] || 'button');
    const variant = this.escapeHtml(component.properties?.['variant'] || 'primary');
    const text = this.escapeHtml(component.properties?.['text'] || 'Button');
    
    return `${spaces}<button type="${type}" class="btn btn-${variant}">\n` +
           `${spaces}  ${text}\n` +
           `${spaces}</button>\n`;
  }

  /**
   * Generate HTML for container components
   */
  private generateContainerHtml(component: DroppedComponent, spaces: string): string {
    const styles = this.generateContainerStyles(component);
    
    let html = `${spaces}<div class="container" style="${styles}">\n`;
    
    if (component.children) {
      component.children.forEach(child => {
        html += this.generateComponentHtml(child, spaces.length + 2);
      });
    }
    
    html += `${spaces}</div>\n`;
    
    return html;
  }

  /**
   * Generate CSS styles for container components
   */
  private generateContainerStyles(component: DroppedComponent): string {
    const styles: string[] = [];
    
    if (component.properties?.['layout'] === LAYOUT_TYPES.FLEX) {
      styles.push('display: flex');
      styles.push(`flex-direction: ${component.properties?.['direction'] || 'column'}`);
      if (component.properties?.['gap']) {
        styles.push(`gap: ${this.escapeHtml(component.properties?.['gap'])}`);
      }
      if (component.properties?.['padding']) {
        styles.push(`padding: ${this.escapeHtml(component.properties?.['padding'])}`);
      }
    } else if (component.properties?.['layout'] === LAYOUT_TYPES.GRID) {
      styles.push('display: grid');
      if (component.properties?.['columns']) {
        styles.push(`grid-template-columns: repeat(${component.properties?.['columns']}, 1fr)`);
      }
      if (component.properties?.['gap']) {
        styles.push(`gap: ${this.escapeHtml(component.properties?.['gap'])}`);
      }
    }
    
    if (component.properties?.['width']) {
      styles.push(`width: ${this.escapeHtml(component.properties?.['width'])}`);
    }
    
    return styles.join('; ');
  }

  /**
   * Escape HTML to prevent XSS attacks
   */
  private escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') return '';
    
    return unsafe
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize a string to be used in HTML attributes
   */
  public sanitizeAttribute(value: string): string {
    return value
      .replace(/&/g, '&')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;')
      .replace(/</g, '<')
      .replace(/>/g, '>');
  }

  /**
   * Sanitize CSS property values
   */
  public sanitizeCss(value: string): string {
    // Remove potentially dangerous CSS values
    return value
      .replace(/javascript:/gi, '')
      .replace(/expression\(/gi, '')
      .replace(/import\s+/gi, '')
      .replace(/url\(/gi, '');
  }
}