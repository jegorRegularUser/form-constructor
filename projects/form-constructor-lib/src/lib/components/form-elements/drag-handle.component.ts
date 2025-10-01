import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'lib-drag-handle',
  standalone: true,
  imports: [CommonModule, NzIconModule],
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