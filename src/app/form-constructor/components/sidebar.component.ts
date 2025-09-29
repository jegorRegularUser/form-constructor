import { Component } from '@angular/core';
import { DragStateService } from './services/drag-state.service';
import { DragData } from './interfaces/drag-data.model';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar">
      <h3>Components</h3>
      <div
        class="draggable-item draggable-input"
        (mousedown)="onDragStart($event, 'input')"
        [class.dragging]="isDragging && currentDragType === 'input'"
      >
        input
      </div>
      <div
        class="draggable-item draggable-textarea"
        (mousedown)="onDragStart($event, 'textarea')"
        [class.dragging]="isDragging && currentDragType === 'textarea'"
      >
        textarea
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

    .draggable-item {
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
      margin-bottom: 10px;
    }

    .draggable-item:hover {
      background: #dee2e6;
      border-color: #adb5bd;
    }

    .draggable-item.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
  `]
})
export class SidebarComponent {
  isDragging = false;
  currentDragType: 'input' | 'textarea' | null = null;

  constructor(private dragStateService: DragStateService) {}

  onDragStart(event: MouseEvent, type: 'input' | 'textarea') {
    this.isDragging = true;
    this.currentDragType = type;
    
    const dragData: DragData = {
      type: type,
      elementType: type
    };
    
    this.dragStateService.setDragData(dragData);

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
      this.currentDragType = null;
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