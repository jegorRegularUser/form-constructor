import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DragData, DropPosition } from '../models/drag-data.model';

@Injectable({
  providedIn: 'root'
})
export class DragStateService {
  private dragDataSubject = new BehaviorSubject<DragData | null>(null);
  private dropPositionSubject = new BehaviorSubject<DropPosition | null>(null);
  private dragEndSubject = new Subject<void>();

  dragData$ = this.dragDataSubject.asObservable();
  dropPosition$ = this.dropPositionSubject.asObservable();
  dragEnd$ = this.dragEndSubject.asObservable();

  setDragData(data: DragData) {
    this.dragDataSubject.next(data);
  }

  clearDragData() {
    this.dragDataSubject.next(null);
  }

  setDropPosition(position: DropPosition | null) {
    this.dropPositionSubject.next(position);
  }

  notifyDragEnd() {
    this.dragEndSubject.next();
  }

  getCurrentDragData(): DragData | null {
    return this.dragDataSubject.value;
  }
}