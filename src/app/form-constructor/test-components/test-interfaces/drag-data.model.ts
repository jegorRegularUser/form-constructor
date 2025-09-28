export interface DragData {
  type: 'input' | 'existing';
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
// Базовый интерфейс для всех элементов редактора
export interface BaseEditorElement {
  id: string;
  type: string;
  value: any;
}

export interface InputElement extends BaseEditorElement {
  type: 'input';
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