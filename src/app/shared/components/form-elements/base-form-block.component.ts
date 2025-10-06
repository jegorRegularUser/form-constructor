import { Component, Input, ElementRef, HostBinding, Output, EventEmitter, HostListener, OnChanges, SimpleChanges, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DragHandleComponent } from './drag-handle.component';
import { DimensionValue, LayoutProperties } from '../../../core/models/element-properties.model';
import { ElementSelectionService } from '../../../core/services/element-selection.service';
import { ElementStateService } from '../../../core/services/element-state.service';
import { Subject, takeUntil } from 'rxjs';

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
    '[class.static-size]': '!isAutoExpand'
  }
})
export class BaseFormBlockComponent implements OnChanges, OnInit, OnDestroy {
  @Input() id: string = '';
  @Input() type: string = 'input';
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
  private destroy$ = new Subject<void>();

  constructor(
    protected elementRef: ElementRef,
    private elementSelectionService: ElementSelectionService,
    protected elementStateService: ElementStateService,
    private cdr: ChangeDetectorRef
  ) {}

  // HostBinding for styles - replaces manual style management
  @HostBinding('style.width') get hostWidth(): string | null {
    const width = this.isAutoExpand ? null : (this.elementWidth || null);
    console.log(`HostBinding width for ${this.id}:`, width, 'autoExpand:', this.isAutoExpand);
    return width;
  }

  @HostBinding('style.height') get hostHeight(): string | null {
    const height = this.isAutoExpand ? null : (this.elementHeight || null);
    console.log(`HostBinding height for ${this.id}:`, height, 'autoExpand:', this.isAutoExpand);
    return height;
  }

  @HostBinding('style.min-width') get hostMinWidth(): string | null {
    return this.elementMinWidth || null;
  }

  @HostBinding('style.max-width') get hostMaxWidth(): string | null {
    return this.elementMaxWidth || null;
  }

  @HostBinding('style.min-height') get hostMinHeight(): string | null {
    return this.elementMinHeight || null;
  }

  @HostBinding('style.max-height') get hostMaxHeight(): string | null {
    return this.elementMaxHeight || null;
  }

  // Computed properties for layout styling
  get isAutoExpand(): boolean {
    if (!this.layout) return true;
    if (this.layout.autoExpand === false) return false;
    return true;
  }

  get elementWidth(): string | undefined {
    const width = this.layout?.width ? this.formatDimension(this.layout.width) : undefined;
    console.log(`elementWidth for ${this.id}:`, width, 'layout.width:', this.layout?.width);
    return width;
  }

  get elementHeight(): string | undefined {
    const height = this.layout?.height ? this.formatDimension(this.layout.height) : undefined;
    console.log(`elementHeight for ${this.id}:`, height, 'layout.height:', this.layout?.height);
    return height;
  }

  get elementMinWidth(): string | undefined {
    return this.layout?.minWidth ? this.formatDimension(this.layout.minWidth) : undefined;
  }

  get elementMaxWidth(): string | undefined {
    return this.layout?.maxWidth ? this.formatDimension(this.layout.maxWidth) : undefined;
  }

  get elementMinHeight(): string | undefined {
    return this.layout?.minHeight ? this.formatDimension(this.layout.minHeight) : undefined;
  }

  get elementMaxHeight(): string | undefined {
    return this.layout?.maxHeight ? this.formatDimension(this.layout.maxHeight) : undefined;
  }

  private formatDimension(dimension: any): string {
    if (!dimension) return '';
    
    if (typeof dimension === 'object' && dimension.value !== undefined && dimension.unit) {
      return `${dimension.value}${dimension.unit}`;
    }
    
    if (typeof dimension === 'string') {
      return dimension;
    }
    
    return String(dimension);
  }

  ngOnInit() {
    // Subscribe to selection changes
    this.elementSelectionService.selectedElement$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedElement => {
        this._isSelected = selectedElement?.id === this.id;
      });

    // Subscribe to element state changes to update layout
    this.elementStateService.formState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        const elementState = state.elementProperties[this.id];
        if (elementState) {
          // Update layout when element state changes
          if (elementState.layout) {
            this.layout = { ...elementState.layout };
            console.log('Layout updated from state for', this.id, ':', this.layout);
            console.log('isAutoExpand:', this.isAutoExpand);
            console.log('elementWidth:', this.elementWidth);
            console.log('elementHeight:', this.elementHeight);
            
            // Force change detection to update HostBinding
            this.cdr.detectChanges();
          }
          
          // Notify child components of state changes
          this.onElementStateChanged(elementState);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layout']) {
      console.log('Layout changed:', this.layout);
      // HostBinding automatically updates styles when layout changes
    }
  }

  // REMOVED: updateElementStyles() - now handled by HostBinding
  
  // Override this method in child components to handle state changes
  protected onElementStateChanged(elementState: any): void {
    // Base implementation does nothing - child components can override
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
      // Select this element
      this.elementSelectionService.selectElement({
        id: this.id,
        type: this.type as any,
        label: this.label || '',
        name: this.id,
        required: this.required
      });
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