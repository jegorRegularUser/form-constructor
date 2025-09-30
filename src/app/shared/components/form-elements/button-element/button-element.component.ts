import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormElementProperties, ButtonAction } from '../../../../core/models/element-properties.model';
import { BaseFormBlockComponent } from '../base-form-block.component';
import { DragHandleComponent } from '../drag-handle.component';
import { ElementStateService } from '../../../../core/services/element-state.service';
import { FormService } from '../../../../core/services/form.service';

@Component({
  selector: 'app-button-element',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    BaseFormBlockComponent,
    DragHandleComponent
  ],
  templateUrl: './button-element.component.html',
  styleUrls: ['./button-element.component.css']
})
export class ButtonElementComponent extends BaseFormBlockComponent implements OnInit, OnChanges {
  @Input() properties: FormElementProperties = {} as FormElementProperties;
  @Output() click = new EventEmitter<Event>();
  
  // Extracted properties for easier access
  text: string = '';
  buttonType: 'primary' | 'default' | 'dashed' | 'text' | 'link' = 'default';
  htmlButtonType: 'submit' | 'button' | 'reset' = 'button';
  size: 'large' | 'default' | 'small' = 'default';
  shape: 'circle' | 'round' | undefined;
  icon: string | undefined;
  loading: boolean = false;
  block: boolean = false;
  ghost: boolean = false;
  danger: boolean = false;
  disabled: boolean = false;
  tooltip: string = '';
  description: string = '';
  action?: ButtonAction;
  
  constructor(
    elementRef: ElementRef,
    private elementStateService: ElementStateService,
    private formService: FormService
  ) {
    super(elementRef);
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
    this.text = (this.properties as any).text || 'Button';
    this.buttonType = (this.properties as any).buttonType || 'default';
    this.htmlButtonType = (this.properties as any).htmlButtonType || 'button';
    this.size = (this.properties as any).size || 'default';
    this.shape = (this.properties as any).shape;
    this.icon = (this.properties as any).icon;
    this.loading = (this.properties as any).loading || false;
    this.block = (this.properties as any).block || false;
    this.ghost = (this.properties as any).ghost || false;
    this.danger = (this.properties as any).danger || false;
    this.disabled = this.properties.disabled || false;
    this.tooltip = this.properties.tooltip || '';
    this.description = this.properties.description || '';
    this.action = (this.properties as any).action;
    
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
   * Handle button click
   */
  async onClick(event: Event): Promise<void> {
    // Handle form submission for submit buttons
    if (this.htmlButtonType === 'submit') {
      try {
        await this.formService.submitForm({
          validateBeforeSubmit: true,
          showValidationErrors: true,
          resetOnSuccess: false
        });
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    // Handle form reset for reset buttons
    else if (this.htmlButtonType === 'reset') {
      this.formService.resetForm({
        keepDefaultValues: true,
        clearValidationErrors: true
      });
    }
    
    // Emit the click event for other handlers
    this.click.emit(event);
  }
}