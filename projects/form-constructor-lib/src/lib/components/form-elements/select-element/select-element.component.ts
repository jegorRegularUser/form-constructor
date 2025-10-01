import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormElementProperties } from '../../../../core/models/element-properties.model';
import { BaseFormBlockComponent } from '../base-form-block.component';
import { DragHandleComponent } from '../drag-handle.component';
import { ElementStateService } from '../../../../core/services/element-state.service';
import { FormService } from '../../../../core/services/form.service';
import { FormValidationError } from '../../../../core/services/form.service';
import { NzStatus } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'lib-select-element',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzGridModule,
    NzToolTipModule,
    NzIconModule,
    BaseFormBlockComponent,
    DragHandleComponent
  ],
  templateUrl: './select-element.component.html',
  styleUrls: ['./select-element.component.css']
})
export class SelectElementComponent extends BaseFormBlockComponent implements OnInit, OnChanges {
  @Input() properties: FormElementProperties = {} as FormElementProperties;
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();
  
  // Extracted properties for easier access
  override label: string = '';
  override required: boolean = false;
  disabled: boolean = false;
  size: 'small' | 'default' | 'large' = 'default';
  allowClear: boolean = true;
  placeholder: string = '';
  showSearch: boolean = false;
  loading: boolean = false;
  description: string = '';
  options: any[] = [];
  
  // Form validation
  validationStatus: NzStatus = '';
  validationErrors: FormValidationError[] = [];
  
  constructor(
    elementRef: ElementRef,
    private elementStateService: ElementStateService,
    private formService: FormService
  ) {
    super(elementRef);
    
    // Subscribe to form validation results
    this.formService.formValidationResult$.subscribe(result => {
      this.updateValidationErrors(result);
    });
  }
  
