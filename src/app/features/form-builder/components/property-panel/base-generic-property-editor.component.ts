import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';
import { PropertyValidationResult } from '../../../../core/models/property-schema.model';
import { PropertyType, DEFAULT_PROPERTY_CONFIG } from '../../../../core/enums/property-type.enum';
import { PropertyPanelService } from '../../../../core/services/property-panel.service';

@Component({
  selector: 'app-base-generic-property-editor',
  standalone: true,
  imports: [CommonModule, NzToolTipModule, NzIconModule],
  template: `
    <div class="base-generic-property-editor">
      <div class="property-label" *ngIf="property?.label">
        {{ property.label }}
        <span *ngIf="property?.required" class="property-required">*</span>
        <span *ngIf="property?.description" nz-tooltip [nzTooltipTitle]="property.description" nz-icon nzType="info-circle" class="property-info"></span>
      </div>
      <div class="property-editor-container">
        <ng-container #propertyEditorContainer></ng-container>
      </div>
    </div>
  `,
  styles: [
    `
    .base-generic-property-editor {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .property-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
    }
    
    .property-required {
      color: #f5222d;
      margin-left: 4px;
    }
    
    .property-info {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.45);
      cursor: help;
    }
    
    .property-editor-container {
      width: 100%;
    }
    `
  ]
})
export class BaseGenericPropertyEditorComponent implements OnInit, OnChanges {
  @Input() property!: PropertyDefinition;
  @Input() value: any;
  @Input() disabled: boolean = false;
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() validationChange = new EventEmitter<PropertyValidationResult>();
  
  @ViewChild('propertyEditorContainer', { read: ViewContainerRef, static: true })
  propertyEditorContainer!: ViewContainerRef;
  
  protected currentValue: any;
  protected isValid: boolean = true;
  protected validationErrors: string[] = [];
  protected validationWarnings: string[] = [];
  
  private propertyEditorComponentRef: ComponentRef<any> | null = null;
  
  constructor(
    private propertyPanelService: PropertyPanelService
  ) { }
  
  ngOnInit(): void {
    this.currentValue = this.value !== undefined ? this.value : this.getDefaultValue();
    this.validate();
    this.createPropertyEditor();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.currentValue = changes['value'].currentValue !== undefined
        ? changes['value'].currentValue
        : this.getDefaultValue();
      this.validate();
      this.updatePropertyEditorValue();
    }
    
