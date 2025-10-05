import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PropertiesPanelState {
  isOpen: boolean;
  width: number;
  activeSection: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertiesPanelService {
  private stateSubject = new BehaviorSubject<PropertiesPanelState>({
    isOpen: true,
    width: 320,
    activeSection: 'basic'
  });

  public state$ = this.stateSubject.asObservable();

  togglePanel() {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      isOpen: !currentState.isOpen
    });
  }

  setWidth(width: number) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      width: Math.max(280, Math.min(600, width)) // Ограничения по ширине
    });
  }

  setActiveSection(section: string) {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      activeSection: section
    });
  }

  getCurrentState(): PropertiesPanelState {
    return this.stateSubject.value;
  }
}