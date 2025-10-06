import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { FormService } from '../../../../core/services/form.service';
import { FormValidationError } from '../../../../core/services/form.service';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-element',
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
export class SelectElementComponent extends BaseFormBlockComponent implements OnInit, OnChanges, OnDestroy {
  @Input() properties: FormElementProperties = {} as FormElementProperties;
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();
  @Output() override openSettings = new EventEmitter<string>();
  
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

  private propertiesSubscription?: Subscription;
  
  constructor(
    elementRef: ElementRef,
    elementStateService: ElementStateService,
    private formService: FormService,
    elementSelectionService: ElementSelectionService,
    cdr: ChangeDetectorRef
  ) {
    super(elementRef, elementSelectionService, elementStateService, cdr);
    
    // Subscribe to form validation results
    this.formService.formValidationResult$.subscribe(result => {
      this.updateValidationErrors(result);
    });
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.updateFromProperties();
  }
  
  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties']) {
      this.updateFromProperties();
    }
  }
  
  private updateFromProperties(): void {
    if (!this.properties) return;
    
    console.log('Updating from properties:', this.properties);
    
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
    
    // Update layout from properties - HostBinding will automatically apply styles
    this.layout = (this.properties as any).layout || {};
    
    console.log('Final layout:', this.layout);
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
  
  protected override onElementStateChanged(elementState: any): void {
    console.log('Updating from element state:', elementState);
    
    // Update properties from element state
    if (elementState.label !== undefined) this.label = elementState.label;
    if (elementState.required !== undefined) this.required = elementState.required;
    if (elementState.disabled !== undefined) this.disabled = elementState.disabled;
    if (elementState.placeholder !== undefined) this.placeholder = elementState.placeholder;
    if (elementState.description !== undefined) this.description = elementState.description;
    if (elementState.options !== undefined) this.options = elementState.options;
    
    // Update size and other select-specific properties
    if (elementState.size !== undefined) this.size = elementState.size;
    if (elementState.allowClear !== undefined) this.allowClear = elementState.allowClear;
    if (elementState.showSearch !== undefined) this.showSearch = elementState.showSearch;
    if (elementState.loading !== undefined) this.loading = elementState.loading;
  }

  override ngOnDestroy(): void {
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
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