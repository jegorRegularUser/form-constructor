import { Injectable, signal, computed } from '@angular/core';
import { DroppedComponent, ComponentType, ComponentProperties } from '../../core/models/component.model';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppState {
  components: DroppedComponent[];
  selectedComponentId: string | null;
  selectedContainerId: string | null;
  isDragging: boolean;
  isCanvasHovered: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {
  // Private state
  private readonly _state = signal<AppState>({
    components: [],
    selectedComponentId: null,
    selectedContainerId: null,
    isDragging: false,
    isCanvasHovered: false,
  });

  // Public observables for components that need to react to state changes
  private readonly _stateSubject = new BehaviorSubject<AppState>(this._state());
  public readonly state$ = this._stateSubject.asObservable();

  // Computed signals for derived state
  public readonly components = computed(() => this._state().components);
  public readonly selectedComponentId = computed(() => this._state().selectedComponentId);
  public readonly selectedContainerId = computed(() => this._state().selectedContainerId);
  public readonly isDragging = computed(() => this._state().isDragging);
  public readonly isCanvasHovered = computed(() => this._state().isCanvasHovered);
  
  public readonly hasComponents = computed(() => this._state().components.length > 0);
  public readonly selectedComponent = computed(() => {
    const selectedId = this.selectedComponentId();
    if (!selectedId) return null;
    return this.findComponentById(selectedId, this.components());
  });

  /**
   * Get current state
   */
  public getState(): AppState {
    return this._state();
  }

  /**
   * Update state partially
   */
  public updateState(updates: Partial<AppState>): void {
    const currentState = this._state();
    const newState = { ...currentState, ...updates };
    
    console.log('🔄 StateManagementService.updateState called');
    console.log('📋 Current components count:', currentState.components.length);
    console.log('📋 New components count:', newState.components.length);
    console.log('📝 Updates:', updates);
    
    this._state.set(newState);
    this._stateSubject.next(newState);
    
    console.log('✅ State updated successfully');
  }

  /**
   * Add a component to the state
   */
  public addComponent(component: DroppedComponent, parentId?: string | null): void {
    const currentComponents = this.components();
    
    if (parentId) {
      // Add component to a specific parent
      const updatedComponents = this.insertComponent(currentComponents, component, parentId);
      this.updateState({ components: updatedComponents });
    } else {
      // Add component to root
      this.updateState({ components: [...currentComponents, component] });
    }
  }

  /**
   * Remove a component from the state
   */
  public removeComponent(componentId: string): void {
    const currentComponents = this.components();
    const updatedComponents = this.filterComponents(currentComponents, componentId);
    
    let selectedComponentId = this.selectedComponentId();
    let selectedContainerId = this.selectedContainerId();
    
    // Clear selection if the selected component is being removed
    if (selectedComponentId === componentId) {
      selectedComponentId = null;
    }
    
    if (selectedContainerId === componentId) {
      selectedContainerId = null;
    }
    
    this.updateState({ 
      components: updatedComponents,
      selectedComponentId,
      selectedContainerId
    });
  }

  /**
   * Update component properties
   */
  public updateComponent(componentId: string, properties: Partial<DroppedComponent>): void {
    const currentComponents = this.components();
    const updatedComponents = this.updateComponentProperties(currentComponents, componentId, properties);
    
    this.updateState({ components: updatedComponents });
  }

  /**
   * Select a component
   */
  public selectComponent(componentId: string | null): void {
    const component = componentId ? this.findComponentById(componentId, this.components()) : null;
    
    this.updateState({
      selectedComponentId: componentId,
      selectedContainerId: component?.type === 'container' ? componentId : null
    });
  }

  /**
   * Set dragging state
   */
  public setDragging(isDragging: boolean): void {
    this.updateState({ isDragging });
  }

  /**
   * Set canvas hover state
   */
  public setCanvasHovered(isCanvasHovered: boolean): void {
    this.updateState({ isCanvasHovered });
  }

  /**
   * Clear all components
   */
  public clearComponents(): void {
    this.updateState({
      components: [],
      selectedComponentId: null,
      selectedContainerId: null
    });
  }

  /**
   * Get component by ID
   */
  public getComponentById(componentId: string): DroppedComponent | null {
    return this.findComponentById(componentId, this.components());
  }

  /**
   * Get all container IDs
   */
  public getAllContainerIds(): string[] {
    const containerIds: string[] = [];
    
    const findContainers = (components: DroppedComponent[]) => {
      components.forEach(comp => {
        if (comp.type === 'container') {
          containerIds.push(`container-${comp.id}`);
          if (comp.children) {
            findContainers(comp.children);
          }
        }
      });
    };
    
    findContainers(this.components());
    return containerIds;
  }

  /**
   * Recursively find a component by ID
   */
  private findComponentById(id: string, components: DroppedComponent[]): DroppedComponent | null {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = this.findComponentById(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Insert component into a specific parent
   */
  private insertComponent(components: DroppedComponent[], newComponent: DroppedComponent, parentId: string): DroppedComponent[] {
    return components.map(component => {
      if (component.id === parentId) {
        return {
          ...component,
          children: [...(component.children || []), newComponent]
        };
      }
      if (component.children) {
        return {
          ...component,
          children: this.insertComponent(component.children, newComponent, parentId)
        };
      }
      return component;
    });
  }

  /**
   * Filter out a component by ID
   */
  private filterComponents(components: DroppedComponent[], componentId: string): DroppedComponent[] {
    return components.filter(component => {
      if (component.id === componentId) return false;
      if (component.children) {
        component.children = this.filterComponents(component.children, componentId);
      }
      return true;
    });
  }

  /**
   * Update component properties recursively
   */
  private updateComponentProperties(
    components: DroppedComponent[], 
    componentId: string, 
    properties: Partial<DroppedComponent>
  ): DroppedComponent[] {
    return components.map(component => {
      if (component.id === componentId) {
        return { 
          ...component, 
          ...properties,
          properties: { ...component.properties, ...properties.properties }
        };
      }
      if (component.children) {
        return {
          ...component,
          children: this.updateComponentProperties(component.children, componentId, properties)
        };
      }
      return component;
    });
  }
}