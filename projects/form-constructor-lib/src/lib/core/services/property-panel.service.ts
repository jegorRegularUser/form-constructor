import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormElementProperties } from '../../models/element-properties.model';
import { FormProperties } from '../../models/form-properties.model';
import {
  PropertyGroup,
  PropertyDefinition,
  PropertyChangeEvent,
  SelectOption,
  PropertyValidationResult,
  PropertySection,
  ElementTypeConfig,
  PropertyEditorConfig,
  PropertyCondition,
  ElementRegistryConfig
} from '../../models/property-schema.model';
import { PropertyType, DimensionUnit, FontWeightOption, BorderStyleOption } from '../enums/property-type.enum';
import { PropertyEditorFactory } from '../factories/property-editor.factory';
import {
  COMMON_PROPERTY_DEFINITIONS,
  createPropertyDefinition,
  createTextPropertyDefinition,
  createNumberPropertyDefinition,
  createBooleanPropertyDefinition,
  createSelectPropertyDefinition,
  createDimensionPropertyDefinition
} from '../configs/property-configs';
import { ElementStateService } from './element-state.service';

@Injectable({
  providedIn: 'root'
})
export class PropertyPanelService {
  private elementPropertiesSubject = new BehaviorSubject<Record<string, FormElementProperties>>({});
  private formPropertiesSubject = new BehaviorSubject<FormProperties>({ id: 'default-form' });
  private elementTypesSubject = new BehaviorSubject<ElementTypeConfig[]>([]);
  private propertyEditorsSubject = new BehaviorSubject<PropertyEditorConfig[]>([]);
  
  elementProperties$ = this.elementPropertiesSubject.asObservable();
  formProperties$ = this.formPropertiesSubject.asObservable();
  elementTypes$ = this.elementTypesSubject.asObservable();
  propertyEditors$ = this.propertyEditorsSubject.asObservable();
  
  // Registry for element type configurations
  private elementTypes: Record<string, ElementTypeConfig> = {};
  
  // Registry for property editor configurations
  private propertyEditors: Record<string, PropertyEditorConfig> = {};
  
  constructor(
    private propertyEditorFactory: PropertyEditorFactory,
    private elementStateService: ElementStateService
  ) {
    // Register basic property editors synchronously first
    this.registerBasicPropertyEditors();
    
    // Initialize asynchronously
    this.initialize().catch(error => {
      console.error('Failed to initialize PropertyPanelService:', error);
    });
  }
  
  /**
   * Register basic property editors synchronously
   */
  private registerBasicPropertyEditors(): void {
    console.log('Registering basic property editors synchronously...');
    
    // Register basic property editors without dynamic imports
    const basicEditors: PropertyEditorConfig[] = [
      {
        type: 'text' as PropertyType,
        component: null,
        selector: 'app-text-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'number' as PropertyType,
        component: null,
        selector: 'app-number-property-editor', 
        inputs: {},
        outputs: {}
      },
      {
        type: 'dimension' as PropertyType,
        component: null,
        selector: 'app-number-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'color' as PropertyType,
        component: null,
        selector: 'app-color-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'select' as PropertyType,
        component: null,
        selector: 'app-select-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'boolean' as PropertyType,
        component: null,
        selector: 'app-boolean-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'array' as PropertyType,
        component: null,
        selector: 'app-array-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'font-weight' as PropertyType,
        component: null,
        selector: 'app-select-property-editor',
        inputs: {},
        outputs: {}
      },
      {
        type: 'border-style' as PropertyType,
        component: null,
        selector: 'app-select-property-editor',
        inputs: {},
        outputs: {}
      }
    ];
    
    basicEditors.forEach(editor => {
      this.propertyEditors[editor.type] = editor;
    });
    
    console.log('Basic property editors registered:', Object.keys(this.propertyEditors));
  }
  
  // Element property management
  
  /**
   * Update an element property
   */
  updateElementProperty(elementId: string, propertyName: string, value: any): void {
    const currentProperties = { ...this.elementPropertiesSubject.value };
    const elementProperties = { ...(currentProperties[elementId] || {}) };
    
    // Handle nested properties (e.g., 'validation.required')
    if (propertyName.includes('.')) {
      const parts = propertyName.split('.');
      let currentObj = elementProperties as any;
      
      // Traverse the property path, creating objects as needed
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!currentObj[part] || typeof currentObj[part] !== 'object') {
          currentObj[part] = {};
        }
        currentObj = currentObj[part];
      }
      
