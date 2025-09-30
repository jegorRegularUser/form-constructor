import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormElementProperties } from '../models/element-properties.model';
import { EditorElement } from '../models/drag-data.model';

export interface ElementPosition {
  id: string;
  rowIndex: number;
  colIndex: number;
}

export interface FormState {
  elements: EditorElement[][];
  elementProperties: Record<string, any>;
  elementPositions: Record<string, ElementPosition>;
  formProperties: any;
  lastSaved: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class ElementStateService {
  private formStateSubject = new BehaviorSubject<FormState>({
    elements: [],
    elementProperties: {},
    elementPositions: {},
    formProperties: { id: 'default-form' },
    lastSaved: null
  });

  formState$ = this.formStateSubject.asObservable();

  constructor() {
    // Load saved state from localStorage on initialization
    this.loadStateFromStorage();
  }

  /**
   * Get the current form state
   */
  getCurrentState(): FormState {
    return { ...this.formStateSubject.value };
  }

  /**
   * Get the current form state as an observable
   */
  getState$(): Observable<FormState> {
    return this.formState$;
  }

  /**
   * Update the entire form state
   */
  updateState(newState: FormState): void {
    // Only update if the state has actually changed to prevent unnecessary updates
    const currentState = this.formStateSubject.value;
    if (!this.statesEqual(currentState, newState)) {
      this.formStateSubject.next(newState);
      this.saveStateToStorage(newState);
    }
  }

  /**
   * Update the elements structure
   */
  updateElements(elements: EditorElement[][]): void {
    const currentState = this.getCurrentState();
    
    // Check if elements structure has actually changed
    if (this.elementsStructuresEqual(currentState.elements, elements)) {
      return; // No need to update
    }
    
    const newState: FormState = {
      ...currentState,
      elements,
      lastSaved: new Date()
    };
    
    // Update positions based on the new structure
    this.updateElementPositions(elements, newState);
    
    this.updateState(newState);
  }

  /**
   * Update element properties
   */
  updateElementProperties(elementId: string, properties: Partial<FormElementProperties>): void {
    const currentState = this.getCurrentState();
    const currentProperties = currentState.elementProperties[elementId] || {};
    
    // Check if properties have actually changed
    let hasChanged = false;
    for (const key in properties) {
      if (properties[key as keyof FormElementProperties] !== currentProperties[key as keyof FormElementProperties]) {
        hasChanged = true;
        break;
      }
    }
    
    if (!hasChanged) return;
    
    // Update the element in the elements array as well
    const newElements = [...currentState.elements];
    for (let i = 0; i < newElements.length; i++) {
      for (let j = 0; j < newElements[i].length; j++) {
        if (newElements[i][j].id === elementId) {
          newElements[i][j] = { ...newElements[i][j], ...properties };
          break;
        }
      }
    }
    
    const newState: FormState = {
      ...currentState,
      elements: newElements,
      elementProperties: {
        ...currentState.elementProperties,
        [elementId]: {
          ...currentProperties,
          ...properties
        }
      },
      lastSaved: new Date()
    };
    
    this.updateState(newState);
  }

  /**
   * Update element position
   */
  updateElementPosition(elementId: string, rowIndex: number, colIndex: number): void {
    const currentState = this.getCurrentState();
    const newState: FormState = {
      ...currentState,
      elementPositions: {
        ...currentState.elementPositions,
        [elementId]: {
          id: elementId,
          rowIndex,
          colIndex
        }
      },
      lastSaved: new Date()
    };
    
    this.updateState(newState);
  }

  /**
   * Add a new element
   */
  addElement(element: EditorElement, rowIndex: number, colIndex: number): void {
    const currentState = this.getCurrentState();
    
    // Check if element already exists to prevent duplication
    for (let i = 0; i < currentState.elements.length; i++) {
      for (let j = 0; j < currentState.elements[i].length; j++) {
        if (currentState.elements[i][j].id === element.id) {
          // Element already exists, just update its position if needed
          if (i !== rowIndex || j !== colIndex) {
            this.moveElement(element.id, rowIndex, colIndex);
          }
          return;
        }
      }
    }
    
    const newElements = [...currentState.elements];
    
    // If elements array is empty, initialize with empty arrays up to rowIndex
    if (newElements.length === 0) {
      for (let i = 0; i <= rowIndex; i++) {
        newElements[i] = [];
      }
    }
    
    // Ensure the row exists
    while (newElements.length <= rowIndex) {
      newElements.push([]);
    }
    
    // Add the element to the specified position
    newElements[rowIndex].splice(colIndex, 0, element);
    
    const newState: FormState = {
      ...currentState,
      elements: newElements,
      lastSaved: new Date()
    };
    
    // Update positions
    this.updateElementPositions(newElements, newState);
    
    // Initialize element properties
    newState.elementProperties[element.id] = { ...element };
    
    this.updateState(newState);
  }

  /**
   * Remove an element
   */
  removeElement(elementId: string): void {
    const currentState = this.getCurrentState();
    const newElements = [...currentState.elements];
    
    // Find and remove the element
    for (let i = 0; i < newElements.length; i++) {
      const index = newElements[i].findIndex(el => el.id === elementId);
      if (index !== -1) {
        newElements[i].splice(index, 1);
        
        // Remove the row if it's empty
        if (newElements[i].length === 0) {
          newElements.splice(i, 1);
        }
        break;
      }
    }
    
    // Remove element properties and positions
    const { [elementId]: removedProperties, ...remainingProperties } = currentState.elementProperties;
    const { [elementId]: removedPosition, ...remainingPositions } = currentState.elementPositions;
    
    const newState: FormState = {
      ...currentState,
      elements: newElements,
      elementProperties: remainingProperties,
      elementPositions: remainingPositions,
      lastSaved: new Date()
    };
    
    // Update positions
    this.updateElementPositions(newElements, newState);
    
    this.updateState(newState);
  }

  /**
   * Move an element
   */
  moveElement(elementId: string, newRowIndex: number, newColIndex: number): void {
    const currentState = this.getCurrentState();
    const newElements = [...currentState.elements];
    
    // Find the element's current position
    let currentRowIndex = -1;
    let currentColIndex = -1;
    let elementToMove: EditorElement | null = null;
    
    for (let i = 0; i < newElements.length; i++) {
      const index = newElements[i].findIndex(el => el.id === elementId);
      if (index !== -1) {
        currentRowIndex = i;
        currentColIndex = index;
        elementToMove = newElements[i][index];
        break;
      }
    }
    
    if (!elementToMove) return;
    
    // Check if the element is already at the target position
    if (currentRowIndex === newRowIndex && currentColIndex === newColIndex) {
      return; // No need to move
    }
    
    // Remove the element from its current position
    newElements[currentRowIndex].splice(currentColIndex, 1);
    
    // Remove the row if it's empty
    if (newElements[currentRowIndex].length === 0) {
      newElements.splice(currentRowIndex, 1);
      // Adjust the new row index if necessary
      if (newRowIndex > currentRowIndex) {
        newRowIndex--;
      }
    }
    
    // Ensure the target row exists
    if (!newElements[newRowIndex]) {
      newElements[newRowIndex] = [];
    }
    
    // Add the element to the new position
    newElements[newRowIndex].splice(newColIndex, 0, elementToMove);
    
    const newState: FormState = {
      ...currentState,
      elements: newElements,
      lastSaved: new Date()
    };
    
    // Update positions
    this.updateElementPositions(newElements, newState);
    
    this.updateState(newState);
  }

  /**
   * Update form properties
   */
  updateFormProperties(properties: any): void {
    const currentState = this.getCurrentState();
    const newState: FormState = {
      ...currentState,
      formProperties: {
        ...currentState.formProperties,
        ...properties
      },
      lastSaved: new Date()
    };
    
    this.updateState(newState);
  }

  /**
   * Save the current state to localStorage
   */
  saveStateToStorage(state: FormState = this.getCurrentState()): void {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('formConstructorState', serializedState);
    } catch (error) {
      console.error('Failed to save form state to localStorage:', error);
    }
  }

