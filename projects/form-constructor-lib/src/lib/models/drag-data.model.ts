// Базовый интерфейс для всех элементов редактора
export interface BaseEditorElement {
  id: string;
  type: string;
  customProperties?: Record<string, any>;
}

// Конкретные типы элементов
export interface InputElement extends BaseEditorElement {
  type: 'input';
  value: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

export interface TextareaElement extends BaseEditorElement {
  type: 'textarea';
  value: string;
  rows?: number;
  placeholder?: string;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

export interface SelectElement extends BaseEditorElement {
  type: 'select';
  value: string | string[];
  options?: any[];
  multiple?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

// Объединенный тип для всех возможных элементов
export type EditorElement = InputElement | TextareaElement | SelectElement | (BaseEditorElement & { [key: string]: any });

// Обновленный DragData для поддержки разных типов
export interface DragData {
  type: 'input' | 'textarea' | 'select' | 'button' | 'existing' | 'element';
  elementType?: string; // Конкретный тип элемента при создании нового
  id?: string;
  rowIndex?: number;
  colIndex?: number;
  elementDefinition?: any; // Definition of the element being dragged
}

export interface DropPosition {
  x: number;
  y: number;
  insertBefore?: boolean;
  targetId?: string;
  targetRowIndex?: number;
  orientation?: 'horizontal' | 'vertical';
}