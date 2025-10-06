import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormElementProperties, ButtonAction } from '../../../../core/models/element-properties.model';
import { BaseFormBlockComponent } from '../base-form-block.component';
import { DragHandleComponent } from '../drag-handle.component';
import { ElementStateService } from '../../../../core/services/element-state.service';
import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { FormService } from '../../../../core/services/form.service';
import { Subscription } from 'rxjs';

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
export class ButtonElementComponent extends BaseFormBlockComponent implements OnInit, OnChanges, OnDestroy {
  @Input() properties: FormElementProperties = {} as FormElementProperties;
  @Output() click = new EventEmitter<Event>();
  @Output() override openSettings = new EventEmitter<string>();
  
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
  
  private propertiesSubscription?: Subscription;
  
  constructor(
    elementRef: ElementRef,
    elementStateService: ElementStateService,
    private formService: FormService,
    elementSelectionService: ElementSelectionService,
    cdr: ChangeDetectorRef
  ) {
    super(elementRef, elementSelectionService, elementStateService, cdr);
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
    
    // Update layout from properties - HostBinding will automatically apply styles
    this.layout = (this.properties as any).layout || {};
  }

  protected override onElementStateChanged(elementState: any): void {
    // Update properties from element state
    if (elementState.text !== undefined) this.text = elementState.text;
    if (elementState.buttonType !== undefined) this.buttonType = elementState.buttonType;
    if (elementState.htmlButtonType !== undefined) this.htmlButtonType = elementState.htmlButtonType;
    if (elementState.size !== undefined) this.size = elementState.size;
    if (elementState.shape !== undefined) this.shape = elementState.shape;
    if (elementState.icon !== undefined) this.icon = elementState.icon;
    if (elementState.loading !== undefined) this.loading = elementState.loading;
    if (elementState.block !== undefined) this.block = elementState.block;
    if (elementState.ghost !== undefined) this.ghost = elementState.ghost;
    if (elementState.danger !== undefined) this.danger = elementState.danger;
    if (elementState.disabled !== undefined) this.disabled = elementState.disabled;
    if (elementState.tooltip !== undefined) this.tooltip = elementState.tooltip;
    if (elementState.description !== undefined) this.description = elementState.description;
    if (elementState.action !== undefined) this.action = elementState.action;
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

  override ngOnDestroy(): void {
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }
}