    if (changes['property']) {
      this.validate();
      this.recreatePropertyEditor();
    }
  }
  
  /**
   * Get the default value for the property
   */
  protected getDefaultValue(): any {
    if (this.property.defaultValue !== undefined) {
      return this.property.defaultValue;
    }
    
    // Get default from configuration based on property type
    const typeConfig = DEFAULT_PROPERTY_CONFIG[this.property.type as PropertyType];
    if (typeConfig && typeConfig.defaultValue !== undefined) {
      return typeConfig.defaultValue;
    }
    
    // Type-specific defaults
    switch (this.property.type) {
      case 'text':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }
  
  /**
   * Validate the current value
   */
  protected validate(): void {
    // Reset validation state
    this.isValid = true;
    this.validationErrors = [];
    this.validationWarnings = [];
    
    // Check if required and value is empty
    if (this.property.required && (this.currentValue === null || this.currentValue === undefined || this.currentValue === '')) {
      this.isValid = false;
      this.validationErrors.push(`${this.property.label} is required`);
    }
    
    // Type-specific validation
    this.performTypeSpecificValidation();
    
    // Custom validator if provided
    if (this.property.validator) {
      const customValidation = this.property.validator(this.currentValue);
      if (customValidation !== true) {
        this.isValid = false;
        if (typeof customValidation === 'string') {
          this.validationErrors.push(customValidation);
        } else if (Array.isArray(customValidation)) {
          this.validationErrors.push(...customValidation);
        }
      }
    }
    
    // Emit validation result
    this.validationChange.emit({
      isValid: this.isValid,
      errors: this.validationErrors.length > 0 ? this.validationErrors : undefined,
      warnings: this.validationWarnings.length > 0 ? this.validationWarnings : undefined
    });
  }
  
  /**
   * Perform type-specific validation
   * Override in subclasses to implement specific validation logic
   */
  protected performTypeSpecificValidation(): void {
    // Base implementation does nothing
  }
  
  /**
   * Handle value change
   */
  protected onValueChange(newValue: any): void {
    this.currentValue = newValue;
    this.validate();
    this.valueChange.emit(this.currentValue);
  }
  
  /**
   * Check if the property is read-only
   */
  protected isReadOnly(): boolean {
    return this.disabled || this.property.disabled || false;
  }
  
  /**
   * Get the placeholder text for the property
   */
  protected getPlaceholder(): string {
    return this.property.placeholder || '';
  }
  
  /**
   * Get the CSS classes for the editor
   */
  protected getEditorClasses(): string {
    const classes = ['property-editor'];
    
    if (!this.isValid) {
      classes.push('property-editor-invalid');
    }
    
    if (this.isReadOnly()) {
      classes.push('property-editor-readonly');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Create the appropriate property editor component
   */
  private createPropertyEditor(): void {
    if (!this.propertyEditorContainer) {
      return;
    }
    
    // Clear any existing editor
    this.propertyEditorContainer.clear();
    
    // Get the property editor component for this property type
    const propertyEditorConfig = this.propertyPanelService.getPropertyEditor(this.property.type);
    
    if (propertyEditorConfig && propertyEditorConfig.component) {
      // Create the component
      this.propertyEditorComponentRef = this.propertyEditorContainer.createComponent(propertyEditorConfig.component);
      
      // Set inputs
      if (this.propertyEditorComponentRef.instance) {
        this.propertyEditorComponentRef.instance.property = this.property;
        this.propertyEditorComponentRef.instance.value = this.currentValue;
        this.propertyEditorComponentRef.instance.disabled = this.isReadOnly();
        
        // Set additional inputs from the property editor configuration
        if (propertyEditorConfig.inputs) {
          Object.keys(propertyEditorConfig.inputs).forEach(key => {
            this.propertyEditorComponentRef!.instance[key] = propertyEditorConfig.inputs![key];
          });
        }
        
        // Subscribe to value changes
        if (this.propertyEditorComponentRef.instance.valueChange) {
          this.propertyEditorComponentRef.instance.valueChange.subscribe((value: any) => {
            this.onValueChange(value);
          });
        }
        
        // Subscribe to validation changes if available
        if (this.propertyEditorComponentRef.instance.validationChange) {
          this.propertyEditorComponentRef.instance.validationChange.subscribe((result: PropertyValidationResult) => {
            this.validationChange.emit(result);
          });
        }
      }
    } else {
      // No specific editor found, create a fallback based on property type
      this.createFallbackEditor();
    }
  }
  
  /**
   * Create a fallback editor when no specific editor is found
   */
  private createFallbackEditor(): void {
    console.warn(`No property editor found for type: ${this.property.type}`, {
      propertyName: this.property.name,
      propertyLabel: this.property.label,
      propertyType: this.property.type,
      availableEditors: Object.keys(this.propertyPanelService.getPropertyEditors())
    });
    
    // Create simple HTML template for fallback
    const container = this.propertyEditorContainer.element.nativeElement;
    
    let inputHtml = '';
    
    switch (this.property.type) {
      case 'boolean':
        inputHtml = `<input type="checkbox" class="fallback-input" ${this.currentValue ? 'checked' : ''} ${this.isReadOnly() ? 'disabled' : ''}>`;
        break;
        
      case 'number':
        const min = this.property.min !== undefined ? `min="${this.property.min}"` : '';
        const max = this.property.max !== undefined ? `max="${this.property.max}"` : '';
        inputHtml = `<input type="number" class="fallback-input" value="${this.currentValue || 0}" ${min} ${max} ${this.isReadOnly() ? 'disabled' : ''}>`;
        break;
        
      case 'select':
      case 'font-weight':
      case 'border-style':
        let options = '';
        if (this.property.options) {
          options = this.property.options.map(option => 
            `<option value="${option.value}" ${String(option.value) === String(this.currentValue) ? 'selected' : ''}>${option.label}</option>`
          ).join('');
        }
        inputHtml = `<select class="fallback-input" ${this.isReadOnly() ? 'disabled' : ''}>${options}</select>`;
        break;
        
      default:
        inputHtml = `<input type="text" class="fallback-input" value="${this.currentValue || ''}" placeholder="${this.property.placeholder || ''}" ${this.isReadOnly() ? 'disabled' : ''}>`;
        break;
    }
    
    container.innerHTML = `
      <style>
        .fallback-property-editor {
          width: 100%;
          padding: 4px;
        }
        .fallback-input {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 14px;
        }
        .fallback-input:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
        .fallback-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      </style>
      <div class="fallback-property-editor">
        ${inputHtml}
      </div>
    `;
    
    // Add event listeners
    const input = container.querySelector('.fallback-input') as HTMLInputElement;
    if (input) {
      if (input.type === 'checkbox') {
        input.addEventListener('change', (e) => {
          this.onValueChange((e.target as HTMLInputElement).checked);
        });
      } else if (input.type === 'number') {
        input.addEventListener('input', (e) => {
          this.onValueChange(Number((e.target as HTMLInputElement).value));
        });
      } else {
        input.addEventListener('input', (e) => {
          this.onValueChange((e.target as HTMLInputElement).value);
        });
      }
    }
  }
  
  /**
   * Update the property editor value
   */
  private updatePropertyEditorValue(): void {
    if (this.propertyEditorComponentRef && this.propertyEditorComponentRef.instance) {
      this.propertyEditorComponentRef.instance.value = this.currentValue;
    }
  }
  
  /**
   * Recreate the property editor when the property definition changes
   */
  private recreatePropertyEditor(): void {
    this.createPropertyEditor();
  }
}