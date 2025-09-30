import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drag-handle',
  templateUrl: './drag-handle.component.html',
  styleUrls: ['./drag-handle.component.css']
})
export class DragHandleComponent {
  @Output() mouseDown = new EventEmitter<MouseEvent>();

  onMouseDown(event: MouseEvent) {
    // Stop propagation to prevent the component's mousedown handler from being called
    event.stopPropagation();
    this.mouseDown.emit(event);
  }
}