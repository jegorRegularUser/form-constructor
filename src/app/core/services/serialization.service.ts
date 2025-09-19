import { Injectable, signal, computed } from '@angular/core';
import { FormStructure, FormElementType } from '../models';

export interface SerializedForm {
  version: string;
  metadata: SerializationMetadata;
  structure: FormStructure;
  grapesJSData: any;
  timestamp: string;
}

export interface SerializationMetadata {
  generator: string;
  generatorVersion: string;
  angularVersion: string;
  created: string;
  modified: string;
  checksum?: string;
}

export interface SerializationOptions {
  includeMetadata: boolean;
  includeGrapesJSData: boolean;
  compressData: boolean;
  validateStructure: boolean;
  generateChecksum: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  private lastSerialized = signal<SerializedForm | null>(null);
  private serializationHistory = signal<SerializedForm[]>([]);

  // Computed properties
  readonly hasLastSerialized = computed(() => this.lastSerialized() !== null);
  readonly historyCount = computed(() => this.serializationHistory().length);

  /**
   * Serialize form structure to JSON
   */
  serializeForm(
    structure: any, 
    grapesJSData: any, 
    options: Partial<SerializationOptions> = {}
  ): string {
    const defaultOptions: SerializationOptions = {
      includeMetadata: true,
      includeGrapesJSData: true,
      compressData: false,
      validateStructure: true,
      generateChecksum: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Validate structure if requested
      if (finalOptions.validateStructure) {
        this.validateFormStructure(structure);
      }

      // Create serialized form object
      const serializedForm: SerializedForm = {
        version: '1.0.0',
        metadata: this.createMetadata(finalOptions),
        structure: this.normalizeStructure(structure),
        grapesJSData: finalOptions.includeGrapesJSData ? grapesJSData : null,
        timestamp: new Date().toISOString()
      };

      // Generate checksum if requested
      if (finalOptions.generateChecksum) {
        serializedForm.metadata.checksum = this.generateChecksum(serializedForm);
      }

      // Store in history
      this.addToHistory(serializedForm);

      // Convert to JSON
      const jsonString = JSON.stringify(serializedForm, null, finalOptions.compressData ? 0 : 2);
      
      console.log('Form serialized successfully', {
        size: jsonString.length,
        components: structure.components?.length || 0
      });

      return jsonString;

    } catch (error) {
      console.error('Serialization failed:', error);
      throw new Error(`Failed to serialize form: ${error}`);
    }
  }

  /**
   * Deserialize JSON to form structure
   */
  deserializeForm(jsonString: string): { structure: any; grapesJSData: any; metadata: SerializationMetadata } {
    try {
      const serializedForm: SerializedForm = JSON.parse(jsonString);
      
      // Validate version compatibility
      if (!this.isVersionCompatible(serializedForm.version)) {
        throw new Error(`Incompatible version: ${serializedForm.version}`);
      }

      // Validate checksum if present
      if (serializedForm.metadata.checksum) {
        const currentChecksum = this.generateChecksum(serializedForm);
        if (currentChecksum !== serializedForm.metadata.checksum) {
          console.warn('Checksum mismatch - data may be corrupted');
        }
      }

      // Validate structure
      this.validateFormStructure(serializedForm.structure);

      console.log('Form deserialized successfully', {
        version: serializedForm.version,
        components: serializedForm.structure.elements?.length || 0,
        created: serializedForm.metadata.created
      });

      return {
        structure: serializedForm.structure,
        grapesJSData: serializedForm.grapesJSData,
        metadata: serializedForm.metadata
      };

    } catch (error) {
      console.error('Deserialization failed:', error);
      throw new Error(`Failed to deserialize form: ${error}`);
    }
  }

  /**
   * Create metadata for serialization
   */
  private createMetadata(options: SerializationOptions): SerializationMetadata {
    const now = new Date().toISOString();
    
    return {
      generator: 'Angular Form Constructor',
      generatorVersion: '1.0.0',
      angularVersion: '19.2.0',
      created: now,
      modified: now
    };
  }

  /**
   * Normalize structure for consistent serialization
   */
  private normalizeStructure(structure: any): FormStructure {
    // Ensure all required properties exist
    const normalized: FormStructure = {
      id: structure.id || this.generateId(),
      name: structure.name || 'Untitled Form',
      title: structure.title,
      description: structure.description,
      elements: this.normalizeElements(structure.components || structure.elements || []),
      validation: structure.validation || {
        enableClientSideValidation: true,
        enableServerSideValidation: false,
        showErrorsOnSubmit: true,
        showErrorsOnBlur: true,
        showErrorsOnChange: false,
        errorDisplayStyle: 'inline'
      },
      submission: structure.submission || {
        method: 'POST',
        onSubmit: 'onSubmit()',
        onSuccess: 'onSubmitSuccess()',
        onError: 'onSubmitError()'
      },
      styling: structure.styling || {
        responsive: true,
        theme: 'default'
      },
      metadata: {
        version: '1.0.0',
        created: new Date(),
        modified: new Date(),
        author: 'Form Constructor User'
      }
    };

    return normalized;
  }

