import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormElementProperties } from '../../models/element-properties.model';

@Injectable({
  providedIn: 'root'
})
export class ElementSelectionService {
  private selectedElementSubject = new BehaviorSubject<FormElementProperties | null>(null);
  private selectionChangeSubject = new Subject<{ previous: FormElementProperties | null, current: FormElementProperties | null }>();
  
  selectedElement$ = this.selectedElementSubject.asObservable();
  selectionChange$ = this.selectionChangeSubject.asObservable();
  
  selectElement(element: FormElementProperties | null) {
    const previousElement = this.selectedElementSubject.value;
    this.selectedElementSubject.next(element);
    this.selectionChangeSubject.next({ previous: previousElement, current: element });
  }
  
  deselectElement() {
    const previousElement = this.selectedElementSubject.value;
    if (previousElement !== null) {
      this.selectedElementSubject.next(null);
      this.selectionChangeSubject.next({ previous: previousElement, current: null });
    }
  }
  
  toggleElementSelection(element: FormElementProperties) {
    if (this.isElementSelected(element.id)) {
      this.deselectElement();
    } else {
      this.selectElement(element);
    }
  }
  
  getSelectedElement(): FormElementProperties | null {
    return this.selectedElementSubject.value;
  }
  
  getSelectedElementId(): string | null {
    return this.selectedElementSubject.value?.id || null;
  }
  
  getSelectedElementType(): string | null {
    return this.selectedElementSubject.value?.type || null;
  }
  
  isElementSelected(elementId: string): boolean {
    return this.selectedElementSubject.value?.id === elementId;
  }
  
  hasSelection(): boolean {
    return this.selectedElementSubject.value !== null;
  }
  
  getSelectionChanges(): Observable<FormElementProperties | null> {
    return this.selectedElement$;
  }
  
  getDetailedSelectionChanges(): Observable<{ previous: FormElementProperties | null, current: FormElementProperties | null }> {
    return this.selectionChange$;
  }
}