  /**
   * Load the state from localStorage
   */
  loadStateFromStorage(): void {
    try {
      const serializedState = localStorage.getItem('formConstructorState');
      if (serializedState) {
        const state = JSON.parse(serializedState);
        this.formStateSubject.next(state);
      }
    } catch (error) {
      console.error('Failed to load form state from localStorage:', error);
    }
  }

  /**
   * Clear the saved state from localStorage and reset to initial state
   */
  clearState(): void {
    try {
      localStorage.removeItem('formConstructorState');
      this.formStateSubject.next({
        elements: [[]],
        elementProperties: {},
        elementPositions: {},
        formProperties: { id: 'default-form' },
        lastSaved: null
      });
    } catch (error) {
      console.error('Failed to clear form state:', error);
    }
  }

  /**
   * Export the current state as JSON
   */
  exportStateAsJson(): string {
    return JSON.stringify(this.getCurrentState(), null, 2);
  }

  /**
   * Import state from JSON
   */
  importStateFromJson(jsonString: string): boolean {
    try {
      const state = JSON.parse(jsonString);
      this.updateState(state);
      return true;
    } catch (error) {
      console.error('Failed to import form state from JSON:', error);
      return false;
    }
  }

  /**
   * Update element positions based on the current elements structure
   */
  private updateElementPositions(elements: EditorElement[][], state: FormState): void {
    const newPositions: Record<string, ElementPosition> = {};
    
    for (let rowIndex = 0; rowIndex < elements.length; rowIndex++) {
      for (let colIndex = 0; colIndex < elements[rowIndex].length; colIndex++) {
        const element = elements[rowIndex][colIndex];
        newPositions[element.id] = {
          id: element.id,
          rowIndex,
          colIndex
        };
      }
    }
    
    state.elementPositions = newPositions;
  }

