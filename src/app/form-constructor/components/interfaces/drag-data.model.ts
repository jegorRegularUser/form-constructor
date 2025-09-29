// Базовый интерфейс для всех элементов редактора
export interface BaseEditorElement {
  id: string;
  type: string;
}

// Конкретные типы элементов
export interface InputElement extends BaseEditorElement {
  type: 'input';
  value: string;
}

export interface TextareaElement extends BaseEditorElement {
  type: 'textarea';
  value: string;
  rows?: number;
  placeholder?: string;
}

// Объединенный тип для всех возможных элементов
export type EditorElement = InputElement | TextareaElement;

// Обновленный DragData для поддержки разных типов
export interface DragData {
  type: 'input' | 'textarea' | 'existing';
  elementType?: string; // Конкретный тип элемента при создании нового
  id?: string;
  rowIndex?: number;
  colIndex?: number;
}

export interface DropPosition {
  x: number;
  y: number;
  insertBefore?: boolean;
  targetId?: string;
  targetRowIndex?: number;
  orientation?: 'horizontal' | 'vertical';
}