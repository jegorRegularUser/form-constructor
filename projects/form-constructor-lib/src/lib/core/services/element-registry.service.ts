import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ElementTypeConfig,
  PropertyEditorConfig,
  ElementCategory,
  ElementGroup,
  ElementRegistryConfig
} from '../../models/property-schema.model';
import { FormElementProperties } from '../../models/element-properties.model';

@Injectable({
  providedIn: 'root'
})
export class ElementRegistryService {
  private elementTypesSubject = new BehaviorSubject<ElementTypeConfig[]>([]);
  private propertyEditorsSubject = new BehaviorSubject<PropertyEditorConfig[]>([]);
  private categoriesSubject = new BehaviorSubject<ElementCategory[]>([]);
  private groupsSubject = new BehaviorSubject<ElementGroup[]>([]);
  
  elementTypes$ = this.elementTypesSubject.asObservable();
  propertyEditors$ = this.propertyEditorsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  groups$ = this.groupsSubject.asObservable();
  
  // Internal registries
  private elementTypes: Record<string, ElementTypeConfig> = {};
  private propertyEditors: Record<string, PropertyEditorConfig> = {};
  private categories: Record<string, ElementCategory> = {};
  private groups: Record<string, ElementGroup> = {};
  
  constructor() {
    this.initializeDefaultCategories();
    this.initializeDefaultElementTypes();
  }
  
  // Element type management
  
  /**
   * Register a new element type
   */
  registerElementType(elementTypeConfig: ElementTypeConfig): void {
    this.elementTypes[elementTypeConfig.type] = elementTypeConfig;
    this.elementTypesSubject.next(Object.values(this.elementTypes));
  }
  
