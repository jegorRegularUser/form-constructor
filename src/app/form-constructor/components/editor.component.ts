import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { DragStateService } from './services/drag-state.service';
import { EditorElement, DropPosition } from './interfaces/drag-data.model';
import { InputComponent } from './blocks/input.component';
import { CommonModule } from '@angular/common';

// Базовый интерфейс для всех элементов редактора
export interface BaseEditorComponent {
  id: string;
  getNativeElement(): HTMLElement;
  isDragged: boolean;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, InputComponent],
  template: `
    <div
      class="editor"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
      (mouseup)="onDrop()"
    >
      <div class="editor-content">
        <div
          *ngFor="let row of elements; let rowIndex = index"
          class="element-row"
          [attr.data-row-index]="rowIndex"
        >
          <!-- Универсальный рендеринг элементов -->
          <ng-container *ngFor="let element of row; let colIndex = index">
            <!-- Input компонент -->
            <app-input
              *ngIf="element.type === 'input'"
              #inputElement
              [value]="element.value"
              [id]="element.id"
              [isDragged]="isElementDragged(element.id)"
              (mousedown)="
                onExistingElementDragStart($event, element.id, rowIndex, colIndex)
              "
            ></app-input>
            
            <!-- Здесь можно добавить другие типы компонентов -->
            <!-- 
            <app-button
              *ngIf="element.type === 'button'"
              #buttonElement
              [text]="element.text"
              [id]="element.id"
              [isDragged]="isElementDragged(element.id)"
              (mousedown)="
                onExistingElementDragStart($event, element.id, rowIndex, colIndex)
              "
            ></app-button>
            -->
          </ng-container>
        </div>

        <div *ngIf="elements.length === 0" class="empty-state">
          Drag components here to start building
        </div>
      </div>

      <!-- Drop indicator bar -->
      <div
        *ngIf="showDropIndicator"
        class="drop-indicator"
        [class.horizontal]="indicatorOrientation === 'horizontal'"
        [class.vertical]="indicatorOrientation === 'vertical'"
        [style.left]="dropIndicatorLeft + 'px'"
        [style.top]="dropIndicatorTop + 'px'"
        [style.width]="dropIndicatorWidth + 'px'"
        [style.height]="dropIndicatorHeight + 'px'"
      ></div>
    </div>
  `,
  styles: [
    `
      .editor {
        flex: 1;
        background: #fff;
        border: 2px dashed #e9ecef;
        border-radius: 8px;
        min-height: 400px;
        position: relative;
        overflow: auto;
      }

      .editor-content {
        padding: 16px;
        min-height: 100%;
      }

      .element-row {
        display: flex;
        margin-bottom: 8px;
        position: relative;
        min-height: 50px;
      }

      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #6c757d;
        font-style: italic;
      }

      .drop-indicator {
        position: absolute;
        background: #2196f3;
        border-radius: 2px;
        pointer-events: none;
        z-index: 1000;
        transition: all 0.1s ease;
        box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3);
      }

      .drop-indicator.horizontal {
        height: 3px;
        margin-top: -1.5px;
      }

      .drop-indicator.vertical {
        width: 3px;
        margin-left: -1.5px;
      }

      .drop-indicator::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: rgba(33, 150, 243, 0.1);
        border-radius: 4px;
      }
    `,
  ],
})
export class EditorComponent implements AfterViewInit {
  // Универсальный QueryList для всех типов компонентов
  @ViewChildren('inputElement') inputElements!: QueryList<BaseEditorComponent>;
  // Добавьте другие QueryList для других типов компонентов:
  // @ViewChildren('buttonElement') buttonElements!: QueryList<BaseEditorComponent>;

  elements: EditorElement[][] = [[]];
  showDropIndicator = false;
  dropIndicatorLeft = 0;
  dropIndicatorTop = 0;
  dropIndicatorWidth = 0;
  dropIndicatorHeight = 0;
  indicatorOrientation: 'horizontal' | 'vertical' = 'horizontal';

  private currentDropPosition: DropPosition | null = null;
  private dragData: any = null;
  private draggedElementId: string | null = null;

  constructor(
    private dragStateService: DragStateService,
    private elementRef: ElementRef
  ) {
    this.dragStateService.dragData$.subscribe((data) => {
      this.dragData = data;
      this.draggedElementId =
        data?.type === 'existing' && data.id !== undefined ? data.id : null;

      if (!data) {
        this.showDropIndicator = false;
      }
    });

    this.dragStateService.dragEnd$.subscribe(() => {
      this.showDropIndicator = false;
      this.draggedElementId = null;
    });
  }

  ngAfterViewInit() {
    // Подписка на изменения всех типов элементов
    this.inputElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
    // Добавьте подписки для других типов элементов
  }

  // Универсальный метод для получения всех элементов редактора
  private getAllEditorElements(): BaseEditorComponent[] {
    const allElements: BaseEditorComponent[] = [];
    
    // Добавляем input элементы
    allElements.push(...this.inputElements.toArray());
    
    // Добавьте другие типы элементов:
    // allElements.push(...this.buttonElements.toArray());
    
    return allElements;
  }

  isElementDragged(elementId: string): boolean {
    return this.draggedElementId === elementId;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragData) return;

    const editorRect = this.elementRef.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - editorRect.left;
    const mouseY = event.clientY - editorRect.top;

    this.calculateDropPosition(mouseX, mouseY, editorRect);
  }

  onMouseLeave() {
    this.showDropIndicator = false;
    this.dragStateService.setDropPosition(null);
  }

  onDrop() {
    if (!this.currentDropPosition || !this.dragData) return;

    if (this.dragData.type === 'input') {
      this.insertNewElement(this.dragData.elementType || 'input');
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
    this.dragStateService.setDragData({
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
      this.dragStateService.clearDragData();
      this.dragStateService.notifyDragEnd();
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

    if (this.dragData?.type === 'input') {
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
      this.dragStateService.setDropPosition(null);
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
      this.dragStateService.setDropPosition(null);
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
    this.dragStateService.setDropPosition(this.currentDropPosition);
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
    this.dragStateService.setDropPosition(this.currentDropPosition);
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
        newElement = {
          id: 'input-' + Date.now(),
          type: 'input',
          value: 'Input Field',
        };
        break;
      // Добавьте другие типы элементов здесь:
      // case 'button':
      //   newElement = {
      //     id: 'button-' + Date.now(),
      //     type: 'button',
      //     text: 'Button',
      //     color: 'primary'
      //   };
      //   break;
      default:
        newElement = {
          id: 'element-' + Date.now(),
          type: elementType,
          value: ''
        };
    }

    if (!this.currentDropPosition) {
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
          this.elements[rowIndex].push(newElement);
        }
      } else {
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
    for (let rowIndex = 0; rowIndex < this.elements.length; rowIndex++) {
      const colIndex = this.elements[rowIndex].findIndex(
        (el) => el.id === this.dragData.id
      );
      if (colIndex !== -1) {
        existingElement = this.elements[rowIndex].splice(colIndex, 1)[0];
        if (this.elements[rowIndex].length === 0) {
          this.elements.splice(rowIndex, 1);
        }
        break;
      }
    }

    if (!existingElement) return;

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
          this.elements[rowIndex].push(existingElement);
        }
      } else {
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
    // Recalculate when elements change
  }
}