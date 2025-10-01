import { Injectable } from '@angular/core';
import { ElementRegistryService } from '../services/element-registry.service';
import { EditorElement } from '../../models/drag-data.model';
import { FormElementProperties } from '../../models/element-properties.model';

@Injectable({
  providedIn: 'root'
})
export class ElementFactory {
  
  constructor(
    private elementRegistryService: ElementRegistryService
  ) {}
  
  /**
   * Create a new form element based on the element type
   * @param elementType The type of element to create
   * @returns A new EditorElement with default properties
   */
  createElement(elementType: string): EditorElement {
    const elementId = `${elementType}-${Date.now()}`;
    
    // Get default properties from registry
    const defaultProperties = this.elementRegistryService.getDefaultElementProperties(elementType);
    
    // Create base element
    const baseElement: EditorElement = {
      id: elementId,
      type: elementType,
      ...defaultProperties
    };
    
    // Type-specific properties
    switch (elementType) {
      case 'input':
        return {
          ...baseElement,
          type: 'input',
          value: defaultProperties['defaultValue'] || '',
          placeholder: defaultProperties['placeholder'] || 'Enter text...',
          label: defaultProperties['label'] || 'Input Field',
          required: defaultProperties['required'] || false,
          readOnly: defaultProperties['readOnly'] || false,
          disabled: defaultProperties['disabled'] || false
        } as EditorElement;
        
      case 'textarea':
        return {
          ...baseElement,
          type: 'textarea',
          value: defaultProperties['defaultValue'] || '',
          rows: defaultProperties['rows'] || 3,
          placeholder: defaultProperties['placeholder'] || 'Enter text here...',
          label: defaultProperties['label'] || 'Textarea',
          required: defaultProperties['required'] || false,
          readOnly: defaultProperties['readOnly'] || false,
          disabled: defaultProperties['disabled'] || false
        } as EditorElement;
        
      case 'select':
        return {
          ...baseElement,
          type: 'select',
          value: null,
          options: defaultProperties['options'] || [],
          multiple: defaultProperties['multiple'] || false,
          placeholder: defaultProperties['placeholder'] || 'Please select',
          label: defaultProperties['label'] || 'Select',
          required: defaultProperties['required'] || false,
          disabled: defaultProperties['disabled'] || false
        } as EditorElement;
        
      case 'button':
        return {
          ...baseElement,
          type: 'button',
          text: defaultProperties['text'] || 'Button',
          buttonType: defaultProperties['buttonType'] || 'default',
          size: defaultProperties['size'] || 'default',
          shape: defaultProperties['shape'],
          icon: defaultProperties['icon'],
          loading: defaultProperties['loading'] || false,
          block: defaultProperties['block'] || false,
          ghost: defaultProperties['ghost'] || false,
          danger: defaultProperties['danger'] || false,
          disabled: defaultProperties['disabled'] || false
        } as EditorElement;
        
      default:
        // For unknown element types, return a basic element
        return {
          ...baseElement,
          type: elementType
        } as EditorElement;
    }
  }
  
  /**
   * Duplicate an existing element with all its properties
   * @param originalElement The element to duplicate
   * @returns A new EditorElement with the same properties as the original
   */
  duplicateElement(originalElement: EditorElement): EditorElement {
    // Create a new element of the same type
    const newElement = this.createElement(originalElement.type);
    
    // Deep copy all properties from the original element
    Object.keys(originalElement).forEach(key => {
      if (key !== 'id') {
        const value = (originalElement as any)[key];
        
        // Handle different types of properties
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Deep copy objects
          (newElement as any)[key] = JSON.parse(JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Deep copy arrays
          (newElement as any)[key] = value.map(item => {
            if (item && typeof item === 'object') {
              return JSON.parse(JSON.stringify(item));
            }
            return item;
          });
        } else {
          // Copy primitive values
          (newElement as any)[key] = value;
        }
      }
    });
    
    return newElement;
  }
  
  /**
   * Get the component class for an element type
   * @param elementType The type of element
   * @returns The component class or null if not found
   */
  getComponent(elementType: string): any {
    return this.elementRegistryService.getComponent(elementType);
  }
  
  /**
   * Check if an element type is supported
   * @param elementType The type of element to check
   * @returns True if the element type is supported
   */
  isElementTypeSupported(elementType: string): boolean {
    return this.elementRegistryService.hasElementType(elementType);
  }
  
  /**
   * Get all supported element types
   * @returns Array of supported element types
   */
  getSupportedElementTypes(): string[] {
    return this.elementRegistryService.getElementTypes().map(type => type.type);
  }
}