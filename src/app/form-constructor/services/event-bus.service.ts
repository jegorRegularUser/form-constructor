import { Injectable, EventEmitter } from '@angular/core';
import { DroppedComponent } from '../../core/models/component.model';
import { EVENT_NAMES } from '../constants/editor.constants';

export interface ComponentSelectedEvent {
  component: DroppedComponent;
}

export interface ComponentPropertyUpdatedEvent {
  componentId: string;
  properties: any;
}

export interface ComponentDeleteRequestedEvent {
  componentId: string;
}

export interface FormChangedEvent {
  html?: string;
  components: DroppedComponent[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  // Component events
  public readonly componentSelected = new EventEmitter<ComponentSelectedEvent>();
  public readonly componentPropertyUpdated = new EventEmitter<ComponentPropertyUpdatedEvent>();
  public readonly componentDeleteRequested = new EventEmitter<ComponentDeleteRequestedEvent>();
  
  // Form events
  public readonly formChanged = new EventEmitter<FormChangedEvent>();

  /**
   * Emit component selected event
   */
  public emitComponentSelected(component: DroppedComponent): void {
    this.componentSelected.emit({ component });
  }

  /**
   * Subscribe to component selected events
   */
  public onComponentSelected(callback: (event: ComponentSelectedEvent) => void): void {
    this.componentSelected.subscribe(callback);
  }

  /**
   * Emit component property updated event
   */
  public emitComponentPropertyUpdated(componentId: string, properties: any): void {
    this.componentPropertyUpdated.emit({ componentId, properties });
  }

  /**
   * Subscribe to component property updated events
   */
  public onComponentPropertyUpdated(callback: (event: ComponentPropertyUpdatedEvent) => void): void {
    this.componentPropertyUpdated.subscribe(callback);
  }

  /**
   * Emit component delete requested event
   */
  public emitComponentDeleteRequested(componentId: string): void {
    this.componentDeleteRequested.emit({ componentId });
  }

  /**
   * Subscribe to component delete requested events
   */
  public onComponentDeleteRequested(callback: (event: ComponentDeleteRequestedEvent) => void): void {
    this.componentDeleteRequested.subscribe(callback);
  }

  /**
   * Emit form changed event
   */
  public emitFormChanged(html?: string, components?: DroppedComponent[]): void {
    this.formChanged.emit({
      html,
      components: components || [],
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to form changed events
   */
  public onFormChanged(callback: (event: FormChangedEvent) => void): void {
    this.formChanged.subscribe(callback);
  }

  /**
   * Clean up all event subscriptions
   */
  public destroy(): void {
    this.componentSelected.complete();
    this.componentPropertyUpdated.complete();
    this.componentDeleteRequested.complete();
    this.formChanged.complete();
  }
}