  ngOnInit(): void {
    this.updateFromProperties();
  }
  
  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties']) {
      this.updateFromProperties();
    }
    
    // Initialize element state if properties are provided
    if (this.properties && this.properties.id) {
      this.elementStateService.updateElementProperties(this.properties.id, this.properties);
    }
  }
  
  private updateFromProperties(): void {
    if (!this.properties) return;
    
    // Extract properties from the input properties object
    this.label = this.properties.label || '';
    this.required = this.properties.required || false;
    this.disabled = this.properties.disabled || false;
    this.size = (this.properties as any).size || 'default';
    this.allowClear = (this.properties as any).allowClear !== false;
    this.placeholder = this.properties.placeholder || 'Please select';
    this.showSearch = (this.properties as any).showSearch || false;
    this.loading = (this.properties as any).loading || false;
    this.description = this.properties.description || '';
    this.options = (this.properties as any).options || [];
    
    // Set default value if none is provided
    if (this.value === null && this.options.length > 0) {
      this.value = this.options[0].value;
      this.valueChange.emit(this.value);
    }
    
    // Update layout properties
    this.updateLayoutProperties();
  }
  
  private updateLayoutProperties(): void {
    if (!this.properties) return;
    
    const layout = (this.properties as any).layout;
    if (!layout) return;
    
    const hostElement = this.elementRef.nativeElement;
    
    // Check auto-expand property
    const isAutoExpand = layout.autoExpand !== false; // Default to true if not specified
    
    // Apply width properties only when auto-expand is disabled
    if (!isAutoExpand) {
      if (layout.width) {
        const widthValue = typeof layout.width === 'object'
          ? `${layout.width.value}${layout.width.unit}`
          : layout.width;
        hostElement.style.width = widthValue;
      }
      
      if (layout.minWidth) {
        const minWidthValue = typeof layout.minWidth === 'object'
          ? `${layout.minWidth.value}${layout.minWidth.unit}`
          : layout.minWidth;
        hostElement.style.minWidth = minWidthValue;
      }
      
      if (layout.maxWidth) {
        const maxWidthValue = typeof layout.maxWidth === 'object'
          ? `${layout.maxWidth.value}${layout.maxWidth.unit}`
          : layout.maxWidth;
        hostElement.style.maxWidth = maxWidthValue;
      }
    } else {
      // Reset width styles when auto-expand is enabled
      hostElement.style.width = '';
      hostElement.style.minWidth = '';
      hostElement.style.maxWidth = '';
    }
    
    // Apply height properties only when auto-expand is disabled
    if (!isAutoExpand) {
      if (layout.height) {
        const heightValue = typeof layout.height === 'object'
          ? `${layout.height.value}${layout.height.unit}`
          : layout.height;
        hostElement.style.height = heightValue;
      }
      
      if (layout.minHeight) {
        const minHeightValue = typeof layout.minHeight === 'object'
          ? `${layout.minHeight.value}${layout.minHeight.unit}`
          : layout.minHeight;
        hostElement.style.minHeight = minHeightValue;
      }
      
      if (layout.maxHeight) {
        const maxHeightValue = typeof layout.maxHeight === 'object'
          ? `${layout.maxHeight.value}${layout.maxHeight.unit}`
          : layout.maxHeight;
        hostElement.style.maxHeight = maxHeightValue;
      }
    } else {
      // Reset height styles when auto-expand is enabled
      hostElement.style.height = '';
      hostElement.style.minHeight = '';
      hostElement.style.maxHeight = '';
    }
    
    // Add or remove auto-expand class based on the property
    if (isAutoExpand) {
      hostElement.classList.add('auto-expand');
    } else {
      hostElement.classList.remove('auto-expand');
    }
    
    // Update the layout property to ensure consistency with the base component
    this.layout = layout;
  }
  
  /**
   * Handle value change
   */
  onValueChange(newValue: any): void {
    this.value = newValue;
    this.valueChange.emit(newValue);
    
    // Update element state
    if (this.properties && this.properties.id) {
      this.elementStateService.updateElementProperties(this.properties.id, { value: newValue });
      
      // Update form service with the new value
      this.formService.updateElementValue(this.properties.id, newValue);
    }
  }
  
  /**
   * Handle select blur event
   */
  onBlur(): void {
    // Validate the form on blur
    this.formService.validateForm();
  }
  
  /**
   * Update validation errors based on form validation result
   */
  private updateValidationErrors(result: any): void {
    if (!this.properties || !this.properties.id) return;
    
    // Filter errors for this element
    this.validationErrors = result.errors.filter((error: FormValidationError) =>
      error.elementId === this.properties!.id
    );
    
    // Update validation status
    this.validationStatus = this.validationErrors.length > 0 ? 'error' : '';
  }
  
  /**
   * Get validation error message
   */
  getValidationErrorMessage(): string {
    return this.validationErrors.length > 0 ? this.validationErrors[0].message : '';
  }
  
  /**
   * Add a new option to the select element
   */
  addOption(label: string = '', value: any = null): void {
    if (!this.options) {
      this.options = [];
    }
    
    // Generate a unique value if not provided
    if (value === null) {
      value = `option_${Date.now()}_${this.options.length}`;
    }
    
    // If label is empty, use the value
    if (!label) {
      label = String(value);
    }
    
    this.options.push({ label, value, disabled: false });
    this.updateOptionsInProperties();
  }
  
  /**
   * Remove an option from the select element
   */
  removeOption(index: number): void {
    if (this.options && index >= 0 && index < this.options.length) {
      // If the removed option was the selected value, clear the selection
      if (this.value === this.options[index].value) {
        this.value = null;
        this.valueChange.emit(this.value);
      }
      
      this.options.splice(index, 1);
      this.updateOptionsInProperties();
    }
  }
  
  /**
   * Update an option in the select element
   */
  updateOption(index: number, label: string, value: any, disabled: boolean = false): void {
    if (this.options && index >= 0 && index < this.options.length) {
      const oldValue = this.options[index].value;
      this.options[index] = { label, value, disabled };
      
      // If the value changed and this was the selected option, update the selected value
      if (oldValue === this.value && oldValue !== value) {
        this.value = value;
        this.valueChange.emit(this.value);
      }
      
      this.updateOptionsInProperties();
    }
  }
  
  /**
   * Move an option up in the list
   */
  moveOptionUp(index: number): void {
    if (this.options && index > 0 && index < this.options.length) {
      const temp = this.options[index];
      this.options[index] = this.options[index - 1];
      this.options[index - 1] = temp;
      this.updateOptionsInProperties();
    }
  }
  
  /**
   * Move an option down in the list
   */
  moveOptionDown(index: number): void {
    if (this.options && index >= 0 && index < this.options.length - 1) {
      const temp = this.options[index];
      this.options[index] = this.options[index + 1];
      this.options[index + 1] = temp;
      this.updateOptionsInProperties();
    }
  }
  
  /**
   * Update the options in the properties object
   */
  private updateOptionsInProperties(): void {
    if (this.properties) {
      // Create a new properties object to trigger change detection
      const updatedProperties = {
        ...this.properties,
        options: [...this.options]
      };
      
      // Update the properties
      this.properties = updatedProperties;
      
      // Update element state
      if (this.properties.id) {
        this.elementStateService.updateElementProperties(this.properties.id, { options: this.options });
      }
    }
  }
}