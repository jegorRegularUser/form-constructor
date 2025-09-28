import { Injectable, signal } from '@angular/core';
import { DroppedComponent, FormComponentDefinition } from '../core/models/component.model';
import { StateManagementService } from '../form-constructor/services/state-management.service';
import { DragDropService } from '../form-constructor/services/drag-drop.service';
import { EventBusService } from '../form-constructor/services/event-bus.service';
import { HtmlGenerationService } from '../form-constructor/services/html-generation.service';
import { COMPONENT_TYPES, DEFAULT_PROPERTIES } from '../form-constructor/constants/editor.constants';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  // Доступные компоненты для перетаскивания
  public availableComponents: FormComponentDefinition[] = [
    {
      type: COMPONENT_TYPES.TEXT_INPUT,
      label: 'Текстовое поле',
      icon: '📝',
      defaultProperties: { label: 'Текст', placeholder: 'Введите текст' }
    },
    {
      type: COMPONENT_TYPES.TEXTAREA,
      label: 'Текстовая область',
      icon: '📄',
      defaultProperties: { label: 'Текстовая область', rows: 4 }
    },
    {
      type: COMPONENT_TYPES.SELECT,
      label: 'Выпадающий список',
      icon: '🔽',
      defaultProperties: { label: 'Выберите вариант', options: ['Вариант 1', 'Вариант 2'] }
    },
    {
      type: COMPONENT_TYPES.CHECKBOX,
      label: 'Чекбокс',
      icon: '☑️',
      defaultProperties: { label: 'Чекбокс', checked: false }
    },
    {
      type: COMPONENT_TYPES.BUTTON,
      label: 'Кнопка',
      icon: '🔘',
      defaultProperties: { label: 'Кнопка', type: 'button' }
    }
  ];

  constructor(
    private stateManagementService: StateManagementService,
    private dragDropService: DragDropService,
    private eventBusService: EventBusService,
    private htmlGenerationService: HtmlGenerationService
  ) {}

  // Геттеры
  getDroppedComponents() {
    return this.stateManagementService.components;
  }

  // Делегаты для StateManagementService
  get selectedComponentId() {
    return this.stateManagementService.selectedComponentId;
  }

  // Делегаты для DragDropService
  get isDragging() {
    return this.dragDropService.isDragging;
  }

  get dragSource() {
    return this.dragDropService.dragSource;
  }

  get currentDragComponent() {
    return this.dragDropService.currentDragComponent;
  }

  get dragGhost() {
    return this.dragDropService.dragGhost;
  }

  get isCanvasHovered() {
    return this.dragDropService.isCanvasHovered;
  }

  get canvasDropZone() {
    return this.dragDropService.canvasDropZone;
  }

  get dropZones() {
    return this.dragDropService.dropZones;
  }

  get hoverStates() {
    return this.dragDropService.hoverStates;
  }

  // Setter методы для делегирования
  setDragSource(value: 'sidebar' | 'canvas') {
    this.dragDropService.dragSource = value;
  }

  setCurrentDragComponent(value: any) {
    this.dragDropService.currentDragComponent = value;
  }

  setDragGhost(value: HTMLElement | null) {
    this.dragDropService.dragGhost = value;
  }

  setSelectedComponentId(value: string | null) {
    this.stateManagementService.selectComponent(value);
  }

  setIsDragging(value: boolean) {
    this.stateManagementService.setDragging(value);
  }

  setIsCanvasHovered(value: boolean) {
    this.stateManagementService.setCanvasHovered(value);
  }

  setCanvasDropZone(value: 'top' | 'bottom' | null) {
    this.dragDropService.canvasDropZone.set(value);
  }

  clearComponents() {
    this.stateManagementService.clearComponents();
  }

  // Методы для работы с компонентами
  addComponent(component: DroppedComponent, parentId?: string | null) {
    this.stateManagementService.addComponent(component, parentId);
  }

  removeComponent(componentId: string) {
    this.stateManagementService.removeComponent(componentId);
  }

  updateComponent(componentId: string, properties: any) {
    this.stateManagementService.updateComponent(componentId, properties);
  }

  // Метод для генерации HTML
  generateFormHtml() {
    return this.htmlGenerationService.generateFormHtml(this.stateManagementService.components());
  }

  // Вспомогательные методы
  public insertComponent(components: DroppedComponent[], newComponent: DroppedComponent, parentId: string): DroppedComponent[] {
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

  public filterComponents(components: DroppedComponent[], componentId: string): DroppedComponent[] {
    return components.filter(component => {
      if (component.id === componentId) return false;
      if (component.children) {
        component.children = this.filterComponents(component.children, componentId);
      }
      return true;
    });
  }

  public updateComponentProperties(components: DroppedComponent[], componentId: string, properties: any): DroppedComponent[] {
    return components.map(component => {
      if (component.id === componentId) {
        return { ...component, properties: { ...component.properties, ...properties } };
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

  // Методы для Drop Zones
  setDropZone(componentId: string, position: 'top' | 'bottom' | 'left' | 'right' | null) {
    this.dragDropService.setDropZone(componentId, position);
  }

  setHoverState(componentId: string, isHovered: boolean) {
    this.dragDropService.setHoverState(componentId, isHovered);
  }

  getDropZone(componentId: string): 'top' | 'bottom' | 'left' | 'right' | null {
    return this.dragDropService.getDropZone(componentId);
  }

  getHoverState(componentId: string): boolean {
    return this.dragDropService.getHoverState(componentId);
  }

  clearDropZones() {
    this.dragDropService.clearDropZones();
  }

  // Вся логика работы с компонентами, drag & drop, drop zones — реализована здесь.
}