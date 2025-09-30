import { TestBed } from '@angular/core/testing';
import { ElementStateService, FormState, ElementPosition } from './element-state.service';
import { EditorElement } from '../models/drag-data.model';

describe('ElementStateService', () => {
  let service: ElementStateService;
  let localStorageGetItemSpy: jasmine.Spy;
  let localStorageSetItemSpy: jasmine.Spy;
  let localStorageRemoveItemSpy: jasmine.Spy;

  beforeEach(() => {
    // Create spies for localStorage methods
    localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.callFake(() => null);
    localStorageSetItemSpy = spyOn(localStorage, 'setItem').and.callFake(() => {});
    localStorageRemoveItemSpy = spyOn(localStorage, 'removeItem').and.callFake(() => {});

    TestBed.configureTestingModule({
      providers: [ElementStateService]
    });
    service = TestBed.inject(ElementStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default state', () => {
    const currentState = service.getCurrentState();
    expect(currentState.elements).toEqual([[]]);
    expect(currentState.elementProperties).toEqual({});
    expect(currentState.elementPositions).toEqual({});
    expect(currentState.formProperties).toEqual({ id: 'default-form' });
    expect(currentState.lastSaved).toBeNull();
  });

  it('should add an element', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    service.addElement(testElement, 0, 0);
    const currentState = service.getCurrentState();

    expect(currentState.elements[0][0]).toEqual(testElement);
    expect(currentState.elementProperties[testElement.id]).toEqual(testElement);
    expect(currentState.elementPositions[testElement.id]).toEqual({
      id: testElement.id,
      rowIndex: 0,
      colIndex: 0
    });
    expect(currentState.lastSaved).not.toBeNull();
  });

  it('should remove an element', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    // Add the element first
    service.addElement(testElement, 0, 0);
    
    // Then remove it
    service.removeElement(testElement.id);
    const currentState = service.getCurrentState();

    expect(currentState.elements[0]).toEqual([]);
    expect(currentState.elementProperties[testElement.id]).toBeUndefined();
    expect(currentState.elementPositions[testElement.id]).toBeUndefined();
  });

  it('should move an element', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    // Add the element first
    service.addElement(testElement, 0, 0);
    
    // Then move it
    service.moveElement(testElement.id, 1, 0);
    const currentState = service.getCurrentState();

    expect(currentState.elements[0]).toEqual([]);
    expect(currentState.elements[1][0]).toEqual(testElement);
    expect(currentState.elementPositions[testElement.id]).toEqual({
      id: testElement.id,
      rowIndex: 1,
      colIndex: 0
    });
  });

  it('should update element properties', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    // Add the element first
    service.addElement(testElement, 0, 0);
    
    // Then update its properties
    service.updateElementProperties(testElement.id, { label: 'Updated Label' });
    const currentState = service.getCurrentState();

    expect(currentState.elementProperties[testElement.id].label).toEqual('Updated Label');
  });

  it('should update form properties', () => {
    service.updateFormProperties({ title: 'Test Form' });
    const currentState = service.getCurrentState();

    expect(currentState.formProperties.title).toEqual('Test Form');
  });

  it('should save state to localStorage', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    service.addElement(testElement, 0, 0);

    expect(localStorageSetItemSpy).toHaveBeenCalled();
    const savedState = JSON.parse(localStorageSetItemSpy.calls.mostRecent().args[1] as string);
    expect(savedState.elements[0][0]).toEqual(testElement);
  });

  it('should load state from localStorage', () => {
    const testState: FormState = {
      elements: [[{
        id: 'test-element-1',
        type: 'input',
        label: 'Test Input',
        placeholder: 'Enter text...'
      }]],
      elementProperties: {
        'test-element-1': {
          id: 'test-element-1',
          type: 'input',
          label: 'Test Input',
          placeholder: 'Enter text...'
        }
      },
      elementPositions: {
        'test-element-1': {
          id: 'test-element-1',
          rowIndex: 0,
          colIndex: 0
        }
      },
      formProperties: { id: 'test-form' },
      lastSaved: new Date()
    };

    localStorageGetItemSpy.and.returnValue(JSON.stringify(testState));

    // Create a new instance to test loading from localStorage
    const newService = TestBed.inject(ElementStateService);
    const currentState = newService.getCurrentState();

    expect(currentState.elements[0][0]).toEqual(testState.elements[0][0]);
    expect(currentState.elementProperties['test-element-1']).toEqual(testState.elementProperties['test-element-1']);
    expect(currentState.formProperties.id).toEqual('test-form');
  });

  it('should clear state', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    service.addElement(testElement, 0, 0);
    service.clearState();
    const currentState = service.getCurrentState();

    expect(currentState.elements).toEqual([[]]);
    expect(currentState.elementProperties).toEqual({});
    expect(currentState.elementPositions).toEqual({});
    expect(currentState.formProperties).toEqual({ id: 'default-form' });
    expect(currentState.lastSaved).toBeNull();
    expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('formConstructorState');
  });

  it('should export state as JSON', () => {
    const testElement: EditorElement = {
      id: 'test-element-1',
      type: 'input',
      label: 'Test Input',
      placeholder: 'Enter text...'
    };

    service.addElement(testElement, 0, 0);
    const jsonState = service.exportStateAsJson();
    const parsedState = JSON.parse(jsonState);

    expect(parsedState.elements[0][0]).toEqual(testElement);
  });

  it('should import state from JSON', () => {
    const testState: FormState = {
      elements: [[{
        id: 'test-element-1',
        type: 'input',
        label: 'Test Input',
        placeholder: 'Enter text...'
      }]],
      elementProperties: {
        'test-element-1': {
          id: 'test-element-1',
          type: 'input',
          label: 'Test Input',
          placeholder: 'Enter text...'
        }
      },
      elementPositions: {
        'test-element-1': {
          id: 'test-element-1',
          rowIndex: 0,
          colIndex: 0
        }
      },
      formProperties: { id: 'test-form' },
      lastSaved: new Date()
    };

    const result = service.importStateFromJson(JSON.stringify(testState));
    const currentState = service.getCurrentState();

    expect(result).toBeTrue();
    expect(currentState.elements[0][0]).toEqual(testState.elements[0][0]);
    expect(currentState.elementProperties['test-element-1']).toEqual(testState.elementProperties['test-element-1']);
    expect(currentState.formProperties.id).toEqual('test-form');
  });

  it('should handle invalid JSON when importing state', () => {
    const result = service.importStateFromJson('invalid json');
    expect(result).toBeFalse();
  });
});