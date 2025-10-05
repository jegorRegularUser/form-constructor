import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block.component';
import { DragHandleComponent } from './drag-handle.component';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { PlaceholderStyle } from '../../../core/models/element-properties.model';
import { FormElementProperties } from '../../../core/models/element-properties.model';
import { ElementStateService } from '../../../core/services/element-state.service';
import { ElementSelectionService } from '../../../core/services/element-selection.service';
import { FormService } from '../../../core/services/form.service';
import { FormValidationError } from '../../../core/services/form.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, BaseFormBlockComponent, DragHandleComponent, NzInputModule, NzButtonModule, NzIconModule, NzToolTipModule, FormsModule],
  templateUrl: './input.component.html',
  styles: [`
    @import './drag-styles.css';
    
    .form-block-content {
      display: flex;
      align-items: center;
      height: 100%;
      position: relative;
      min-height: 24px;
      width: 100%;
    }

    .input-wrapper {
      flex: 1;
      width: 100%;
    }

    .input-label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }

    .input-field {
      flex: 1;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent;
      padding: 0;
      font-size: 14px;
      line-height: 1.5715;
      color: rgba(0, 0, 0, 0.85);
      width: 100%;
      min-width: 0;
    }

    .input-field::placeholder {
      color: var(--placeholder-color, rgba(0, 0, 0, 0.25));
      font-size: var(--placeholder-font-size, 14px);
      font-style: var(--placeholder-font-style, normal);
      font-weight: var(--placeholder-font-weight, normal);
    }
    
    .required-indicator {
      color: #f5222d;
      margin-left: 4px;
    }
    
    .validation-error {
      color: #f5222d;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.5;
    }
  `]
})
export class InputComponent extends BaseFormBlockComponent implements OnChanges, OnDestroy {
  @Input() value: string = '';
  @Input() placeholder: string = 'Enter text...';
  @Input() placeholderStyle?: PlaceholderStyle;
  @Input() override label: string = '';
  @Input() override required: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() validationStatus: NzStatus = '';
  @Input() properties?: FormElementProperties;
  
  @Output() override openSettings = new EventEmitter<string>();
  
  // Form validation
  validationErrors: FormValidationError[] = [];
  
  private propertiesSubscription?: Subscription;
  