  /**
   * Normalize form elements
   */
  private normalizeElements(elements: any[]): FormElementType[] {
    return elements.map(element => this.normalizeElement(element));
  }

  /**
   * Normalize individual form element
   */
  private normalizeElement(element: any): FormElementType {
    const normalized: any = {
      id: element.id || element.cid || this.generateId(),
      type: this.normalizeComponentType(element.type || element.get?.('type')),
      label: element.label || element.get?.('label') || 'Component',
      properties: this.extractElementProperties(element),
      styling: {
        classes: element.getClasses ? element.getClasses() : [],
        styles: element.getStyle ? element.getStyle() : {}
      }
    };

    // Add form-specific properties if applicable
    if (this.isFormElement(normalized.type)) {
      normalized.formControlName = element.formControlName || element.get?.('formControlName');
      normalized.validation = this.extractValidationRules(element);
    }

    // Add children for container elements
    if (element.components && Array.isArray(element.components)) {
      normalized.children = this.normalizeElements(element.components);
    }

    return normalized;
  }

  /**
   * Extract element properties
   */
  private extractElementProperties(element: any): any {
    const properties: any = {};
    
    // Extract from attributes
    if (element.attributes) {
      Object.assign(properties, element.attributes);
    }
    
    // Extract from GrapesJS get method
    if (element.get) {
      const propertyNames = [
        'label', 'placeholder', 'required', 'disabled', 'readonly',
        'type', 'inputType', 'value', 'text', 'formControlName',
        'minLength', 'maxLength', 'pattern', 'variant', 'size',
        'buttonType', 'onClick', 'multiple', 'checked', 'layout',
        'gap', 'padding', 'margin', 'backgroundColor', 'border'
      ];
      
      propertyNames.forEach(prop => {
        const value = element.get(prop);
        if (value !== undefined && value !== null && value !== '') {
          properties[prop] = value;
        }
      });
    }
    
    return properties;
  }

  /**
   * Extract validation rules from element
   */
  private extractValidationRules(element: any): any[] {
    const rules: any[] = [];
    const props = this.extractElementProperties(element);
    
    if (props.required) {
      rules.push({
        type: 'required',
        message: 'This field is required'
      });
    }
    
    if (props.minLength) {
      rules.push({
        type: 'minLength',
        value: props.minLength,
        message: `Minimum length is ${props.minLength} characters`
      });
    }
    
    if (props.maxLength) {
      rules.push({
        type: 'maxLength',
        value: props.maxLength,
        message: `Maximum length is ${props.maxLength} characters`
      });
    }
    
    if (props.pattern) {
      rules.push({
        type: 'pattern',
        value: props.pattern,
        message: 'Please enter a valid format'
      });
    }
    
    if (props.inputType === 'email') {
      rules.push({
        type: 'email',
        message: 'Please enter a valid email address'
      });
    }
    
    return rules;
  }

  /**
   * Validate form structure
   */
  private validateFormStructure(structure: any): void {
    if (!structure) {
      throw new Error('Structure is null or undefined');
    }

    // Check for required properties
    const requiredProps = ['id', 'name'];
    requiredProps.forEach(prop => {
      if (!structure[prop]) {
        throw new Error(`Missing required property: ${prop}`);
      }
    });

    // Validate elements if present
    if (structure.elements && Array.isArray(structure.elements)) {
      structure.elements.forEach((element: any, index: number) => {
        this.validateElement(element, `elements[${index}]`);
      });
    }
  }

  /**
   * Validate individual element
   */
  private validateElement(element: any, path: string): void {
    if (!element.id) {
      throw new Error(`Missing element ID at ${path}`);
    }
    
    if (!element.type) {
      throw new Error(`Missing element type at ${path}`);
    }
    
    // Validate children if present
    if (element.children && Array.isArray(element.children)) {
      element.children.forEach((child: any, index: number) => {
        this.validateElement(child, `${path}.children[${index}]`);
      });
    }
  }

