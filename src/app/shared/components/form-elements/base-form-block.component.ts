import { Component, Input, ElementRef, HostBinding, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DragHandleComponent } from './drag-handle.component';
import { DimensionValue, LayoutProperties } from '../../../core/models/element-properties.model';

@Component({
  selector: 'app-base-form-block',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    DragHandleComponent
  ],
  templateUrl: './base-form-block.component.html',
  styleUrls: ['./base-form-block.component.css'],
  host: {
    'class': 'form-block-wrapper',
    '[class.dragged]': '_isDragged',
    '[class.selected]': '_isSelected',
    '[class.auto-expand]': 'isAutoExpand',
    '[style.width]': 'elementWidth',
    '[style.height]': 'elementHeight',
    '[style.min-width]': 'elementMinWidth',
    '[style.max-width]': 'elementMaxWidth',
    '[style.min-height]': 'elementMinHeight',
    '[style.max-height]': 'elementMaxHeight'
  }
})
export class BaseFormBlockComponent implements OnChanges {
  @Input() id: string = '';
  @Input() set isDragged(value: boolean) {
    this._isDragged = value;
  }
  @Input() set isSelected(value: boolean) {
    this._isSelected = value;
  }
  @Input() layout?: LayoutProperties;
  @Input() label?: string;
  @Input() isEditingLabel: boolean = false;
  @Input() labelMinLength: number = 1;
  @Input() labelMaxLength: number = 100;
  @Input() labelRequired: boolean = false;
  @Input() required: boolean = false;
  @Input() deleteTooltip: string = 'Delete element';
  @Input() duplicateTooltip: string = 'Duplicate element';
  @Input() requiredTooltip: string = 'Toggle required';
  @Input() showRequiredToggle: boolean = true;
  
  @Output() dragHandleMouseDown = new EventEmitter<MouseEvent>();
  @Output() elementClick = new EventEmitter<MouseEvent>();
  @Output() labelEditStart = new EventEmitter<void>();
  @Output() labelEditEnd = new EventEmitter<string>();
  @Output() labelEditCancel = new EventEmitter<void>();
  @Output() deleteElement = new EventEmitter<string>();
  @Output() duplicateElement = new EventEmitter<string>();
  @Output() toggleRequired = new EventEmitter<{ id: string, required: boolean }>();
  @Output() openSettings = new EventEmitter<string>();

  protected _isDragged = false;
  protected _isSelected = false;
  protected tempLabel: string = '';

  constructor(protected elementRef: ElementRef) {}

  // Computed properties for layout styling
  get isAutoExpand(): boolean {
    return this.layout?.autoExpand !== false; // Default to true if not specified
  }

  get elementWidth(): string | undefined {
    // Only apply width when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.width ? `${this.layout.width.value}${this.layout.width.unit}` : undefined;
  }

  get elementHeight(): string | undefined {
    // Only apply height when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.height ? `${this.layout.height.value}${this.layout.height.unit}` : undefined;
  }

  get elementMinWidth(): string | undefined {
    // Only apply min-width when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.minWidth ? `${this.layout.minWidth.value}${this.layout.minWidth.unit}` : undefined;
  }

  get elementMaxWidth(): string | undefined {
    // Only apply max-width when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.maxWidth ? `${this.layout.maxWidth.value}${this.layout.maxWidth.unit}` : undefined;
  }

  get elementMinHeight(): string | undefined {
    // Only apply min-height when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.minHeight ? `${this.layout.minHeight.value}${this.layout.minHeight.unit}` : undefined;
  }

  get elementMaxHeight(): string | undefined {
    // Only apply max-height when auto-expand is disabled
    if (this.isAutoExpand) return undefined;
    return this.layout?.maxHeight ? `${this.layout.maxHeight.value}${this.layout.maxHeight.unit}` : undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layout']) {
      // React to layout changes if needed
    }
  }

  getNativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  onDragHandleMouseDown(event: MouseEvent) {
    this.dragHandleMouseDown.emit(event);
  }
  
  @HostListener('mousedown', ['$event'])
  onComponentMouseDown(event: MouseEvent) {
    const isDragHandle = (event.target as HTMLElement).closest('.drag-handle');
    if (!isDragHandle) {
      event.stopPropagation();
    }
  }
  
  @HostListener('click', ['$event'])
  onComponentClick(event: MouseEvent) {
    // Check if the click is on a label that's being edited
    const isLabelClick = (event.target as HTMLElement).closest('.input-label, .textarea-label, .select-label');
    const isEditInputClick = (event.target as HTMLElement).closest('.label-edit-input');
    
    if (isLabelClick && !this.isEditingLabel) {
      // If it's a label click and we're not already editing, start editing
      this.startLabelEdit();
      event.stopPropagation();
      return;
    }
    
    // If clicking on the edit input, don't emit the element click event
    if (isEditInputClick) {
      event.stopPropagation();
      return;
    }
    
    // If it's not a label click or we're already editing, proceed with normal click handling
    if (!this.isEditingLabel) {
      this.elementClick.emit(event);
    }
    event.stopPropagation();
  }
  
  // Inline editing methods
  startLabelEdit(): void {
    if (this.isEditingLabel) return;
    
    this.tempLabel = this.label || '';
    this.isEditingLabel = true;
    this.labelEditStart.emit();
  }
  
  finishLabelEdit(newLabel: string): void {
    if (!this.isEditingLabel) return;
    
    // Validate label
    if (this.labelRequired && !newLabel.trim()) {
      this.cancelLabelEdit();
      return;
    }
    
    if (newLabel.length < this.labelMinLength || newLabel.length > this.labelMaxLength) {
      this.cancelLabelEdit();
      return;
    }
    
    this.label = newLabel;
    this.isEditingLabel = false;
    this.labelEditEnd.emit(newLabel);
  }
  
  cancelLabelEdit(): void {
    if (!this.isEditingLabel) return;
    
    this.isEditingLabel = false;
    this.labelEditCancel.emit();
  }
  
  handleLabelKeyDown(event: KeyboardEvent): void {
    if (!this.isEditingLabel) return;
    
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        const inputElement = this.elementRef.nativeElement.querySelector('.label-edit-input');
        if (inputElement) {
          this.finishLabelEdit(inputElement.value);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.cancelLabelEdit();
        break;
    }
  }
  
  handleLabelBlur(event: FocusEvent): void {
    if (!this.isEditingLabel) return;
    
    // Small delay to allow click events to be processed
    setTimeout(() => {
      if (this.isEditingLabel) {
        const inputElement = this.elementRef.nativeElement.querySelector('.label-edit-input');
        if (inputElement) {
          this.finishLabelEdit(inputElement.value);
        }
      }
    }, 200);
  }
  
  // Action button methods
  onDeleteElement(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteElement.emit(this.id);
  }
  
  onDuplicateElement(event: MouseEvent): void {
    event.stopPropagation();
    this.duplicateElement.emit(this.id);
  }
  
  onToggleRequired(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleRequired.emit({ id: this.id, required: !this.required });
  }
  
  onOpenSettings(event: MouseEvent): void {
    event.stopPropagation();
    this.openSettings.emit(this.id);
  }
}