  constructor(
    elementRef: ElementRef,
    private elementStateService: ElementStateService,
    private formService: FormService,
    elementSelectionService: ElementSelectionService
  ) {
    super(elementRef, elementSelectionService);
    
    // Subscribe to form validation results
    this.formService.formValidationResult$.subscribe(result => {
      this.updateValidationErrors(result);
    });
    
    // Subscribe to properties changes from state service
    if (this.properties && this.properties.id) {
      this.propertiesSubscription = this.elementStateService.formState$.subscribe(state => {
        if (this.properties?.id && state.elementProperties[this.properties.id]) {
          const updatedProperties = state.elementProperties[this.properties.id];
          this.properties = { ...this.properties, ...updatedProperties };
          this.updateFromProperties();
        }
      });
    }
  }
  
  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['placeholderStyle']) {
      this.updatePlaceholderStyle();
    }
    
    if (changes['placeholder']) {
      // Update the placeholder text in the input field
      const inputElement = this.elementRef.nativeElement.querySelector('.input-field');
      if (inputElement) {
        inputElement.placeholder = this.placeholder;
      }
    }
    
    if (changes['required']) {
      // Update the required attribute on the input field
      const inputElement = this.elementRef.nativeElement.querySelector('.input-field');
      if (inputElement) {
        inputElement.required = this.required;
      }
    }
    
    if (changes['readOnly']) {
      // Update the readOnly attribute on the input field
      const inputElement = this.elementRef.nativeElement.querySelector('.input-field');
      if (inputElement) {
        inputElement.readOnly = this.readOnly;
      }
    }
    
    if (changes['properties']) {
      this.updateFromProperties();
    }
    
    // Initialize element state if properties are provided
    if (this.properties && this.properties.id) {
      this.elementStateService.updateElementProperties(this.properties.id, this.properties);
    }
  }
  
  // Handle label edit start event
  onLabelEditStart(event: MouseEvent): void {
    event.stopPropagation();
    this.startLabelEdit();
  }
  
  // Handle label edit end event
  onLabelEditEnd(newLabel: string): void {
    this.finishLabelEdit(newLabel);
    // Update properties
    if (this.properties) {
      this.properties.label = newLabel;
      // Update element state
      this.elementStateService.updateElementProperties(this.properties.id, { label: newLabel });
    }
  }
  
  // Handle label edit cancel event
  onLabelEditCancel(): void {
    this.cancelLabelEdit();
  }
  
  private updateFromProperties(): void {
    if (!this.properties) return;
    
    // Update component properties from the properties object
    if (this.properties.label !== undefined) {
      this.label = this.properties.label;
    }
    
    if (this.properties.placeholder !== undefined) {
      this.placeholder = this.properties.placeholder;
    }
    
    if (this.properties.defaultValue !== undefined) {
      this.value = this.properties.defaultValue;
    }
    
    if (this.properties.required !== undefined) {
      this.required = this.properties.required;
    }
    
    if (this.properties.readOnly !== undefined) {
      this.readOnly = this.properties.readOnly;
    }
    
    if (this.properties.disabled !== undefined) {
      this.disabled = this.properties.disabled;
    }
    
    if ((this.properties as any).placeholderStyle !== undefined) {
      this.placeholderStyle = (this.properties as any).placeholderStyle;
      this.updatePlaceholderStyle();
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
  
  getPlaceholderStyle(): Record<string, string> {
    if (!this.placeholderStyle) return {};
    
    const style: Record<string, string> = {};
    
    if (this.placeholderStyle.color) {
      style['--placeholder-color'] = this.placeholderStyle.color;
    }
    
    if (this.placeholderStyle.fontSize) {
      style['--placeholder-font-size'] = this.placeholderStyle.fontSize;
    }
    
    if (this.placeholderStyle.fontStyle) {
      style['--placeholder-font-style'] = this.placeholderStyle.fontStyle;
    }
    
    if (this.placeholderStyle.fontWeight) {
      style['--placeholder-font-weight'] = String(this.placeholderStyle.fontWeight);
    }
    
    return style;
  }
  
  private updatePlaceholderStyle(): void {
    const inputElement = this.elementRef.nativeElement.querySelector('.input-field');
    if (!inputElement || !this.placeholderStyle) return;
    
    // Update the CSS custom properties for the placeholder
    const style = inputElement.style;
    
    if (this.placeholderStyle.color) {
      style.setProperty('--placeholder-color', this.placeholderStyle.color);
    }
    
    if (this.placeholderStyle.fontSize) {
      style.setProperty('--placeholder-font-size', this.placeholderStyle.fontSize);
    }
    
    if (this.placeholderStyle.fontStyle) {
      style.setProperty('--placeholder-font-style', this.placeholderStyle.fontStyle);
    }
    
    if (this.placeholderStyle.fontWeight) {
      style.setProperty('--placeholder-font-weight', String(this.placeholderStyle.fontWeight));
    }
  }
  
  /**
   * Handle input value change
   */
  onValueChange(newValue: string): void {
    this.value = newValue;
    
    // Update element state
    if (this.properties && this.properties.id) {
      this.elementStateService.updateElementProperties(this.properties.id, { value: newValue });
      
      // Update form service with the new value
      this.formService.updateElementValue(this.properties.id, newValue);
    }
  }
  
  /**
   * Handle input blur event
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
  
  override ngOnDestroy(): void {
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  /**
   * Get validation error message
   */
  getValidationErrorMessage(): string {
    return this.validationErrors.length > 0 ? this.validationErrors[0].message : '';
  }
}