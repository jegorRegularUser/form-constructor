import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block.component';

import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { PlaceholderStyle } from '../../../core/models/element-properties.model';
import { FormElementProperties } from '../../../core/models/element-properties.model';
import { ElementStateService } from '../../../core/services/element-state.service';
import { ElementSelectionService } from '../../../core/services/element-selection.service';
import { FormService } from '../../../core/services/form.service';
import { FormValidationError } from '../../../core/services/form.service';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, BaseFormBlockComponent, NzInputModule, FormsModule],
  templateUrl: './textarea.component.html',
  styles: [`
    @import './drag-styles.css';
    
    .form-block-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      min-height: 60px;
      width: 100%;
    }

    .textarea-wrapper {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .textarea-label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
    }

    .textarea-field {
      flex: 1;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent;
      resize: none;
      padding: 0;
      font-size: 14px;
      line-height: 1.5715;
      color: rgba(0, 0, 0, 0.85);
      width: 100%;
      min-width: 0;
      min-height: 0;
    }

    .textarea-field::placeholder {
      color: var(--placeholder-color, rgba(0, 0, 0, 0.25));
      font-size: var(--placeholder-font-size, 14px);
      font-style: var(--placeholder-font-style, normal);
      font-weight: var(--placeholder-font-weight, normal);
    }
    
    .required-indicator {
      color: #f5222d;
      margin-left: 4px;
    }

    .char-counter {
      text-align: right;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      margin-top: 4px;
    }
    
    .validation-error {
      color: #f5222d;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.5;
    }
  `]
})
export class TextareaComponent extends BaseFormBlockComponent implements OnChanges, OnDestroy {
  @Input() value: string = '';
  @Input() rows: number = 3;
  @Input() maxRows: number = 6;
  @Input() placeholder: string = 'Enter text here...';
  @Input() placeholderStyle?: PlaceholderStyle;
  @Input() override label: string = '';
  @Input() override required: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showCount: boolean = false;
  @Input() maxLength: number = 0;
  @Input() validationStatus: NzStatus = '';
  @Input() properties?: FormElementProperties;
  
  @Output() override openSettings = new EventEmitter<string>();
  
  // Form validation
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
    if (changes['placeholderStyle']) {
      this.updatePlaceholderStyle();
    }
    
    if (changes['properties']) {
      this.updateFromProperties();
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
    this.label = this.properties.label || '';
    this.placeholder = this.properties.placeholder || 'Enter text here...';
    this.value = this.properties.defaultValue || '';
    this.required = this.properties.required || false;
    this.readOnly = this.properties.readOnly || false;
    this.disabled = this.properties.disabled || false;
    this.rows = (this.properties as any).rows || 3;
    this.maxRows = (this.properties as any).maxRows || 6;
    this.showCount = (this.properties as any).showCount || false;
    this.maxLength = (this.properties as any).maxLength || 0;
    
    if ((this.properties as any).placeholderStyle !== undefined) {
      this.placeholderStyle = (this.properties as any).placeholderStyle;
      this.updatePlaceholderStyle();
    }
    
    // Update layout from properties - HostBinding will automatically apply styles
    this.layout = (this.properties as any).layout || {};
  }

  protected override onElementStateChanged(elementState: any): void {
    // Update properties from element state
    if (elementState.label !== undefined) this.label = elementState.label;
    if (elementState.placeholder !== undefined) this.placeholder = elementState.placeholder;
    if (elementState.defaultValue !== undefined) this.value = elementState.defaultValue;
    if (elementState.required !== undefined) this.required = elementState.required;
    if (elementState.readOnly !== undefined) this.readOnly = elementState.readOnly;
    if (elementState.disabled !== undefined) this.disabled = elementState.disabled;
    if (elementState.rows !== undefined) this.rows = elementState.rows;
    if (elementState.maxRows !== undefined) this.maxRows = elementState.maxRows;
    if (elementState.showCount !== undefined) this.showCount = elementState.showCount;
    if (elementState.maxLength !== undefined) this.maxLength = elementState.maxLength;
    
    if (elementState.placeholderStyle !== undefined) {
      this.placeholderStyle = elementState.placeholderStyle;
      this.updatePlaceholderStyle();
    }
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
    const textareaElement = this.elementRef.nativeElement.querySelector('.textarea-field');
    if (!textareaElement || !this.placeholderStyle) return;
    
    // Update the CSS custom properties for the placeholder
    const style = textareaElement.style;
    
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
   * Handle textarea value change
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
   * Handle textarea blur event
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