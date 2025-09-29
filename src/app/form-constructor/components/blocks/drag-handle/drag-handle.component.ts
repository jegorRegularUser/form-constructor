import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drag-handle',
  template: `
    <div
      class="drag-handle"
      (mousedown)="onMouseDown($event)"
    >
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `,
  styles: [`
    .drag-handle {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 2px 6px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: grab;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 10;
    }

    .drag-handle:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: #6c757d;
      border-radius: 50%;
    }

    :host-context(:hover) .drag-handle {
      opacity: 1;
    }
  `]
})
export class DragHandleComponent {
  @Output() mouseDown = new EventEmitter<MouseEvent>();

  onMouseDown(event: MouseEvent) {
    // Stop propagation to prevent the component's mousedown handler from being called
    event.stopPropagation();
    this.mouseDown.emit(event);
  }
}