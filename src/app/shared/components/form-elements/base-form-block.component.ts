import { Directive, Input, ElementRef, HostBinding, Output, EventEmitter, HostListener } from '@angular/core';

@Directive()
export abstract class BaseFormBlockComponent {
  @Input() id: string = '';
  @Input() set isDragged(value: boolean) {
    this._isDragged = value;
  }
  @Output() dragHandleMouseDown = new EventEmitter<MouseEvent>();

  protected _isDragged = false;

  @HostBinding('class.dragged') get draggedClass() {
    return this._isDragged;
  }

  constructor(protected elementRef: ElementRef) {}

  getNativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  onDragHandleMouseDown(event: MouseEvent) {
    // Emit the event to parent component
    this.dragHandleMouseDown.emit(event);
  }
  
  // Prevent drag start when clicking on the component itself
  @HostListener('mousedown', ['$event'])
  onComponentMouseDown(event: MouseEvent) {
    // Check if the click is on the drag handle
    const isDragHandle = (event.target as HTMLElement).closest('.drag-handle');
    if (!isDragHandle) {
      // Prevent the default drag behavior
      event.stopPropagation();
    }
  }
}