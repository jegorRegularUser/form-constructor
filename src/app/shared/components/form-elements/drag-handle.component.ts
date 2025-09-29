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
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 2px 4px;
      background: #ffffff;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      cursor: grab;
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .drag-handle:hover {
      background: #fafafa;
      border-color: #40a9ff;
    }

    .drag-handle:active {
      cursor: grabbing;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .dot {
      width: 3px;
      height: 3px;
      background: #8c8c8c;
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