      // Set the final property value
      const finalPart = parts[parts.length - 1];
      currentObj[finalPart] = value;
    } else {
      // Handle simple property
      (elementProperties as any)[propertyName] = value;
    }
    
    // Special handling for auto-expand property
    if (propertyName === 'autoExpand' || propertyName === 'layout.autoExpand') {
      // Ensure layout object exists
      if (!elementProperties.layout) {
        elementProperties.layout = {};
      }
      
      // Update the autoExpand property in the layout
      elementProperties.layout.autoExpand = value;
      
      // If auto-expand is enabled, we need to notify the property panel
      // to disable the width and height properties
      if (value === true) {
        // Emit an event to update the property panel state
        // This will be handled by the property panel component
        this.notifyPropertyPanelStateChanged({
          elementId,
          disabledProperties: ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight']
        });
      } else {
        // If auto-expand is disabled, enable the width and height properties
        this.notifyPropertyPanelStateChanged({
          elementId,
          enabledProperties: ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight']
        });
      }
    }
    
    currentProperties[elementId] = elementProperties;
    this.elementPropertiesSubject.next(currentProperties);
    
    // Update element state service
    this.elementStateService.updateElementProperties(elementId, { [propertyName]: value });
  }
  
  /**
   * Notify the property panel about state changes
   * This is used to enable/disable properties based on conditions
   */
  private notifyPropertyPanelStateChanged(state: {
    elementId: string;
    disabledProperties?: string[];
    enabledProperties?: string[];
  }): void {
    // This method will be used to notify the property panel component
    // about state changes that affect which properties should be enabled or disabled
    // The actual implementation will depend on how the property panel component
    // is designed to handle these state changes
    
    // For now, we'll just store the state in a subject that can be observed
    // by the property panel component
    if (!this.propertyPanelStateSubject) {
      this.propertyPanelStateSubject = new BehaviorSubject<any>(null);
    }
    
    this.propertyPanelStateSubject.next(state);
  }
  
  // Subject for property panel state changes
  private propertyPanelStateSubject: BehaviorSubject<any> | null = null;
  
  /**
   * Get element properties
   */
  getElementProperties(elementId: string): FormElementProperties | null {
    return this.elementPropertiesSubject.value[elementId] || null;
  }
  
  /**
   * Get all element properties
   */
  getAllElementProperties(): Record<string, FormElementProperties> {
    return { ...this.elementPropertiesSubject.value };
  }
  
  // Form property management
  
  /**
   * Update a form property
   */
  updateFormProperty(propertyName: string, value: any): void {
    const currentProperties = { ...this.formPropertiesSubject.value };
    
    // Handle nested properties (e.g., 'submitButton.text')
    if (propertyName.includes('.')) {
      const parts = propertyName.split('.');
      let currentObj = currentProperties as any;
      
      // Traverse the property path, creating objects as needed
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!currentObj[part] || typeof currentObj[part] !== 'object') {
          currentObj[part] = {};
        }
        currentObj = currentObj[part];
      }
      
      // Set the final property value
      const finalPart = parts[parts.length - 1];
      currentObj[finalPart] = value;
    } else {
      // Handle simple property
      (currentProperties as any)[propertyName] = value;
    }
    
    this.formPropertiesSubject.next(currentProperties);
    
    // Update element state service
    this.elementStateService.updateFormProperties({ [propertyName]: value });
  }
  
  /**
   * Update a form style property
   */
  updateFormStyleProperty(propertyName: string, value: any): void {
    const currentProperties = this.formPropertiesSubject.value;
    
    // Initialize formStyle if it doesn't exist
    if (!currentProperties.formStyle) {
      currentProperties.formStyle = {};
    }
    
    // Update the style property
    (currentProperties.formStyle as any)[propertyName] = value;
    
    this.formPropertiesSubject.next({ ...currentProperties });
    
    // Update element state service
    this.elementStateService.updateFormProperties({ formStyle: currentProperties.formStyle });
  }
  
  /**
   * Get form properties
   */
  getFormProperties(): FormProperties {
    return this.formPropertiesSubject.value;
  }
  
  // Validation
  
  /**
   * Validate a property value
   */
  validatePropertyValue(propertyDefinition: PropertyDefinition, value: any): PropertyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if required and value is empty
    if (propertyDefinition.required && (value === null || value === undefined || value === '')) {
      errors.push(`${propertyDefinition.label} is required`);
    }
    
    // Type-specific validation
    if (propertyDefinition.type === 'number' && value !== null && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${propertyDefinition.label} must be a valid number`);
      } else {
        if (propertyDefinition.min !== undefined && numValue < propertyDefinition.min) {
          errors.push(`${propertyDefinition.label} must be at least ${propertyDefinition.min}`);
        }
        if (propertyDefinition.max !== undefined && numValue > propertyDefinition.max) {
          errors.push(`${propertyDefinition.label} must be at most ${propertyDefinition.max}`);
        }
      }
    }
    
    // Placeholder text validation
    if (propertyDefinition.name === 'placeholder' && value !== null && value !== undefined) {
      if (typeof value !== 'string') {
        errors.push('Placeholder must be a text value');
      } else if (value.length > 100) {
        errors.push('Placeholder text must be less than 100 characters');
      }
    }
    
    // Dimension type validation (for width/height properties)
    if (propertyDefinition.type === 'dimension' && value !== null && value !== undefined) {
      // If value is a string, try to parse it as a dimension with unit
      if (typeof value === 'string') {
        const dimensionRegex = /^(\d+)(px|%)$/;
        const match = value.match(dimensionRegex);
        if (!match) {
          errors.push(`${propertyDefinition.label} must be a valid dimension (e.g., 100px, 50%)`);
        } else {
          const numValue = Number(match[1]);
          if (propertyDefinition.min !== undefined && numValue < propertyDefinition.min) {
            errors.push(`${propertyDefinition.label} must be at least ${propertyDefinition.min}${match[2]}`);
          }
          if (propertyDefinition.max !== undefined && numValue > propertyDefinition.max) {
            errors.push(`${propertyDefinition.label} must be at most ${propertyDefinition.max}${match[2]}`);
          }
        }
      }
      // If value is an object with value and unit properties
      else if (typeof value === 'object' && value !== null && 'value' in value && 'unit' in value) {
        const numValue = Number(value.value);
        if (isNaN(numValue)) {
          errors.push(`${propertyDefinition.label} must have a valid numeric value`);
        } else {
          if (propertyDefinition.min !== undefined && numValue < propertyDefinition.min) {
            errors.push(`${propertyDefinition.label} must be at least ${propertyDefinition.min}${value.unit}`);
          }
          if (propertyDefinition.max !== undefined && numValue > propertyDefinition.max) {
            errors.push(`${propertyDefinition.label} must be at most ${propertyDefinition.max}${value.unit}`);
          }
        }
      } else {
        errors.push(`${propertyDefinition.label} must be a valid dimension`);
      }
    }
    
    // Custom validator if provided
    if (propertyDefinition.validator) {
      const customValidation = propertyDefinition.validator(value);
      if (customValidation !== true) {
        if (typeof customValidation === 'string') {
          errors.push(customValidation);
        } else if (Array.isArray(customValidation)) {
          errors.push(...customValidation);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
  
  /**
   * Validate a style property
   */
  validateStyleProperty(propertyName: string, value: any): PropertyValidationResult {
    const errors: string[] = [];
    
    // Validate color properties
    if (propertyName.includes('Color') && value) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*\)$|^rgba\(\s*(\d{1,3}%?\s*,\s*){3}\d*\.?\d+\s*\)$/;
      if (!colorRegex.test(value)) {
        errors.push(`${propertyName} must be a valid color value (e.g., #RRGGBB, rgb(r,g,b), or rgba(r,g,b,a))`);
      }
    }
    
    // Validate dimension properties
    if ((propertyName.includes('Width') || propertyName.includes('Height') || propertyName.includes('Radius')) && value) {
      if (typeof value === 'string') {
        const dimensionRegex = /^(\d+)(px|%)$/;
        if (!dimensionRegex.test(value)) {
          errors.push(`${propertyName} must be a valid dimension (e.g., 100px, 50%)`);
        }
      }
    }
    
    // Validate border width
    if (propertyName === 'borderWidth' && value) {
      if (typeof value === 'string') {
        const borderWidthRegex = /^(\d+)(px)$/;
        if (!borderWidthRegex.test(value)) {
          errors.push(`Border width must be a valid pixel value (e.g., 1px, 2px)`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Element type registry methods
  
  /**
   * Register a new element type with its configuration
   */
  registerElementType(elementTypeConfig: ElementTypeConfig): void {
    this.elementTypes[elementTypeConfig.type] = elementTypeConfig;
    this.elementTypesSubject.next(Object.values(this.elementTypes));
  }
  
  /**
   * Unregister an element type
   */
  unregisterElementType(elementType: string): void {
    if (this.elementTypes[elementType]) {
      delete this.elementTypes[elementType];
      this.elementTypesSubject.next(Object.values(this.elementTypes));
    }
  }
  
  /**
   * Get an element type configuration by type
   */
  getElementType(elementType: string): ElementTypeConfig | undefined {
    return this.elementTypes[elementType];
  }
  
  /**
   * Get all registered element types
   */
  getElementTypes(): ElementTypeConfig[] {
    return Object.values(this.elementTypes);
  }
  
  /**
   * Get element types by category
   */
  getElementTypesByCategory(category: string): ElementTypeConfig[] {
    return Object.values(this.elementTypes).filter(
      elementType => elementType.category === category
    );
  }
  
  /**
   * Get property sections for an element type
   */
  getElementPropertySections(elementType: string): PropertySection[] {
    const elementConfig = this.elementTypes[elementType];
    return elementConfig ? elementConfig.propertySections : [];
  }
  
  /**
   * Get default properties for an element type
   */
  getDefaultElementProperties(elementType: string): Record<string, any> {
    const elementConfig = this.elementTypes[elementType];
    return elementConfig ? { ...elementConfig.defaultProperties } : {};
  }
  
  /**
   * Get property groups for an element type
   */
  getElementPropertyGroups(elementType: string): PropertyGroup[] {
    const sections = this.getElementPropertySections(elementType);
    const groups: PropertyGroup[] = [];
    
    sections.forEach(section => {
      if (section.groups) {
        groups.push(...section.groups);
      }
    });
    
    return groups;
  }
  
  /**
   * Get form property groups
   */
  getFormPropertyGroups(): PropertyGroup[] {
    // Return a default set of form property groups
    return [
      {
        id: 'form-basic',
        title: 'Basic Properties',
        properties: [
          { name: 'id', type: 'text', label: 'ID', disabled: true },
          { name: 'title', type: 'text', label: 'Title' },
          { name: 'description', type: 'text', label: 'Description' }
        ]
      },
      {
        id: 'form-layout',
        title: 'Layout',
        properties: [
          { name: 'layout', type: 'select', label: 'Layout', options: [
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' }
          ]},
          { name: 'labelAlign', type: 'select', label: 'Label Alignment', options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' }
          ]}
        ]
      },
      {
        id: 'form-style',
        title: 'Style',
        properties: [
          { name: 'backgroundColor', type: 'color', label: 'Background Color' },
          { name: 'borderColor', type: 'color', label: 'Border Color' },
          { name: 'borderWidth', type: 'dimension', label: 'Border Width' }
        ]
      }
    ];
  }
  
  // Property editor registry methods
  
  /**
   * Register a property editor for a specific property type
   */
  registerPropertyEditor(propertyEditorConfig: PropertyEditorConfig): void {
    this.propertyEditors[propertyEditorConfig.type] = propertyEditorConfig;
    this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
    
    // Also register with the factory
    this.propertyEditorFactory.registerPropertyEditor(
      propertyEditorConfig.type as PropertyType,
      propertyEditorConfig
    );
  }
  
  /**
   * Register multiple property editors at once
   */
  registerPropertyEditors(propertyEditorConfigs: PropertyEditorConfig[]): void {
    propertyEditorConfigs.forEach(config => {
      this.propertyEditors[config.type] = config;
    });
    this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
    
    // Also register with the factory
    const factoryConfigs: Record<PropertyType, PropertyEditorConfig> = {} as Record<PropertyType, PropertyEditorConfig>;
    propertyEditorConfigs.forEach(config => {
      factoryConfigs[config.type as PropertyType] = config;
    });
    this.propertyEditorFactory.registerPropertyEditors(factoryConfigs);
  }
  
  /**
   * Unregister a property editor
   */
  unregisterPropertyEditor(propertyType: string): void {
    if (this.propertyEditors[propertyType]) {
      delete this.propertyEditors[propertyType];
      this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
      
      // Also unregister with the factory
      this.propertyEditorFactory.unregisterPropertyEditor(propertyType as PropertyType);
    }
  }
  
  /**
   * Get a property editor configuration by property type
   */
  getPropertyEditor(propertyType: string): PropertyEditorConfig | undefined {
    return this.propertyEditors[propertyType];
  }
  
  /**
   * Get all registered property editors
   */
  getPropertyEditors(): Record<string, PropertyEditorConfig> {
    return { ...this.propertyEditors };
  }
  
  /**
   * Check if a property editor is registered for a property type
   */
  hasPropertyEditor(propertyType: string): boolean {
    return propertyType in this.propertyEditors;
  }
  
  // Utility methods
  
  /**
   * Evaluate a property condition against element properties
   */
  evaluateCondition(condition: PropertyCondition, elementProperties: any): boolean {
    const fieldValue = this.getNestedValue(elementProperties, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
      case 'notContains':
        return typeof fieldValue === 'string' && !fieldValue.includes(condition.value);
      case 'greaterThan':
        return typeof fieldValue === 'number' && fieldValue > condition.value;
      case 'lessThan':
        return typeof fieldValue === 'number' && fieldValue < condition.value;
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'notExists':
        return fieldValue === undefined || fieldValue === null;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'notIn':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return true;
    }
  }
  
  /**
   * Evaluate multiple conditions with logical operators
   */
  evaluateConditions(conditions: PropertyCondition | PropertyCondition[], elementProperties: any): boolean {
    if (!Array.isArray(conditions)) {
      return this.evaluateCondition(conditions, elementProperties);
    }
    
    if (conditions.length === 0) {
      return true;
    }
    
    let result = this.evaluateCondition(conditions[0], elementProperties);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const logicalOperator = condition.logicalOperator || 'AND';
      
      if (logicalOperator === 'AND') {
        result = result && this.evaluateCondition(condition, elementProperties);
      } else {
        result = result || this.evaluateCondition(condition, elementProperties);
      }
    }
    
    return result;
  }
  
  /**
   * Get a nested value from an object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  /**
   * Update a custom property that is not explicitly defined in the property definitions
   */
  updateCustomElementProperty(elementId: string, propertyName: string, value: any): void {
    const currentProperties = { ...this.elementPropertiesSubject.value };
    const elementProperties = { ...(currentProperties[elementId] || {}) };
    
    // Initialize custom properties object if it doesn't exist
    if (!elementProperties.customProperties) {
      elementProperties.customProperties = {};
    }
    
    // Update the custom property
    (elementProperties.customProperties as any)[propertyName] = value;
    
    currentProperties[elementId] = elementProperties;
    this.elementPropertiesSubject.next(currentProperties);
  }
  
  /**
   * Get a custom property value
   */
  getCustomElementProperty(elementId: string, propertyName: string): any {
    const elementProperties = this.elementPropertiesSubject.value[elementId];
    if (!elementProperties || !elementProperties.customProperties) {
      return undefined;
    }
    
    return (elementProperties.customProperties as any)[propertyName];
  }
  
  /**
   * Update a custom form property that is not explicitly defined in the property definitions
   */
  updateCustomFormProperty(propertyName: string, value: any): void {
    const currentProperties = { ...this.formPropertiesSubject.value };
    
    // Initialize custom properties object if it doesn't exist
    if (!currentProperties.customProperties) {
      currentProperties.customProperties = {};
    }
    
    // Update the custom property
    (currentProperties.customProperties as any)[propertyName] = value;
    
    this.formPropertiesSubject.next(currentProperties);
  }
  
  /**
   * Get a custom form property value
   */
  getCustomFormProperty(propertyName: string): any {
    const formProperties = this.formPropertiesSubject.value;
    if (!formProperties || !formProperties.customProperties) {
      return undefined;
    }
    
    return (formProperties.customProperties as any)[propertyName];
  }
  
  /**
   * Initialize the service with default configurations
   */
  async initialize(): Promise<void> {
    console.log('Initializing PropertyPanelService...');
    
    // Initialize with default form properties first
    this.initializeDefaultFormProperties();
    
    // Register default property editors
    await this.registerDefaultPropertyEditors();
    
    console.log('PropertyPanelService initialized successfully');
  }
  
  /**
   * Register default property editors
   */
  private async registerDefaultPropertyEditors(): Promise<void> {
    try {
      console.log('Starting property editor registration...');
      
      // In a library implementation, we would dynamically import the property editor components
      // For now, we'll just update the existing property editors with null components
      // The actual components will be provided by the application using the library
      
      // Update property editor components with actual component references
      const editorUpdates = [
        {
          type: 'text' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-text-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'number' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-number-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'dimension' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-number-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'color' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-color-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'select' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-select-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'multi-select' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-multi-select-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'object' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-object-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'boolean' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-boolean-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'array' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-array-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'font-weight' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-select-property-editor',
          inputs: {},
          outputs: {}
        },
        {
          type: 'border-style' as PropertyType,
          component: null, // Will be provided by the application
          selector: 'app-select-property-editor',
          inputs: {},
          outputs: {}
        }
      ];
      
      // Update existing property editors with component references
      editorUpdates.forEach(editor => {
        if (this.propertyEditors[editor.type]) {
          this.propertyEditors[editor.type].component = editor.component;
        } else {
          this.propertyEditors[editor.type] = editor;
        }
      });
      
      this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
      
      console.log('Property editors updated with components:', Object.keys(this.getPropertyEditors()));
      
      // Register element types
      await this.registerElementTypes();
      
    } catch (error) {
      console.error('Failed to register property editors:', error);
    }
  }
  
  /**
   * Register element types
   */
  private async registerElementTypes(): Promise<void> {
    try {
      // In a library implementation, we would import the element property definitions
      // For now, we'll just register some basic element types
      
      // Register input element property sections
      this.registerElementType({
        type: 'input',
        name: 'input',
        displayName: 'Input Field',
        description: 'A single-line text input field',
        category: 'basic',
        icon: 'edit',
        tags: ['text', 'input', 'form'],
        component: null, // Will be set to actual component reference
        previewComponent: null,
        defaultProperties: {
          label: 'Input Field',
          placeholder: 'Enter text...',
          defaultValue: '',
          inputType: 'text',
          required: false,
          readOnly: false,
          disabled: false
        },
        propertySections: [] // Will be populated with actual property sections
      });
      
      // Register textarea element property sections
      this.registerElementType({
        type: 'textarea',
        name: 'textarea',
        displayName: 'Textarea',
        description: 'A multi-line text input field',
        category: 'basic',
        icon: 'edit',
        tags: ['text', 'textarea', 'form'],
        component: null, // Will be set to actual component reference
        previewComponent: null,
        defaultProperties: {
          label: 'Textarea',
          placeholder: 'Enter text...',
          defaultValue: '',
          required: false,
          readOnly: false,
          disabled: false,
          rows: 3,
          maxRows: 10,
          autoSize: false,
          showCount: false
        },
        propertySections: [] // Will be populated with actual property sections
      });
      
      // Register select element property sections
      this.registerElementType({
        type: 'select',
        name: 'select',
        displayName: 'Select',
        description: 'A dropdown selection field',
        category: 'basic',
        icon: 'check',
        tags: ['select', 'dropdown', 'form'],
        component: null, // Will be set to actual component reference
        previewComponent: null,
        defaultProperties: {
          label: 'Select',
          placeholder: 'Please select',
          required: false,
          disabled: false,
          size: 'default',
          allowClear: true,
          showSearch: false,
          loading: false,
          options: []
        },
        propertySections: [] // Will be populated with actual property sections
      });
      
      // Register button element property sections
      this.registerElementType({
        type: 'button',
        name: 'button',
        displayName: 'Button',
        description: 'A clickable button',
        category: 'basic',
        icon: 'click',
        tags: ['button', 'click', 'form'],
        component: null, // Will be set to actual component reference
        previewComponent: null,
        defaultProperties: {
          text: 'Button',
          buttonType: 'default',
          htmlButtonType: 'button',
          size: 'default',
          shape: undefined,
          icon: undefined,
          loading: false,
          block: false,
          ghost: false,
          danger: false,
          disabled: false,
          tooltip: '',
          description: ''
        },
        propertySections: [] // Will be populated with actual property sections
      });
      
    } catch (error) {
      console.error('Failed to register element types:', error);
    }
  }
  
  /**
   * Initialize default form properties
   */
  private initializeDefaultFormProperties(): void {
    // Set default form properties
    const defaultFormProperties: FormProperties = {
      id: 'default-form',
      title: 'Form Title',
      description: '',
      titleConfig: {
        text: 'Form Title',
        visible: true,
        position: 'top',
        alignment: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        margin: '0 0 16px 0',
        padding: '8px 16px'
      },
      layout: 'vertical',
      labelAlign: 'left',
      labelWidth: 120,
      size: 'default',
      submitButton: {
        text: 'Submit',
        type: 'primary'
      },
      resetButton: {
        text: 'Reset',
        type: 'default'
      },
      formStyle: {
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 4,
        padding: '16px',
        margin: '0 auto',
        width: '100%',
        height: 'auto',
        maxWidth: 'none',
        minWidth: 'auto',
        maxHeight: 'none',
        minHeight: 'auto',
        boxShadow: 'none',
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 'normal',
        letterSpacing: 'normal'
      }
    };
    
    this.formPropertiesSubject.next(defaultFormProperties);
  }
}