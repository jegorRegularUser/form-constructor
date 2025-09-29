// Import unified models from the core models
import type {
  DroppedComponent,
  DropZoneState,
  FormComponentDefinition,
  ComponentProperties
} from '../core/models/component.model';

// Re-export for backward compatibility
export type {
  DroppedComponent,
  DropZoneState
};

// Type alias for backward compatibility
export type FormComponent = FormComponentDefinition;

// New interfaces from test components
export interface DragData {
  type: 'input' | 'existing' | 'text-input' | 'email-input' | 'textarea' | 'select' | 'checkbox' | 'button' | 'container';
  id?: string;
  rowIndex?: number;
  colIndex?: number;
  elementType?: string;
}

export interface DropPosition {
  x: number;
  y: number;
  insertBefore?: boolean;
  targetId?: string;
  targetRowIndex?: number;
  orientation?: 'horizontal' | 'vertical';
}

// Базовый интерфейс для всех элементов редактора
export interface BaseEditorElement {
  id: string;
  type: string;
  value: any;
}

export interface InputElement extends BaseEditorElement {
  type: 'input' | 'text-input' | 'email-input';
  value: string;
}

export interface ButtonElement extends BaseEditorElement {
  type: 'button';
  text: string;
  color?: string;
}

export interface TextElement extends BaseEditorElement {
  type: 'text';
  content: string;
  size?: string;
}

export interface ImageElement extends BaseEditorElement {
  type: 'image';
  src: string;
  alt?: string;
}

// Объединенный тип для всех возможных элементов
export type EditorElement = InputElement | ButtonElement | TextElement | ImageElement | BaseEditorElement;

// Базовый интерфейс для всех компонентов редактора
export interface BaseEditorComponent {
  id: string;
  getNativeElement(): HTMLElement;
  isDragged: boolean;
}

// Additional interfaces from test components
export interface DndState {
  type: 'idle' | 'dragging' | 'dropping';
}

export interface DropTarget {
  containerId: string;
  layout: 'row' | 'column';
  position: {
    index: number;
    rect?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
}