  /**
   * Register multiple element types at once
   */
  registerElementTypes(elementTypeConfigs: ElementTypeConfig[]): void {
    elementTypeConfigs.forEach(config => {
      this.elementTypes[config.type] = config;
    });
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
   * Get element types by group
   */
  getElementTypesByGroup(groupId: string): ElementTypeConfig[] {
    const group = this.groups[groupId];
    if (!group) {
      return [];
    }
    
    return group.elementTypes
      .map(type => this.elementTypes[type])
      .filter(Boolean) as ElementTypeConfig[];
  }
  
  /**
   * Get element types by tag
   */
  getElementTypesByTag(tag: string): ElementTypeConfig[] {
    return Object.values(this.elementTypes).filter(
      elementType => elementType.tags && elementType.tags.includes(tag)
    );
  }
  
  /**
   * Search element types by name or description
   */
  searchElementTypes(query: string): ElementTypeConfig[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.elementTypes).filter(
      elementType => 
        elementType.name.toLowerCase().includes(lowerQuery) ||
        elementType.displayName.toLowerCase().includes(lowerQuery) ||
        (elementType.description && elementType.description.toLowerCase().includes(lowerQuery)) ||
        (elementType.tags && elementType.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  
  /**
   * Get default properties for an element type
   */
  getDefaultElementProperties(elementType: string): Record<string, any> {
    const elementConfig = this.elementTypes[elementType];
    return elementConfig ? { ...elementConfig.defaultProperties } : {};
  }
  
  /**
   * Get component class for an element type
   */
  getComponent(elementType: string): any {
    const elementConfig = this.elementTypes[elementType];
    return elementConfig ? elementConfig.component : null;
  }
  
  /**
   * Get preview component class for an element type
   */
  getPreviewComponent(elementType: string): any {
    const elementConfig = this.elementTypes[elementType];
    return elementConfig ? elementConfig.previewComponent : null;
  }
  
  /**
   * Check if an element type is registered
   */
  hasElementType(elementType: string): boolean {
    return elementType in this.elementTypes;
  }
  
  // Property editor management
  
  /**
   * Register a property editor
   */
  registerPropertyEditor(propertyEditorConfig: PropertyEditorConfig): void {
    this.propertyEditors[propertyEditorConfig.type] = propertyEditorConfig;
    this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
  }
  
  /**
   * Register multiple property editors at once
   */
  registerPropertyEditors(propertyEditorConfigs: PropertyEditorConfig[]): void {
    propertyEditorConfigs.forEach(config => {
      this.propertyEditors[config.type] = config;
    });
    this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
  }
  
  /**
   * Unregister a property editor
   */
  unregisterPropertyEditor(propertyType: string): void {
    if (this.propertyEditors[propertyType]) {
      delete this.propertyEditors[propertyType];
      this.propertyEditorsSubject.next(Object.values(this.propertyEditors));
    }
  }
  
  /**
   * Get a property editor configuration by type
   */
  getPropertyEditor(propertyType: string): PropertyEditorConfig | undefined {
    return this.propertyEditors[propertyType];
  }
  
  /**
   * Get all registered property editors
   */
  getPropertyEditors(): PropertyEditorConfig[] {
    return Object.values(this.propertyEditors);
  }
  
  /**
   * Check if a property editor is registered for a property type
   */
  hasPropertyEditor(propertyType: string): boolean {
    return propertyType in this.propertyEditors;
  }
  
  // Category management
  
  /**
   * Register a new category
   */
  registerCategory(category: ElementCategory): void {
    this.categories[category.id] = category;
    this.categoriesSubject.next(Object.values(this.categories));
  }
  
  /**
   * Register multiple categories at once
   */
  registerCategories(categories: ElementCategory[]): void {
    categories.forEach(category => {
      this.categories[category.id] = category;
    });
    this.categoriesSubject.next(Object.values(this.categories));
  }
  
  /**
   * Unregister a category
   */
  unregisterCategory(categoryId: string): void {
    if (this.categories[categoryId]) {
      delete this.categories[categoryId];
      this.categoriesSubject.next(Object.values(this.categories));
    }
  }
  
  /**
   * Get a category by ID
   */
  getCategory(categoryId: string): ElementCategory | undefined {
    return this.categories[categoryId];
  }
  
  /**
   * Get all registered categories
   */
  getCategories(): ElementCategory[] {
    return Object.values(this.categories);
  }
  
  /**
   * Get element categories with their elements
   */
  getElementCategories(): any[] {
    const categories = Object.values(this.categories);
    
    return categories.map(category => {
      const elements = this.getElementTypesByCategory(category.id);
      return {
        ...category,
        elements: elements
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  /**
   * Get element definition by type
   */
  getElementDefinition(elementType: string): any {
    const elementConfig = this.elementTypes[elementType];
    if (!elementConfig) {
      return null;
    }
    
    return {
      type: elementConfig.type,
      name: elementConfig.displayName,
      icon: elementConfig.icon,
      description: elementConfig.description,
      defaultProperties: elementConfig.defaultProperties
    };
  }
  
  // Group management
  
  /**
   * Register a new group
   */
  registerGroup(group: ElementGroup): void {
    this.groups[group.id] = group;
    this.groupsSubject.next(Object.values(this.groups));
  }
  
  /**
   * Register multiple groups at once
   */
  registerGroups(groups: ElementGroup[]): void {
    groups.forEach(group => {
      this.groups[group.id] = group;
    });
    this.groupsSubject.next(Object.values(this.groups));
  }
  
  /**
   * Unregister a group
   */
  unregisterGroup(groupId: string): void {
    if (this.groups[groupId]) {
      delete this.groups[groupId];
      this.groupsSubject.next(Object.values(this.groups));
    }
  }
  
  /**
   * Get a group by ID
   */
  getGroup(groupId: string): ElementGroup | undefined {
    return this.groups[groupId];
  }
  
  /**
   * Get all registered groups
   */
  getGroups(): ElementGroup[] {
    return Object.values(this.groups);
  }
  
  // Configuration management
  
  /**
   * Initialize the registry with a configuration object
   */
  initialize(config: ElementRegistryConfig): void {
    // Register categories
    if (config.categories) {
      this.registerCategories(config.categories);
    }
    
    // Register groups
    if (config.customGroups) {
      this.registerGroups(config.customGroups);
    }
    
    // Register element types
    this.registerElementTypes(config.elementTypes);
    
    // Register property editors
    this.registerPropertyEditors(config.propertyEditors);
  }
  
  /**
   * Export the current registry configuration
   */
  exportConfiguration(): ElementRegistryConfig {
    return {
      elementTypes: this.getElementTypes(),
      propertyEditors: this.getPropertyEditors(),
      categories: this.getCategories(),
      searchEnabled: true,
      filterEnabled: true,
      customGroups: this.getGroups()
    };
  }
  
  /**
   * Reset the registry to its initial state
   */
  reset(): void {
    this.elementTypes = {};
    this.propertyEditors = {};
    this.categories = {};
    this.groups = {};
    
    this.elementTypesSubject.next([]);
    this.propertyEditorsSubject.next([]);
    this.categoriesSubject.next([]);
    this.groupsSubject.next([]);
    
    this.initializeDefaultCategories();
  }
  
  /**
   * Initialize default categories
   */
  private initializeDefaultCategories(): void {
    const defaultCategories: ElementCategory[] = [
      {
        id: 'basic',
        name: 'basic',
        displayName: 'Basic Elements',
        description: 'Basic form elements like inputs, textareas, and buttons',
        icon: 'form',
        order: 1
      },
      {
        id: 'advanced',
        name: 'advanced',
        displayName: 'Advanced Elements',
        description: 'Advanced form elements like date pickers and file uploads',
        icon: 'setting',
        order: 2
      },
      {
        id: 'layout',
        name: 'layout',
        displayName: 'Layout Elements',
        description: 'Layout elements for organizing your form',
        icon: 'appstore',
        order: 3
      },
      {
        id: 'custom',
        name: 'custom',
        displayName: 'Custom Elements',
        description: 'Custom elements created by users or plugins',
        icon: 'tool',
        order: 4
      }
    ];
    
    this.registerCategories(defaultCategories);
  }
  
  /**
   * Initialize default element types
   */
  private initializeDefaultElementTypes(): void {
    // Register input element type
    this.registerElementType({
      type: 'input',
      name: 'input',
      displayName: 'Input Field',
      description: 'A single-line text input field',
      category: 'basic',
      icon: 'edit',
      tags: ['text', 'input', 'form'],
      component: null, // Will be provided by the application using the library
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
    
    // Register textarea element type
    this.registerElementType({
      type: 'textarea',
      name: 'textarea',
      displayName: 'Textarea',
      description: 'A multi-line text input field',
      category: 'basic',
      icon: 'edit',
      tags: ['text', 'textarea', 'form'],
      component: null, // Will be provided by the application using the library
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
    
    // Register select element type
    this.registerElementType({
      type: 'select',
      name: 'select',
      displayName: 'Select',
      description: 'A dropdown selection field',
      category: 'basic',
      icon: 'check',
      tags: ['select', 'dropdown', 'form'],
      component: null, // Will be provided by the application using the library
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
    
    // Register button element type
    this.registerElementType({
      type: 'button',
      name: 'button',
      displayName: 'Button',
      description: 'A clickable button',
      category: 'basic',
      icon: 'plus-square',
      tags: ['button', 'click', 'form'],
      component: null, // Will be provided by the application using the library
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
  }
}