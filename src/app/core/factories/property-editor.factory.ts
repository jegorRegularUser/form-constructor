import { Injectable, ComponentFactoryResolver, ViewContainerRef, ComponentRef } from '@angular/core';
import { PropertyDefinition } from '../models/property-schema.model';
import { PropertyType, PROPERTY_EDITOR_COMPONENTS } from '../enums/property-type.enum';
import { PropertyEditorConfig } from '../models/property-schema.model';
import { BaseGenericPropertyEditorComponent } from '../../features/form-builder/components/property-panel/base-generic-property-editor.component';

/**
 * Property Editor Factory
 * 
 * Factory for creating property editor components based on property type
 */
@Injectable({
  providedIn: 'root'
})
export class PropertyEditorFactory {
  private propertyEditorConfigs: Record<PropertyType, PropertyEditorConfig> = {} as Record<PropertyType, PropertyEditorConfig>;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    this.initializeDefaultPropertyEditors();
  }

  /**
   * Initialize default property editor configurations
   */
  private initializeDefaultPropertyEditors(): void {
    // Initialize with empty configs for all property types
    Object.values(PropertyType).forEach(type => {
      this.propertyEditorConfigs[type] = {
        type,
        component: null, // Will be set when components are registered
        inputs: {},
        outputs: {}
      };
    });
  }

  /**
   * Register a property editor component for a specific property type
   */
  registerPropertyEditor(type: PropertyType, config: PropertyEditorConfig): void {
    this.propertyEditorConfigs[type] = {
      ...this.propertyEditorConfigs[type],
      ...config
    };
  }

  /**
   * Register multiple property editor components at once
   */
  registerPropertyEditors(configs: Record<PropertyType, PropertyEditorConfig>): void {
    Object.keys(configs).forEach(type => {
      const propertyType = type as PropertyType;
      this.registerPropertyEditor(propertyType, configs[propertyType]);
    });
  }

  /**
   * Get a property editor configuration for a specific property type
   */
  getPropertyEditorConfig(type: PropertyType): PropertyEditorConfig {
    return this.propertyEditorConfigs[type] || {
      type,
      component: null,
      inputs: {},
      outputs: {}
    };
  }

  /**
   * Get all registered property editor configurations
   */
  getAllPropertyEditorConfigs(): Record<PropertyType, PropertyEditorConfig> {
    return { ...this.propertyEditorConfigs };
  }

  /**
   * Create a property editor component for a specific property
   */
  createPropertyEditor(
    property: PropertyDefinition,
    container: ViewContainerRef,
    value: any,
    valueChange: (value: any) => void,
    validationChange?: (result: any) => void,
    disabled: boolean = false
  ): ComponentRef<any> | null {
    // Get the property editor configuration for this property type
    const config = this.getPropertyEditorConfig(property.type as PropertyType);

    // If no component is registered, create a generic property editor
    if (!config.component) {
      return this.createGenericPropertyEditor(
        property,
        container,
        value,
        valueChange,
        validationChange,
        disabled
      );
    }

    // Clear any existing content in the container
    container.clear();

    // Create the component factory
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(config.component);

    // Create the component
    const componentRef = container.createComponent(componentFactory);

    // Set inputs
    if (componentRef.instance) {
      const instance = componentRef.instance as any;
      instance.property = property;
      instance.value = value;
      instance.disabled = disabled;

      // Set additional inputs from the configuration
      if (config.inputs) {
        Object.keys(config.inputs).forEach(key => {
          instance[key] = config.inputs![key];
        });
      }

      // Subscribe to value changes
      if (instance.valueChange) {
        instance.valueChange.subscribe(valueChange);
      }

      // Subscribe to validation changes if available and requested
      if (validationChange && instance.validationChange) {
        instance.validationChange.subscribe(validationChange);
      }
    }

    return componentRef;
  }

  /**
   * Create a generic property editor component
   */
  private createGenericPropertyEditor(
    property: PropertyDefinition,
    container: ViewContainerRef,
    value: any,
    valueChange: (value: any) => void,
    validationChange?: (result: any) => void,
    disabled: boolean = false
  ): ComponentRef<any> | null {
    // Clear any existing content in the container
    container.clear();

    // Create the component factory for the base generic property editor
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BaseGenericPropertyEditorComponent);

    // Create the component
    const componentRef = container.createComponent(componentFactory);

    // Set inputs
    if (componentRef.instance) {
      const instance = componentRef.instance as any;
      instance.property = property;
      instance.value = value;
      instance.disabled = disabled;

      // Subscribe to value changes
      instance.valueChange.subscribe(valueChange);

      // Subscribe to validation changes if available and requested
      if (validationChange) {
        instance.validationChange.subscribe(validationChange);
      }
    }

    return componentRef;
  }

  /**
   * Check if a property editor is registered for a specific property type
   */
  hasPropertyEditor(type: PropertyType): boolean {
    const config = this.getPropertyEditorConfig(type);
    return config.component !== null;
  }

  /**
   * Get the selector for a property editor component
   */
  getPropertyEditorSelector(type: PropertyType): string {
    // If a custom component is registered, we can't determine its selector here
    // This would need to be provided when registering the component
    const config = this.getPropertyEditorConfig(type);
    return config.selector || PROPERTY_EDITOR_COMPONENTS[type] || '';
  }

  /**
   * Get all property types that have registered editors
   */
  getRegisteredPropertyTypes(): PropertyType[] {
    return Object.values(PropertyType).filter(type => this.hasPropertyEditor(type));
  }

  /**
   * Unregister a property editor for a specific property type
   */
  unregisterPropertyEditor(type: PropertyType): void {
    this.propertyEditorConfigs[type] = {
      type,
      component: null,
      inputs: {},
      outputs: {}
    };
  }

  /**
   * Reset all property editor registrations
   */
  reset(): void {
    this.initializeDefaultPropertyEditors();
  }
}