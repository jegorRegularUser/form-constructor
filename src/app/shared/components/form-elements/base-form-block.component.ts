import { Directive, Input, ElementRef, HostBinding, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appFormBlock]',
  host: {
    'class': 'form-block-wrapper',
    '[class.dragged]': '_isDragged'
  }
})
export abstract class BaseFormBlockComponent {
  @Input() id: string = '';
  @Input() set isDragged(value: boolean) {
    this._isDragged = value;
  }
  @Output() dragHandleMouseDown = new EventEmitter<MouseEvent>();

  protected _isDragged = false;

  constructor(protected elementRef: ElementRef) {}

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
}