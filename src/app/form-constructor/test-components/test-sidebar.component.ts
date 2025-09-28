import { Component } from '@angular/core';
import { DragStateService } from './test-services/drag-state.service';

@Component({
  selector: 'test-sidebar',
  template: `
    <div class="sidebar">
      <h3>Components</h3>
      <div 
        class="draggable-input"
        (mousedown)="onDragStart($event)"
        [class.dragging]="isDragging"
      >
        input
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 200px;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 16px;
      height: 100%;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #495057;
      font-size: 14px;
      font-weight: 600;
    }

    .draggable-input {
      width: 120px;
      height: 40px;
      background: #e9ecef;
      border: 2px solid #ced4da;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      font-weight: 500;
      color: #495057;
      transition: all 0.2s ease;
      user-select: none;
    }

    .draggable-input:hover {
      background: #dee2e6;
      border-color: #adb5bd;
    }

    .draggable-input.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
  `]
})
export class TestSidebarComponent {
  isDragging = false;

  constructor(private dragStateService: DragStateService) {}

  onDragStart(event: MouseEvent) {
    this.isDragging = true;
    
    this.dragStateService.setDragData({
      type: 'input'
    });

    const dragImage = (event.target as HTMLElement).cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);

    const moveListener = (e: MouseEvent) => {
      dragImage.style.left = e.clientX + 10 + 'px';
      dragImage.style.top = e.clientY + 10 + 'px';
    };

    const upListener = () => {
      this.isDragging = false;
      this.dragStateService.clearDragData();
      this.dragStateService.notifyDragEnd();
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.body.removeChild(dragImage);
    };

    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);

    event.preventDefault();
  }
}