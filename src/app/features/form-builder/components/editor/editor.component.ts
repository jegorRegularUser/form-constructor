import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  Input
} from '@angular/core';
import { DragStateService } from '../../../../core/services/drag-state.service';
import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { ElementRegistryService } from '../../../../core/services/element-registry.service';
import { ElementFactory } from '../../../../core/factories/element-factory.service';
import { ElementStateService } from '../../../../core/services/element-state.service';
import { FormService } from '../../../../core/services/form.service';
import { EditorElement, DropPosition } from '../../../../core/models/drag-data.model';
import { FormElementProperties } from '../../../../core/models/element-properties.model';
import { FormProperties } from '../../../../core/models/form-properties.model';
import { InputComponent } from '../../../../shared/components/form-elements/input.component';
import { TextareaComponent } from '../../../../shared/components/form-elements/textarea.component';
import { ButtonElementComponent } from '../../../../shared/components/form-elements/button-element/button-element.component';
import { SelectElementComponent } from '../../../../shared/components/form-elements/select-element/select-element.component';
import { BaseFormBlockComponent } from '../../../../shared/components/form-elements/base-form-block.component';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

// Базовый интерфейс для всех элементов редактора
export interface BaseEditorComponent {
  id: string;
  getNativeElement(): HTMLElement;
  isDragged: boolean;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, InputComponent, TextareaComponent, ButtonElementComponent, SelectElementComponent],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() sidebarCollapsed = false;
  private destroy$ = new Subject<void>();
  // Универсальный QueryList для всех типов компонентов
  @ViewChildren('inputElement') inputElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('textareaElement') textareaElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('buttonElement') buttonElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('selectElement') selectElements!: QueryList<BaseEditorComponent>;
  @ViewChildren(BaseFormBlockComponent) formElements!: QueryList<BaseFormBlockComponent>;

  elements: EditorElement[][] = [];
  showDropIndicator = false;
  dropIndicatorLeft = 0;
  dropIndicatorTop = 0;
  dropIndicatorWidth = 0;
  dropIndicatorHeight = 0;
  indicatorOrientation: 'horizontal' | 'vertical' = 'horizontal';

  private currentDropPosition: DropPosition | null = null;
  private dragData: any = null;
  private draggedElementId: string | null = null;
  
  // Form properties
  formProperties: FormProperties = { id: 'default-form' };
  titleStyles: Record<string, string> = {};
  formStyles: Record<string, string> = {};

  constructor(
    private dragStateService: DragStateService,
    private elementSelectionService: ElementSelectionService,
    private elementRef: ElementRef,
    private elementRegistryService: ElementRegistryService,
    private elementFactory: ElementFactory,
    private elementStateService: ElementStateService,
    private formService: FormService,
    private message: NzMessageService
  ) {
    this.dragStateService.dragData$.subscribe((data) => {
      this.dragData = data;
      this.draggedElementId =
        data?.type === 'existing' && data.id !== undefined ? data.id : null;

      if (!data) {
        this.showDropIndicator = false;
      }
    });

    this.dragStateService.dragStart$.subscribe(() => {
      // When drag starts, preserve the selection of the dragged element
      if (this.draggedElementId) {
        const selectedElement = this.elementSelectionService.getSelectedElement();
        if (!selectedElement || selectedElement.id !== this.draggedElementId) {
          // If the dragged element is not selected, select it
          this.selectElementById(this.draggedElementId);
        }
      }
    });

    this.dragStateService.dragEnd$.subscribe(() => {
      this.showDropIndicator = false;
      this.draggedElementId = null;
      // After drag ends, maintain the selection of the moved element
      // The drag state service will handle restoring the selection if needed
    });

    // Initialize form properties
    this.formProperties = { id: 'default-form' };
    this.updateTitleStyles();
    this.updateFormStyles();

    // Subscribe to element state changes
    this.elementStateService.getState$().subscribe(state => {
      // Update elements from state
      this.elements = state.elements;
    });
  }

  ngOnInit() {
    // Load initial state from element state service
    const initialState = this.elementStateService.getCurrentState();
    this.elements = initialState.elements;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    // Подписка на изменения всех типов элементов
    this.inputElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
    this.textareaElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
    this.buttonElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
    this.selectElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
    this.formElements.changes.subscribe(() => {
      this.updateDropPositions();
    });
  }

  private getAllEditorElements(): BaseEditorComponent[] {
    return [
      ...this.inputElements.toArray(),
      ...this.textareaElements.toArray(),
      ...this.buttonElements.toArray(),
      ...this.selectElements.toArray()
    ];
  }

  isElementDragged(elementId: string): boolean {
    return this.draggedElementId === elementId;
  }
  
  isElementSelected(elementId: string): boolean {
    return this.elementSelectionService.isElementSelected(elementId);
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

    if (this.dragData.type === 'input' || this.dragData.type === 'textarea' ||
        this.dragData.type === 'select' || this.dragData.type === 'button' || this.dragData.type === 'element') {
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
    event.stopPropagation();
  }

  // Add method to handle element selection
  onElementClick(elementId: string, event: MouseEvent) {
    // Find the element
    let selectedElement: FormElementProperties | null = null;
    
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element) {
        selectedElement = element as FormElementProperties;
        break;
      }
    }
    
    // Select the element
    this.elementSelectionService.selectElement(selectedElement);
    
    // Prevent drag when clicking to select
    event.stopPropagation();
    event.preventDefault();
  }
  
  // Handle click on empty editor area to deselect
  onEditorClick(event: MouseEvent) {
    // Check if the click is on the editor background (not on an element)
    if (event.target === this.elementRef.nativeElement ||
        (event.target as HTMLElement).classList.contains('editor-content')) {
      this.elementSelectionService.deselectElement();
    }
  }

  private calculateDropPosition(mouseX: number, mouseY: number, editorRect: DOMRect) {
    if (this.elements.length === 0 || (this.elements.length === 1 && this.elements[0].length === 0)) {
      this.showEmptyFormDropIndicator(mouseX, mouseY, editorRect);
      return;
    }

    const elementNodes = this.getAllEditorElements();
    const targetRowIndex = this.findRowIndexByPosition(mouseY, editorRect, elementNodes);
    
    if (targetRowIndex === -1) {
      this.showDropIndicator = false;
      this.dragStateService.setDropPosition(null);
      return;
    }

    const rowElements = this.getElementsInRow(targetRowIndex, elementNodes);
    const positionInRow = this.findPositionInRow(mouseX, mouseY, rowElements, editorRect);

    if (positionInRow.type === 'horizontal') {
      this.showHorizontalIndicator(positionInRow, targetRowIndex, editorRect, elementNodes);
    } else {
      this.showVerticalIndicator(positionInRow, targetRowIndex, editorRect, elementNodes);
    }
  }





  private findRowIndexByPosition(mouseY: number, editorRect: DOMRect, elementNodes: BaseEditorComponent[]): number {
    for (let i = 0; i < this.elements.length; i++) {
      const rowTop = this.getRowTop(i, elementNodes, editorRect);
      const rowBottom = this.getRowBottom(i, elementNodes, editorRect);
      if (mouseY >= rowTop && mouseY <= rowBottom) return i;
    }
    return -1;
  }

  private getElementsInRow(rowIndex: number, elementNodes: BaseEditorComponent[]): BaseEditorComponent[] {
    if (rowIndex < 0 || rowIndex >= this.elements.length) return [];
    const rowElementIds = new Set(this.elements[rowIndex].map(el => el.id));
    return elementNodes.filter(el => rowElementIds.has(el.id));
  }

  private findPositionInRow(
    mouseX: number,
    mouseY: number,
    rowElements: BaseEditorComponent[],
    editorRect: DOMRect
  ): any {
    const allElementNodes = this.getAllEditorElements();
    
    if (rowElements.length > 0) {
      const firstElement = rowElements[0];
      const lastElement = rowElements[rowElements.length - 1];

      const firstRect = firstElement.getNativeElement().getBoundingClientRect();
      const lastRect = lastElement.getNativeElement().getBoundingClientRect();

      const rowTop = firstRect.top - editorRect.top;
      const rowBottom = lastRect.bottom - editorRect.top;

      // Проверяем, находимся ли мы у краев строки (для создания новых строк)
      const rowIndex = this.findCurrentRowIndex(rowElements);
      
      // Уменьшаем зону чувствительности для горизонтальных линий внутри строк
      // чтобы они не конфликтовали с горизонтальными линиями между строками
      if (mouseY - rowTop < 15) {
        return { type: 'horizontal', position: 'top', currentRowIndex: rowIndex };
      }

      if (rowBottom - mouseY < 15) {
        return { type: 'horizontal', position: 'bottom', currentRowIndex: rowIndex };
      }
    }

    // Сначала проверяем промежутки между элементами
    for (let i = 0; i < rowElements.length - 1; i++) {
      const element = rowElements[i];
      const nextElement = rowElements[i + 1];
      const rect = element.getNativeElement().getBoundingClientRect();
      const nextRect = nextElement.getNativeElement().getBoundingClientRect();
      
      const elementRight = rect.right - editorRect.left;
      const nextLeft = nextRect.left - editorRect.left;
      const elementTop = rect.top - editorRect.top;
      const elementBottom = rect.bottom - editorRect.top;
      
      const gapCenter = (elementRight + nextLeft) / 2;
      const gapWidth = nextLeft - elementRight;
      
      // Если курсор в промежутке между элементами
      if (
        mouseX >= elementRight &&
        mouseX <= nextLeft &&
        mouseY >= elementTop &&
        mouseY <= elementBottom
      ) {
        return {
          type: 'vertical',
          position: 'between',
          element,
          nextElement,
          gapCenter
        };
      }
    }

    // Затем проверяем края элементов
    for (let i = 0; i < rowElements.length; i++) {
      const element = rowElements[i];
      const rect = element.getNativeElement().getBoundingClientRect();
      const elementLeft = rect.left - editorRect.left;
      const elementRight = rect.right - editorRect.left;
      const elementTop = rect.top - editorRect.top;
      const elementBottom = rect.bottom - editorRect.top;

      // Левый край (только если это первый элемент)
      if (
        Math.abs(mouseX - elementLeft) < 20 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom &&
        i === 0
      ) {
        return { type: 'vertical', position: 'left', element };
      }

      // Правый край (всегда показываем для любого элемента)
      if (
        mouseX >= elementRight &&
        mouseX <= elementRight + 40 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom
      ) {
        return { type: 'vertical', position: 'right', element };
      }
    }

    // Если ничего не найдено, но есть элементы в строке, показываем справа от последнего
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
      
      // Используем точный центр между элементами
      if (positionInRow.gapCenter !== undefined) {
        this.dropIndicatorLeft = positionInRow.gapCenter - 1.5;
      } else {
        this.dropIndicatorLeft = (rect.right + nextRect.left) / 2 - editorRect.left - 1.5;
      }
      
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
    this.dropIndicatorWidth = editorRect.width - 40;
    this.dropIndicatorHeight = 3;
    this.dropIndicatorLeft = (editorRect.width - this.dropIndicatorWidth) / 2;

    if (positionInRow.position === 'top') {
      const currentRowIndex = positionInRow.currentRowIndex || rowIndex;
      const rowTop = this.getRowTop(currentRowIndex, elementNodes, editorRect);
      this.dropIndicatorTop = rowTop - 5;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: true,
        targetRowIndex: currentRowIndex,
        orientation: 'horizontal',
      };
    } else if (positionInRow.position === 'bottom') {
      const currentRowIndex = positionInRow.currentRowIndex || rowIndex;
      const rowBottom = this.getRowBottom(currentRowIndex, elementNodes, editorRect);
      this.dropIndicatorTop = rowBottom + 5;

      this.currentDropPosition = {
        x: this.dropIndicatorLeft,
        y: this.dropIndicatorTop,
        insertBefore: false,
        targetRowIndex: currentRowIndex + 1,
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
    const newElement = this.elementFactory.createElement(elementType);

    if (!this.currentDropPosition) {
      const targetRow = this.elements.length === 0 || (this.elements.length === 1 && this.elements[0].length === 0) ? 0 : 0;
      const targetCol = this.elements.length === 0 || (this.elements.length === 1 && this.elements[0].length === 0) ? 0 : this.elements[0].length;
      this.elementStateService.addElement(newElement, targetRow, targetCol);
      this.elementSelectionService.selectElement(newElement as FormElementProperties);
      return;
    }

    let targetRowIndex = this.currentDropPosition.targetRowIndex ?? 0;
    let targetColIndex = 0;
    
    if (this.currentDropPosition.orientation === 'horizontal') {
      this.elements.splice(targetRowIndex, 0, []);
      this.elementStateService.addElement(newElement, targetRowIndex, 0);
    } else if (this.currentDropPosition.targetId) {
      const rowIndex = this.currentDropPosition.targetRowIndex;
      if (rowIndex !== undefined && this.elements[rowIndex]) {
        const colIndex = this.elements[rowIndex].findIndex(el => el.id === this.currentDropPosition!.targetId);
        targetColIndex = colIndex !== -1 ? (this.currentDropPosition.insertBefore ? colIndex : colIndex + 1) : this.elements[rowIndex].length;
      }
      this.elementStateService.addElement(newElement, targetRowIndex, targetColIndex);
    } else {
      this.elementStateService.addElement(newElement, targetRowIndex, targetColIndex);
    }
    
    this.elementSelectionService.selectElement(newElement as FormElementProperties);
  }





  private moveExistingElement() {
    if (!this.currentDropPosition || !this.dragData) return;

    let existingElement: EditorElement | null = null;
    
    for (let i = 0; i < this.elements.length; i++) {
      const colIndex = this.elements[i].findIndex(el => el.id === this.dragData.id);
      if (colIndex !== -1) {
        existingElement = this.elements[i][colIndex];
        break;
      }
    }

    if (!existingElement) return;

    let targetRowIndex = this.currentDropPosition.targetRowIndex ?? 0;
    let targetColIndex = 0;

    if (this.currentDropPosition.orientation === 'horizontal') {
      this.elements.splice(targetRowIndex, 0, []);
      this.elementStateService.moveElement(existingElement.id, targetRowIndex, 0);
    } else if (this.currentDropPosition.targetId) {
      const rowIndex = this.currentDropPosition.targetRowIndex;
      if (rowIndex !== undefined && this.elements[rowIndex]) {
        const colIndex = this.elements[rowIndex].findIndex(el => el.id === this.currentDropPosition!.targetId);
        targetColIndex = colIndex !== -1 ? (this.currentDropPosition.insertBefore ? colIndex : colIndex + 1) : this.elements[rowIndex].length;
      }
      this.elementStateService.moveElement(existingElement.id, targetRowIndex, targetColIndex);
    } else {
      this.elementStateService.moveElement(existingElement.id, targetRowIndex, targetColIndex);
    }
    
    this.elementSelectionService.selectElement(existingElement as FormElementProperties);
  }

  private hasLargeGapBefore(
    elementIndex: number,
    rowElements: BaseEditorComponent[],
    editorRect: DOMRect
  ): boolean {
    if (elementIndex === 0) return true;
    
    const currentElement = rowElements[elementIndex];
    const prevElement = rowElements[elementIndex - 1];
    
    const currentRect = currentElement.getNativeElement().getBoundingClientRect();
    const prevRect = prevElement.getNativeElement().getBoundingClientRect();
    
    const gap = (currentRect.left - editorRect.left) - (prevRect.right - editorRect.left);
    return gap > 40; // Большой промежуток больше 40px
  }

  private hasLargeGapAfter(
    elementIndex: number,
    rowElements: BaseEditorComponent[],
    editorRect: DOMRect
  ): boolean {
    if (elementIndex === rowElements.length - 1) return true;
    
    const currentElement = rowElements[elementIndex];
    const nextElement = rowElements[elementIndex + 1];
    
    const currentRect = currentElement.getNativeElement().getBoundingClientRect();
    const nextRect = nextElement.getNativeElement().getBoundingClientRect();
    
    const gap = (nextRect.left - editorRect.left) - (currentRect.right - editorRect.left);
    return gap > 40; // Большой промежуток больше 40px
  }

  private findCurrentRowIndex(rowElements: BaseEditorComponent[]): number {
    if (rowElements.length === 0) return -1;
    
    const firstElementId = rowElements[0].id;
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].some(el => el.id === firstElementId)) {
        return i;
      }
    }
    return -1;
  }

  private hasLargeGapAboveRow(
    rowIndex: number,
    elementNodes: BaseEditorComponent[],
    editorRect: DOMRect
  ): boolean {
    if (rowIndex === 0) return true;
    
    const currentRowTop = this.getRowTop(rowIndex, elementNodes, editorRect);
    const prevRowBottom = this.getRowBottom(rowIndex - 1, elementNodes, editorRect);
    
    const gap = currentRowTop - prevRowBottom;
    return gap > 30; // Большой промежуток больше 30px
  }

  private hasLargeGapBelowRow(
    rowIndex: number,
    elementNodes: BaseEditorComponent[],
    editorRect: DOMRect
  ): boolean {
    if (rowIndex === this.elements.length - 1) return true;
    
    const currentRowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);
    const nextRowTop = this.getRowTop(rowIndex + 1, elementNodes, editorRect);
    
    const gap = nextRowTop - currentRowBottom;
    return gap > 30; // Большой промежуток больше 30px
  }

  private showEmptyFormDropIndicator(mouseX: number, mouseY: number, editorRect: DOMRect): void {
    this.indicatorOrientation = 'horizontal';
    this.dropIndicatorWidth = Math.min(300, editorRect.width - 40);
    this.dropIndicatorHeight = 3;
    this.dropIndicatorLeft = (editorRect.width - this.dropIndicatorWidth) / 2;
    this.dropIndicatorTop = Math.max(50, mouseY - 10);

    this.currentDropPosition = {
      x: this.dropIndicatorLeft,
      y: this.dropIndicatorTop,
      insertBefore: true,
      targetRowIndex: 0,
      orientation: 'horizontal',
    };

    this.showDropIndicator = true;
    this.dragStateService.setDropPosition(this.currentDropPosition);
  }





  private updateDropPositions() {
    // Recalculate when elements change
  }
  
  private updateTitleStyles(): void {
    const titleConfig = this.formProperties.titleConfig;
    if (!titleConfig) {
      this.titleStyles = {};
      return;
    }
    
    // Base styles
    this.titleStyles = {
      'display': titleConfig.visible !== false ? 'block' : 'none',
      'text-align': titleConfig.alignment || 'center',
      'font-size': titleConfig.fontSize ? `${titleConfig.fontSize}px` : '24px',
      'font-weight': typeof titleConfig.fontWeight === 'number' ? titleConfig.fontWeight.toString() : titleConfig.fontWeight || 'bold',
      'color': titleConfig.color || '#000000',
      'padding': titleConfig.padding || '8px 16px'
    };
    
    // Apply position-specific styles
    switch (titleConfig.position) {
      case 'top':
        this.titleStyles['margin'] = titleConfig.margin || '0 0 16px 0';
        this.titleStyles['order'] = '0';
        break;
      case 'bottom':
        this.titleStyles['margin'] = titleConfig.margin || '16px 0 0 0';
        this.titleStyles['order'] = '2';
        break;
      case 'left':
        this.titleStyles['margin'] = titleConfig.margin || '0 16px 0 0';
        this.titleStyles['order'] = '0';
        this.titleStyles['align-self'] = 'flex-start';
        break;
      case 'right':
        this.titleStyles['margin'] = titleConfig.margin || '0 0 0 16px';
        this.titleStyles['order'] = '0';
        this.titleStyles['align-self'] = 'flex-end';
        break;
      default:
        this.titleStyles['margin'] = titleConfig.margin || '0 0 16px 0';
        this.titleStyles['order'] = '0';
    }
    
    // Apply custom styles if provided
    if (titleConfig.style) {
      Object.assign(this.titleStyles, titleConfig.style);
    }
  }
  
  private updateFormStyles(): void {
    const formStyle = this.formProperties.formStyle;
    if (!formStyle) {
      this.formStyles = {};
      return;
    }
    
    // Helper function to format dimension values
    const formatDimension = (value: any, defaultValue: string): string => {
      if (!value) return defaultValue;
      
      // If value is an object with value and unit properties
      if (typeof value === 'object' && 'value' in value && 'unit' in value) {
        return `${value.value}${value.unit}`;
      }
      
      // If value is a string, assume it's already formatted
      if (typeof value === 'string') {
        return value;
      }
      
      // If value is a number, assume it's in pixels
      if (typeof value === 'number') {
        return `${value}px`;
      }
      
      return defaultValue;
    };
    
    this.formStyles = {
      'background-color': formStyle.backgroundColor || '#ffffff',
      'border-color': formStyle.borderColor || '#cccccc',
      'border-width': formStyle.borderWidth ? `${formStyle.borderWidth}px` : '1px',
      'border-style': formStyle.borderStyle || 'solid',
      'border-radius': formStyle.borderRadius ? `${formStyle.borderRadius}px` : '4px',
      'padding': formStyle.padding || '16px',
      'margin': formStyle.margin || '0 auto',
      'width': formatDimension(formStyle.width, '100%'),
      'height': formatDimension(formStyle.height, 'auto'),
      'max-width': formatDimension(formStyle.maxWidth, 'none'),
      'min-width': formatDimension(formStyle.minWidth, 'auto'),
      'max-height': formatDimension(formStyle.maxHeight, 'none'),
      'min-height': formatDimension(formStyle.minHeight, 'auto'),
      'box-shadow': formStyle.boxShadow || 'none',
      'font-family': formStyle.fontFamily || 'Arial, sans-serif',
      'font-size': formStyle.fontSize ? `${formStyle.fontSize}px` : '14px',
      'font-weight': typeof formStyle.fontWeight === 'number' ? formStyle.fontWeight.toString() : formStyle.fontWeight || 'normal',
      'color': formStyle.color || '#000000',
      'text-align': formStyle.textAlign || 'left',
      'line-height': formStyle.lineHeight ? `${formStyle.lineHeight}px` : 'normal',
      'letter-spacing': formStyle.letterSpacing ? `${formStyle.letterSpacing}px` : 'normal'
    };
    
    // Apply custom styles if provided
    if (this.formProperties.style) {
      Object.assign(this.formStyles, this.formProperties.style);
    }
  }
  
  private selectElementById(elementId: string): void {
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element) {
        this.elementSelectionService.selectElement(element as FormElementProperties);
        return;
      }
    }
  }
  
  /**
   * Get element properties by element ID
   */
  getElementProperties(elementId: string): FormElementProperties {
    // Find the element in our elements array
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element) {
        return element as FormElementProperties;
      }
    }
    
    // Return a default input element if not found
    return {
      id: elementId,
      type: 'input',
      label: 'Input Field',
      placeholder: 'Enter text...',
      defaultValue: '',
      required: false,
      readOnly: false,
      disabled: false,
      visible: true
    } as FormElementProperties;
  }
  
  /**
   * Handle element deletion
   */
  onDeleteElement(elementId: string): void {
    // Find and remove the element
    for (let i = 0; i < this.elements.length; i++) {
      const rowIndex = this.elements[i].findIndex(el => el.id === elementId);
      if (rowIndex !== -1) {
        this.elements[i].splice(rowIndex, 1);
        
        // If the row is now empty, remove it
        if (this.elements[i].length === 0) {
          this.elements.splice(i, 1);
        }
        
        // Remove element from state service
        this.elementStateService.removeElement(elementId);
        
        // Clear selection if the deleted element was selected
        if (this.elementSelectionService.getSelectedElement()?.id === elementId) {
          this.elementSelectionService.selectElement(null);
        }
        
        this.message.success('Element deleted successfully');
        break;
      }
    }
  }
  
  /**
   * Handle element duplication
   */
  onDuplicateElement(elementId: string): void {
    // Find the element to duplicate
    let elementToDuplicate: EditorElement | null = null;
    let rowIndex = -1;
    let colIndex = -1;
    
    for (let i = 0; i < this.elements.length; i++) {
      const index = this.elements[i].findIndex(el => el.id === elementId);
      if (index !== -1) {
        elementToDuplicate = this.elements[i][index];
        rowIndex = i;
        colIndex = index;
        break;
      }
    }
    
    if (!elementToDuplicate) {
      this.message.error('Element not found');
      return;
    }
    
    // Create a new element using the element factory's duplicate method
    const newElement = this.elementFactory.duplicateElement(elementToDuplicate);
    
    // Insert the new element after the original
    this.elements[rowIndex].splice(colIndex + 1, 0, newElement);
    
    
    // Select the new element
    this.elementSelectionService.selectElement(newElement as FormElementProperties);
    
    this.message.success('Element duplicated successfully');
  }
  
  /**
   * Handle toggle required field
   */
  onToggleRequired(data: { id: string, required: boolean }): void {
    // Find the element and update its required property
    for (const row of this.elements) {
      const element = row.find(el => el.id === data.id);
      if (element) {
        (element as any).required = data.required;
        this.elementStateService.updateElementProperties(data.id, { required: data.required });
        break;
      }
    }
    
    // Show a message
    if (data.required) {
      this.message.success('Field marked as required');
    } else {
      this.message.success('Field marked as optional');
    }
  }
  
  /**
   * Get custom element properties by element ID
   */
  getCustomElementProperties(elementId: string): Record<string, any> {
    // Find the element and return its custom properties
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element && element.customProperties) {
        return element.customProperties;
      }
    }
    return {};
  }
  
  
  /**
   * Handle inline label editing events
   */
  onLabelEdit(elementId: string, newLabel: string): void {
    // Update element in state service
    this.elementStateService.updateElementProperties(elementId, { label: newLabel });
    
    // Find the element in our local array and update it
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element) {
        element.label = newLabel;
        break;
      }
    }
  }
  
  /**
   * Handle opening element settings
   */
  onOpenElementSettings(elementId: string): void {
    // Find the element
    let selectedElement: FormElementProperties | null = null;
    
    for (const row of this.elements) {
      const element = row.find(el => el.id === elementId);
      if (element) {
        selectedElement = element as FormElementProperties;
        break;
      }
    }
    
    if (selectedElement) {
      // Select the element
      this.elementSelectionService.selectElement(selectedElement);
    }
  }
  
  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    try {
      const result = await this.formService.submitForm({
        validateBeforeSubmit: true,
        showValidationErrors: true,
        resetOnSuccess: false
      });
      
      if (result.isValid) {
        this.message.success('Form submitted successfully');
        
        // Get the submitted form data
        const formData = this.formService.getFormData();
        console.log('Form submitted with data:', formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.message.error('Form submission failed. Please check for validation errors.');
    }
  }
  
  /**
   * Reset the form
   */
  resetForm(): void {
    this.formService.resetForm({
      keepDefaultValues: true,
      clearValidationErrors: true
    });
    
    this.message.success('Form reset successfully');
  }
  
  /**
   * Validate the form
   */
  validateForm(): void {
    const result = this.formService.validateForm();
    
    if (result.isValid) {
      this.message.success('Form is valid');
    } else {
      this.message.error(`Form has ${result.errors.length} validation error(s)`);
      
      // Log validation errors for debugging
      console.log('Form validation errors:', result.errors);
    }
  }
  
  /**
   * Handle form submission from a button element
   */
  onFormSubmission(event: Event, elementId: string): void {
    // Prevent default form submission behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Check if this is a submit button
    const element = this.getElementProperties(elementId);
    if (element.type === 'button' && (element as any).htmlButtonType === 'submit') {
      this.submitForm();
    }
  }
  
  /**
   * Handle form reset from a button element
   */
  onFormReset(event: Event, elementId: string): void {
    // Prevent default form submission behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Check if this is a reset button
    const element = this.getElementProperties(elementId);
    if (element.type === 'button' && (element as any).htmlButtonType === 'reset') {
      this.resetForm();
    }
  }
}