  /**
   * Helper method to compare two element structures
   */
  private elementsStructuresEqual(elements1: EditorElement[][], elements2: EditorElement[][]): boolean {
    if (elements1.length !== elements2.length) return false;
    
    for (let i = 0; i < elements1.length; i++) {
      if (elements1[i].length !== elements2[i].length) return false;
      
      for (let j = 0; j < elements1[i].length; j++) {
        if (elements1[i][j].id !== elements2[i][j].id) return false;
      }
    }
    
    return true;
  }

  /**
   * Helper method to compare two form states
   */
  private statesEqual(state1: FormState, state2: FormState): boolean {
    // Compare elements structure
    if (state1.elements.length !== state2.elements.length) return false;
    
    for (let i = 0; i < state1.elements.length; i++) {
      if (state1.elements[i].length !== state2.elements[i].length) return false;
      
      for (let j = 0; j < state1.elements[i].length; j++) {
        if (state1.elements[i][j].id !== state2.elements[i][j].id) return false;
      }
    }
    
    // Compare element properties
    const props1Keys = Object.keys(state1.elementProperties);
    const props2Keys = Object.keys(state2.elementProperties);
    
    if (props1Keys.length !== props2Keys.length) return false;
    
    for (const key of props1Keys) {
      if (!state2.elementProperties[key]) return false;
      
      const props1 = state1.elementProperties[key];
      const props2 = state2.elementProperties[key];
      
      const props1KeysInner = Object.keys(props1);
      const props2KeysInner = Object.keys(props2);
      
      if (props1KeysInner.length !== props2KeysInner.length) return false;
      
      for (const innerKey of props1KeysInner) {
        if (props1[innerKey] !== props2[innerKey]) return false;
      }
    }
    
    // Compare element positions
    const pos1Keys = Object.keys(state1.elementPositions);
    const pos2Keys = Object.keys(state2.elementPositions);
    
    if (pos1Keys.length !== pos2Keys.length) return false;
    
    for (const key of pos1Keys) {
      if (!state2.elementPositions[key]) return false;
      
      const pos1 = state1.elementPositions[key];
      const pos2 = state2.elementPositions[key];
      
      if (pos1.rowIndex !== pos2.rowIndex || pos1.colIndex !== pos2.colIndex) return false;
    }
    
    // Compare form properties
    const formProps1Keys = Object.keys(state1.formProperties);
    const formProps2Keys = Object.keys(state2.formProperties);
    
    if (formProps1Keys.length !== formProps2Keys.length) return false;
    
    for (const key of formProps1Keys) {
      if (state1.formProperties[key] !== state2.formProperties[key]) return false;
    }
    
    return true;
  }
}