import { Component, signal, ElementRef, inject, OnInit, OnDestroy, QueryList, ViewChildren, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from '../../../services/form-builder.service';
import { StateManagementService } from '../../services/state-management.service';
import { DragDropService } from '../../services/drag-drop.service';
import { BaseEditorComponent, DragData, DropPosition, EditorElement } from '../../../interfaces/dnd.interface';
import { EditorToolbarComponent } from './editor-toolbar/editor-toolbar.component';
import { FormElementComponent } from './form-elements/form-element.component';

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [
    CommonModule,
    EditorToolbarComponent,
    FormElementComponent
  ],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.css'
})
export class EditorPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  public builder = inject(FormBuilderService);
  public stateManagementService = inject(StateManagementService);
  public dragDropService = inject(DragDropService);
  
  // Универсальный QueryList для всех типов компонентов
  @ViewChildren(FormElementComponent) formElements!: QueryList<BaseEditorComponent>;
  @ViewChild('visibleCanvas') visibleCanvas!: ElementRef<HTMLElement>;
  
  // Element reference for the component itself
  constructor(private elementRef: ElementRef) {}

  updateTimeout: any;

  // New properties from test editor component
  elements: EditorElement[][] = [[
    {
      id: 'test-input-' + Date.now(),
      type: 'text-input',
      value: 'Sample Text Input'
    }
  ]];
  showDropIndicator = false;
  dropIndicatorLeft = 0;
  dropIndicatorTop = 0;
  dropIndicatorWidth = 0;
  dropIndicatorHeight = 0;
  indicatorOrientation: 'horizontal' | 'vertical' = 'horizontal';

  private currentDropPosition: DropPosition | null = null;
  private dragData: any = null;
  private draggedElementId: string | null = null;

  ngOnInit(): void {
    // Subscribe to drag data from the drag-drop service
    this.dragDropService.dragData$.subscribe((data) => {
      this.dragData = data;
      this.draggedElementId =
        data?.type === 'existing' && data.id !== undefined ? data.id : null;

      if (!data) {
        this.showDropIndicator = false;
      }
    });

    this.dragDropService.dragEnd$.subscribe(() => {
      this.showDropIndicator = false;
      this.draggedElementId = null;
    });
  }

  ngAfterViewInit(): void {
    // Подписка на изменения всех типов элементов
    this.formElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
  }

  ngOnDestroy(): void {
    this.cleanupDragEffects();
  }

  // ==================== НОВАЯ ЛОГИКА DRAG & DROP ====================

  onMouseMove(event: MouseEvent) {
    if (!this.dragData) return;

    const editorRect = this.elementRef.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - editorRect.left;
    const mouseY = event.clientY - editorRect.top;

    this.calculateDropPosition(mouseX, mouseY, editorRect);
  }

  onMouseLeave() {
    this.showDropIndicator = false;
    this.dragDropService.setDropPosition(null);
  }

  onDrop() {
    if (!this.currentDropPosition || !this.dragData) return;

    // Check for element types that can be inserted
    if (this.dragData.type === 'input' || this.dragData.type === 'text-input' ||
        this.dragData.type === 'email-input' || this.dragData.type === 'textarea' ||
        this.dragData.type === 'select' || this.dragData.type === 'checkbox' ||
        this.dragData.type === 'button' || this.dragData.type === 'container') {
      this.insertNewElement(this.dragData.elementType || this.dragData.type);
    } else if (this.dragData.type === 'existing') {
      this.moveExistingElement();
    }

    this.showDropIndicator = false;
    this.currentDropPosition = null;
  }

  onExistingElementDragStart(
    event: MouseEvent,
    id: string,
    rowIndex: number,
    colIndex: number
  ) {
    this.dragDropService.setDragData({
      type: 'existing',
      id,
      rowIndex,
      colIndex,
    });

    const moveListener = (e: MouseEvent) => {
      const editorRect = this.elementRef.nativeElement.getBoundingClientRect();
      const mouseX = e.clientX - editorRect.left;
      const mouseY = e.clientY - editorRect.top;
      this.calculateDropPosition(mouseX, mouseY, editorRect);
    };

    const upListener = () => {
      this.dragDropService.clearDragData();
      this.dragDropService.notifyDragEnd();
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
    };

    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);

    event.preventDefault();
  }

  private calculateDropPosition(
    mouseX: number,
    mouseY: number,
    editorRect: DOMRect
  ) {
    const elementNodes = this.getAllEditorElements();

    // Determine if dragging from sidebar (new input) or from within the editor (existing element)
    if (this.dragData?.type === 'input' || this.dragData?.type === 'text-input' ||
        this.dragData?.type === 'email-input' || this.dragData?.type === 'textarea' ||
        this.dragData?.type === 'select' || this.dragData?.type === 'checkbox' ||
        this.dragData?.type === 'button' || this.dragData?.type === 'container') {
      this.calculateDropPositionFromSidebar(
        mouseX,
        mouseY,
        editorRect,
        elementNodes
      );
    } else {
      this.calculateDropPositionFromEditor(
        mouseX,
        mouseY,
        editorRect,
        elementNodes
      );
    }
  }

  private calculateDropPositionFromSidebar(
    mouseX: number,
    mouseY: number,
    editorRect: DOMRect,
    elementNodes: BaseEditorComponent[]
  ) {
    let targetRowIndex = this.findRowIndexByPosition(
      mouseY,
      editorRect,
      elementNodes
    );

    if (targetRowIndex === -1) {
      this.showDropIndicator = false;
      this.dragDropService.setDropPosition(null);
      return;
    }

    const rowElements = this.getElementsInRow(targetRowIndex, elementNodes);
    const positionInRow = this.findPositionInRow(
      mouseX,
      mouseY,
      rowElements,
      editorRect
    );

    if (positionInRow.type === 'vertical') {
      this.showVerticalIndicator(
        positionInRow,
        targetRowIndex,
        editorRect,
        elementNodes
      );
    } else {
      this.showHorizontalIndicator(
        positionInRow,
        targetRowIndex,
        editorRect,
        elementNodes
      );
    }
  }

  private calculateDropPositionFromEditor(
    mouseX: number,
    mouseY: number,
    editorRect: DOMRect,
    elementNodes: BaseEditorComponent[]
  ) {
    let targetRowIndex = this.findRowIndexByPosition(
      mouseY,
      editorRect,
      elementNodes
    );

    if (targetRowIndex === -1) {
      this.showDropIndicator = false;
      this.dragDropService.setDropPosition(null);
      return;
    }

    const rowElements = this.getElementsInRow(targetRowIndex, elementNodes);
    const positionInRow = this.findPositionInRow(
      mouseX,
      mouseY,
      rowElements,
      editorRect
    );

    if (positionInRow.type === 'vertical') {
      this.showVerticalIndicator(
        positionInRow,
        targetRowIndex,
        editorRect,
        elementNodes
      );
    } else {
      this.showHorizontalIndicator(
        positionInRow,
        targetRowIndex,
        editorRect,
        elementNodes
      );
    }
  }

  private findRowIndexByPosition(
    mouseY: number,
    editorRect: DOMRect,
    elementNodes: BaseEditorComponent[]
  ): number {
    for (let rowIndex = 0; rowIndex < this.elements.length; rowIndex++) {
      const rowTop = this.getRowTop(rowIndex, elementNodes, editorRect);
      const rowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);

      if (mouseY >= rowTop && mouseY <= rowBottom) {
        return rowIndex;
      }
    }
    return -1;
  }

  private getElementsInRow(
    rowIndex: number,
    elementNodes: BaseEditorComponent[]
  ): BaseEditorComponent[] {
    if (rowIndex < 0 || rowIndex >= this.elements.length) return [];

    const rowElementIds = this.elements[rowIndex].map((el) => el.id);
    return elementNodes.filter((el) => rowElementIds.includes(el.id));
  }

  private findPositionInRow(
    mouseX: number,
    mouseY: number,
    rowElements: BaseEditorComponent[],
    editorRect: DOMRect
  ): any {
    if (rowElements.length > 0) {
      const firstElement = rowElements[0];
      const lastElement = rowElements[rowElements.length - 1];

      const firstRect = firstElement.getNativeElement().getBoundingClientRect();
      const lastRect = lastElement.getNativeElement().getBoundingClientRect();

      const rowTop = firstRect.top - editorRect.top;
      const rowBottom = lastRect.bottom - editorRect.top;

      if (mouseY - rowTop < 15) {
        return { type: 'horizontal', position: 'top' };
      }

      if (rowBottom - mouseY < 15) {
        return { type: 'horizontal', position: 'bottom' };
      }
    }

    for (let i = 0; i < rowElements.length; i++) {
      const element = rowElements[i];
      const rect = element.getNativeElement().getBoundingClientRect();
      const elementLeft = rect.left - editorRect.left;
      const elementRight = rect.right - editorRect.left;
      const elementTop = rect.top - editorRect.top;
      const elementBottom = rect.bottom - editorRect.top;

      if (
        Math.abs(mouseX - elementLeft) < 20 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom
      ) {
        return { type: 'vertical', position: 'left', element };
      }

      if (
        Math.abs(mouseX - elementRight) < 20 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom
      ) {
        return { type: 'vertical', position: 'right', element };
      }

      if (i < rowElements.length - 1) {
        const nextElement = rowElements[i + 1];
        const nextRect = nextElement.getNativeElement().getBoundingClientRect();
        const nextLeft = nextRect.left - editorRect.left;

        const gapCenter = (elementRight + nextLeft) / 2;
        if (
          Math.abs(mouseX - gapCenter) < 25 &&
          mouseY >= elementTop &&
          mouseY <= elementBottom
        ) {
          return {
            type: 'vertical',
            position: 'between',
            element,
            nextElement,
          };
        }
      }
    }

    if (rowElements.length > 0) {
      const lastElement = rowElements[rowElements.length - 1];
      return { type: 'vertical', position: 'end', element: lastElement };
    }

    return { type: 'vertical', position: 'empty' };
  }

  private showVerticalIndicator(
    positionInRow: any,
    rowIndex: number,
    editorRect: DOMRect,
    elementNodes: BaseEditorComponent[]
  ) {
    this.indicatorOrientation = 'vertical';
     const rowTop = this.getRowTop(rowIndex, elementNodes, editorRect);
    const rowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);
    // Статичные размеры
    this.dropIndicatorWidth = 3;
    this.dropIndicatorHeight = rowBottom - rowTop - 20;

    if (positionInRow.position === 'left' && positionInRow.element) {
      const rect = positionInRow.element.getNativeElement().getBoundingClientRect();
      this.dropIndicatorLeft = rect.left - editorRect.left - 2;
      this.dropIndicatorTop = rect.top - editorRect.top + (rect.height - this.dropIndicatorHeight) / 2;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: true,
        targetId: positionInRow.element.id,
        targetRowIndex: rowIndex,
        orientation: 'vertical',
      };
    } else if (positionInRow.position === 'right' && positionInRow.element) {
      const rect = positionInRow.element.getNativeElement().getBoundingClientRect();
      this.dropIndicatorLeft = rect.right - editorRect.left - 2;
      this.dropIndicatorTop = rect.top - editorRect.top + (rect.height - this.dropIndicatorHeight) / 2;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: false,
        targetId: positionInRow.element.id,
        targetRowIndex: rowIndex,
        orientation: 'vertical',
      };
    } else if (
      positionInRow.position === 'between' &&
      positionInRow.element &&
      positionInRow.nextElement
    ) {
      const rect = positionInRow.element.getNativeElement().getBoundingClientRect();
      const nextRect = positionInRow.nextElement.getNativeElement().getBoundingClientRect();
      this.dropIndicatorLeft = (rect.right + nextRect.left) / 2 - editorRect.left - 2;
      this.dropIndicatorTop = rect.top - editorRect.top + (rect.height - this.dropIndicatorHeight) / 2;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: false,
        targetId: positionInRow.element.id,
        targetRowIndex: rowIndex,
        orientation: 'vertical',
      };
    } else if (positionInRow.position === 'end' && positionInRow.element) {
      const rect = positionInRow.element.getNativeElement().getBoundingClientRect();
      this.dropIndicatorLeft = rect.right - editorRect.left + 20;
      this.dropIndicatorTop = rect.top - editorRect.top + (rect.height - this.dropIndicatorHeight) / 2;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: false,
        targetId: positionInRow.element.id,
        targetRowIndex: rowIndex,
        orientation: 'vertical',
      };
    } else if (positionInRow.position === 'empty') {
      const rowTop = this.getRowTop(rowIndex, elementNodes, editorRect);
      const rowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);
      this.dropIndicatorLeft = 20;
      this.dropIndicatorTop = rowTop + (rowBottom - rowTop - this.dropIndicatorHeight) / 2;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: true,
        targetRowIndex: rowIndex,
        orientation: 'vertical',
      };
    }

    this.showDropIndicator = true;
    this.dragDropService.setDropPosition(this.currentDropPosition);
  }

  private showHorizontalIndicator(
    positionInRow: any,
    rowIndex: number,
    editorRect: DOMRect,
    elementNodes: BaseEditorComponent[]
  ) {
    this.indicatorOrientation = 'horizontal';
    // Статичные размеры
    this.dropIndicatorWidth = editorRect.width - 40;
    this.dropIndicatorHeight = 3;
    this.dropIndicatorLeft = (editorRect.width - this.dropIndicatorWidth) / 2;

    if (positionInRow.position === 'top') {
      const rowTop = this.getRowTop(rowIndex, elementNodes, editorRect);
      this.dropIndicatorTop = rowTop - 5;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: true,
        targetRowIndex: rowIndex,
        orientation: 'horizontal',
      };
    } else if (positionInRow.position === 'bottom') {
      const rowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);
      this.dropIndicatorTop = rowBottom + 5;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: false,
        targetRowIndex: rowIndex,
        orientation: 'horizontal',
      };
    }

    this.showDropIndicator = true;
    this.dragDropService.setDropPosition(this.currentDropPosition);
  }

  private getRowTop(
    rowIndex: number,
    elementNodes: BaseEditorComponent[],
    editorRect: DOMRect
  ): number {
    if (this.elements[rowIndex] && this.elements[rowIndex].length > 0) {
      const firstElementId = this.elements[rowIndex][0].id;
      const element = elementNodes.find((el) => el.id === firstElementId);
      if (element) {
        const rect = element.getNativeElement().getBoundingClientRect();
        return rect.top - editorRect.top - 10;
      }
    }
    return 20 + rowIndex * 60;
  }

  private getRowBottom(
    rowIndex: number,
    elementNodes: BaseEditorComponent[],
    editorRect: DOMRect
  ): number {
    if (this.elements[rowIndex] && this.elements[rowIndex].length > 0) {
      const firstElementId = this.elements[rowIndex][0].id;
      const element = elementNodes.find((el) => el.id === firstElementId);
      if (element) {
        const rect = element.getNativeElement().getBoundingClientRect();
        return rect.bottom - editorRect.top + 10;
      }
    }
    return 80 + rowIndex * 60;
  }

  private insertNewElement(elementType: string) {
    let newElement: EditorElement;

    switch (elementType) {
      case 'input':
      case 'text-input':
        newElement = {
          id: 'input-' + Date.now(),
          type: 'text-input',
          value: 'Text Input',
        };
        break;
      case 'email-input':
        newElement = {
          id: 'email-' + Date.now(),
          type: 'email-input',
          value: 'Email Input',
        };
        break;
      case 'textarea':
        newElement = {
          id: 'textarea-' + Date.now(),
          type: 'textarea',
          value: 'Textarea',
        };
        break;
      case 'select':
        newElement = {
          id: 'select-' + Date.now(),
          type: 'select',
          value: 'Select',
        };
        break;
      case 'checkbox':
        newElement = {
          id: 'checkbox-' + Date.now(),
          type: 'checkbox',
          value: 'Checkbox',
        };
        break;
      case 'button':
        newElement = {
          id: 'button-' + Date.now(),
          type: 'button',
          value: 'Button',
        };
        break;
      case 'container':
        newElement = {
          id: 'container-' + Date.now(),
          type: 'container',
          value: 'Container',
        };
        break;
      default:
        newElement = {
          id: 'element-' + Date.now(),
          type: elementType,
          value: elementType
        };
    }

    if (!this.currentDropPosition) {
      // If no specific drop position is determined, add to the first row or create a new one
      if (this.elements.length === 0) {
        this.elements.push([newElement]);
      } else {
        this.elements[0].push(newElement);
      }
      return;
    }

    this.insertElement(newElement);
  }

  private insertElement(newElement: EditorElement) {
    if (!this.currentDropPosition) return;

    if (
      this.currentDropPosition.orientation === 'vertical' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;

      if (this.currentDropPosition.targetId) {
        const colIndex = this.elements[rowIndex].findIndex(
          (el) => el.id === this.currentDropPosition!.targetId
        );
        if (colIndex !== -1) {
          if (this.currentDropPosition.insertBefore) {
            this.elements[rowIndex].splice(colIndex, 0, newElement);
          } else {
            this.elements[rowIndex].splice(colIndex + 1, 0, newElement);
          }
        } else {
          // If targetId not found in the row, push to the end of the row
          this.elements[rowIndex].push(newElement);
        }
      } else {
        // If no targetId, insert at the beginning of the row
        this.elements[rowIndex].unshift(newElement);
      }
    } else if (
      this.currentDropPosition.orientation === 'horizontal' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;
      if (this.currentDropPosition.insertBefore) {
        this.elements.splice(rowIndex, 0, [newElement]);
      } else {
        this.elements.splice(rowIndex + 1, 0, [newElement]);
      }
    }
  }

  private moveExistingElement() {
    if (!this.currentDropPosition || !this.dragData) return;

    let existingElement: EditorElement | null = null;
    // Find and remove the element from its current position
    for (let rowIndex = 0; rowIndex < this.elements.length; rowIndex++) {
      const colIndex = this.elements[rowIndex].findIndex(
        (el) => el.id === this.dragData.id
      );
      if (colIndex !== -1) {
        existingElement = this.elements[rowIndex].splice(colIndex, 1)[0];
        // If the row becomes empty after removal, remove the row itself
        if (this.elements[rowIndex].length === 0) {
          this.elements.splice(rowIndex, 1);
        }
        break;
      }
    }

    if (!existingElement) return; // Should not happen if dragData.id is valid

    // Insert the element into the new position
    if (
      this.currentDropPosition.orientation === 'vertical' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;

      if (this.currentDropPosition.targetId) {
        const colIndex = this.elements[rowIndex].findIndex(
          (el) => el.id === this.currentDropPosition!.targetId
        );
        if (colIndex !== -1) {
          if (this.currentDropPosition.insertBefore) {
            this.elements[rowIndex].splice(colIndex, 0, existingElement);
          } else {
            this.elements[rowIndex].splice(colIndex + 1, 0, existingElement);
          }
        } else {
          // If targetId not found in the row, push to the end of the row
          this.elements[rowIndex].push(existingElement);
        }
      } else {
        // If no targetId, insert at the beginning of the row
        this.elements[rowIndex].unshift(existingElement);
      }
    } else if (
      this.currentDropPosition.orientation === 'horizontal' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;
      if (this.currentDropPosition.insertBefore) {
        this.elements.splice(rowIndex, 0, [existingElement]);
      } else {
        this.elements.splice(rowIndex + 1, 0, [existingElement]);
      }
    }
  }

  private updateDropPositions() {
    // This method might be called to recalculate positions if needed,
    // but the current drag logic recalculates on mouse move.
    // It can be left empty or used for specific scenarios if required.
  }

  // Method to clean up drag effects (e.g., remove drag ghost, reset styles)
  private cleanupDragEffects() {
    // Logic to remove any visual indicators or elements related to dragging
    // This would involve removing DOM elements created for drag ghost/indicators if any.
    // The DragDropService might handle some of this.
    
    // For now, ensure the drag data is cleared and indicators are hidden.
    this.dragDropService.clearDragData();
    this.dragDropService.setDropPosition(null);
    this.showDropIndicator = false;
    this.draggedElementId = null;
    this.dragData = null;
  }

  // Helper method to get all rendered editor elements for position calculation
  private getAllEditorElements(): BaseEditorComponent[] {
    const allElements: BaseEditorComponent[] = [];
    
    // Collect all elements from the formElements QueryList
    allElements.push(...this.formElements.toArray());
    
    return allElements;
  }

  // Helper method to check if an element is currently being dragged
  isElementDragged(elementId: string): boolean {
    return this.draggedElementId === elementId;
  }

  // Method required by main-layout component
  setExternalDropTarget(target: any): void {
    // Implementation for external drop target
    console.log('Setting external drop target:', target);
  }

  // Methods for toolbar
  clearCanvas(): void {
    this.elements = [[]];
  }

  exportForm(): void {
    console.log('Exporting form:', this.elements);
  }

  // Method to check if drag is in progress
  dragInProgress(): boolean {
    return this.dragData !== null;
  }

  // Method to handle element click
  onElementClick(element: EditorElement, clickEvent: any): void {
    // Extract the actual MouseEvent from the emitted object
    const event = clickEvent.event;
    
    // Prevent drag initialization when clicking
    event.stopPropagation();
    
    // Here you can add logic to select the element for property editing
    console.log('Element clicked:', element);
    
    // You might want to emit an event or update a service to track the selected element
    // For example: this.stateManagementService.setSelectedElement(element);
  }
}