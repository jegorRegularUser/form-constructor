import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';
import { PropertyValidationResult } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-base-property-editor',
  template: `
    <div class="base-property-editor">
      <!-- Base property editor template -->
    </div>
  `,
  styles: [
    `
    .base-property-editor {
      width: 100%;
    }
    `
  ]
})
export class BasePropertyEditorComponent implements OnInit, OnChanges {
  @Input() property!: PropertyDefinition;
  @Input() value: any;
  @Input() disabled: boolean = false;
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() validationChange = new EventEmitter<PropertyValidationResult>();
  
  protected currentValue: any;
  protected isValid: boolean = true;
  protected validationErrors: string[] = [];
  protected validationWarnings: string[] = [];
  
  constructor() { }
  
  ngOnInit(): void {
    this.currentValue = this.value !== undefined ? this.value : this.getDefaultValue();
    this.validate();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.currentValue = changes['value'].currentValue !== undefined
        ? changes['value'].currentValue
        : this.getDefaultValue();
      this.validate();
    }
    
    if (changes['property']) {
      this.validate();
    }
  }
  
  /**
   * Get the default value for the property
   */
  protected getDefaultValue(): any {
    return this.property.defaultValue !== undefined ? this.property.defaultValue : null;
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
}