  /**
   * Utility methods
   */
  private normalizeComponentType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'angular-input-field': 'input',
      'angular-select-field': 'select',
      'angular-checkbox-field': 'checkbox',
      'angular-button': 'button',
      'angular-container': 'container',
      'text-input': 'input',
      'form-container': 'container'
    };
    
    return typeMap[type] || type || 'div';
  }

  private isFormElement(type: string): boolean {
    const formTypes = ['input', 'select', 'checkbox', 'radio', 'textarea'];
    return formTypes.includes(type);
  }

  private isVersionCompatible(version: string): boolean {
    // Simple version compatibility check
    const supportedVersions = ['1.0.0'];
    return supportedVersions.includes(version);
  }

  private generateChecksum(data: any): string {
    // Simple checksum generation (in production, use a proper hash function)
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private generateId(): string {
    return 'form-' + Math.random().toString(36).substr(2, 9);
  }

  private addToHistory(serializedForm: SerializedForm): void {
    this.serializationHistory.update(history => {
      const newHistory = [...history, serializedForm];
      // Keep only last 10 entries
      return newHistory.slice(-10);
    });
    
    this.lastSerialized.set(serializedForm);
  }

  /**
   * Export methods for file operations
   */
  exportToFile(structure: any, grapesJSData: any, filename?: string): void {
    const jsonString = this.serializeForm(structure, grapesJSData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || `form-${new Date().getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  /**
   * Import from file
   */
  async importFromFile(file: File): Promise<{ structure: any; grapesJSData: any; metadata: SerializationMetadata }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const result = this.deserializeForm(jsonString);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Save to local storage
   */
  saveToLocalStorage(key: string, structure: any, grapesJSData: any): void {
    try {
      const jsonString = this.serializeForm(structure, grapesJSData);
      localStorage.setItem(key, jsonString);
      console.log(`Form saved to local storage with key: ${key}`);
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      throw error;
    }
  }

  /**
   * Load from local storage
   */
  loadFromLocalStorage(key: string): { structure: any; grapesJSData: any; metadata: SerializationMetadata } | null {
    try {
      const jsonString = localStorage.getItem(key);
      if (!jsonString) {
        return null;
      }
      
      return this.deserializeForm(jsonString);
    } catch (error) {
      console.error('Failed to load from local storage:', error);
      return null;
    }
  }

  /**
   * Get all saved forms from local storage
   */
  getSavedForms(): { key: string; metadata: SerializationMetadata }[] {
    const savedForms: { key: string; metadata: SerializationMetadata }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('form-constructor-')) {
        try {
          const jsonString = localStorage.getItem(key);
          if (jsonString) {
            const data = JSON.parse(jsonString);
            savedForms.push({
              key,
              metadata: data.metadata
            });
          }
        } catch (error) {
          console.warn(`Invalid form data in local storage key: ${key}`);
        }
      }
    }
    
    return savedForms.sort((a, b) => 
      new Date(b.metadata.modified).getTime() - new Date(a.metadata.modified).getTime()
    );
  }

  /**
   * Delete saved form from local storage
   */
  deleteSavedForm(key: string): void {
    localStorage.removeItem(key);
    console.log(`Form deleted from local storage: ${key}`);
  }

  /**
   * Clear all saved forms
   */
  clearAllSavedForms(): void {
    const keys = this.getSavedForms().map(form => form.key);
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} saved forms`);
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(structure: any, grapesJSData: any): Promise<void> {
    try {
      const jsonString = this.serializeForm(structure, grapesJSData);
      await navigator.clipboard.writeText(jsonString);
      console.log('Form data copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }

  /**
   * Paste from clipboard
   */
  async pasteFromClipboard(): Promise<{ structure: any; grapesJSData: any; metadata: SerializationMetadata } | null> {
    try {
      const jsonString = await navigator.clipboard.readText();
      return this.deserializeForm(jsonString);
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      return null;
    }
  }

  /**
   * Get serialization history
   */
  getHistory(): SerializedForm[] {
    return this.serializationHistory();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.serializationHistory.set([]);
    this.lastSerialized.set(null);
  }

  /**
   * Create backup with timestamp
   */
  createBackup(structure: any, grapesJSData: any): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `form-constructor-backup-${timestamp}`;
    this.saveToLocalStorage(key, structure, grapesJSData);
    return key;
  }

  /**
   * Auto-save functionality
   */
  autoSave(structure: any, grapesJSData: any): void {
    const autoSaveKey = 'form-constructor-autosave';
    this.saveToLocalStorage(autoSaveKey, structure, grapesJSData);
  }

  /**
   * Restore from auto-save
   */
  restoreAutoSave(): { structure: any; grapesJSData: any; metadata: SerializationMetadata } | null {
    return this.loadFromLocalStorage('form-constructor-autosave');
  }

  /**
   * Compare two serialized forms
   */
  compareForms(form1: SerializedForm, form2: SerializedForm): {
    identical: boolean;
    differences: string[];
  } {
    const differences: string[] = [];
    
    if (form1.version !== form2.version) {
      differences.push(`Version: ${form1.version} vs ${form2.version}`);
    }
    
    if (form1.structure.name !== form2.structure.name) {
      differences.push(`Name: ${form1.structure.name} vs ${form2.structure.name}`);
    }
    
    if (form1.structure.elements.length !== form2.structure.elements.length) {
      differences.push(`Element count: ${form1.structure.elements.length} vs ${form2.structure.elements.length}`);
    }
    
    return {
      identical: differences.length === 0,
      differences
    };
  }

  /**
   * Migrate form data to newer version
   */
  migrateFormData(data: any, targetVersion: string): any {
    // Implementation for migrating form data between versions
    console.log(`Migrating form data to version ${targetVersion}`);
    return data; // Placeholder for now
  }

  /**
   * Validate form data integrity
   */
  validateDataIntegrity(data: SerializedForm): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!data.version) errors.push('Missing version');
    if (!data.metadata) errors.push('Missing metadata');
    if (!data.structure) errors.push('Missing structure');
    if (!data.timestamp) errors.push('Missing timestamp');
    
    // Validate structure
    try {
      this.validateFormStructure(data.structure);
    } catch (error) {
      errors.push(`Structure validation: ${error}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}