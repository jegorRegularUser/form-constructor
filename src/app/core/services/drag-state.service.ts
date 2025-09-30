import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DragData, DropPosition } from '../models/drag-data.model';
import { FormElementProperties } from '../models/element-properties.model';
import { ElementSelectionService } from './element-selection.service';

@Injectable({
  providedIn: 'root'
})
export class DragStateService {
  private dragDataSubject = new BehaviorSubject<DragData | null>(null);
  private dropPositionSubject = new BehaviorSubject<DropPosition | null>(null);
  private dragEndSubject = new Subject<void>();
  private dragStartSubject = new Subject<void>();
  private selectedElementBeforeDrag: FormElementProperties | null = null;

  dragData$ = this.dragDataSubject.asObservable();
  dropPosition$ = this.dropPositionSubject.asObservable();
  dragEnd$ = this.dragEndSubject.asObservable();
  dragStart$ = this.dragStartSubject.asObservable();

  constructor(private elementSelectionService: ElementSelectionService) {}

  setDragData(data: DragData) {
    // Only set drag data if we're not already dragging to prevent duplicate events
    if (this.dragDataSubject.value) {
      return;
    }
    
    this.dragDataSubject.next(data);
    
    // Store the currently selected element before drag starts
    this.selectedElementBeforeDrag = this.elementSelectionService.getSelectedElement();
    
    // If dragging an existing element, select it
    if (data.type === 'existing' && data.id) {
      // We'll let the editor component handle the selection
      // as it has access to the actual element data
    }
    
    this.dragStartSubject.next();
  }

  clearDragData() {
    // Only clear if we have drag data to prevent unnecessary state updates
    if (this.dragDataSubject.value) {
      this.dragDataSubject.next(null);
    }
  }

  setDropPosition(position: DropPosition | null) {
    // Only update if the position has actually changed to prevent unnecessary state updates
    const currentPosition = this.dropPositionSubject.value;
    if (!this.positionsEqual(currentPosition, position)) {
      this.dropPositionSubject.next(position);
    }
  }

  notifyDragEnd() {
    // Only notify if we're actually dragging to prevent duplicate events
    if (!this.dragDataSubject.value) {
      return;
    }
    
    // Restore selection if needed
    if (this.selectedElementBeforeDrag) {
      // If we were dragging an existing element, keep it selected
      const currentDragData = this.dragDataSubject.value;
      if (currentDragData && currentDragData.type === 'existing' && currentDragData.id) {
        // The element is already selected by the editor component
      } else {
        // Restore the previous selection
        this.elementSelectionService.selectElement(this.selectedElementBeforeDrag);
      }
    }
    
    this.dragEndSubject.next();
    this.selectedElementBeforeDrag = null;
  }

  getCurrentDragData(): DragData | null {
    return this.dragDataSubject.value;
  }

  isDragging(): boolean {
    return this.dragDataSubject.value !== null;
  }

  getDraggedElementId(): string | null {
    return this.dragDataSubject.value?.id || null;
  }

  /**
   * Helper method to compare two drop positions
   */
  private positionsEqual(pos1: DropPosition | null, pos2: DropPosition | null): boolean {
    if (pos1 === null && pos2 === null) return true;
    if (pos1 === null || pos2 === null) return false;
    
    return (
      pos1.x === pos2.x &&
      pos1.y === pos2.y &&
      pos1.insertBefore === pos2.insertBefore &&
      pos1.targetId === pos2.targetId &&
      pos1.targetRowIndex === pos2.targetRowIndex &&
      pos1.orientation === pos2.orientation
    );
  }
}