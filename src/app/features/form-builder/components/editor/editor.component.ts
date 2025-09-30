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
import { PropertyPanelService } from '../../../../core/services/property-panel.service';
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
  @Input() propertyPanelCollapsed = false;
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
    private propertyPanelService: PropertyPanelService,
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

    // Subscribe to form properties changes
    this.propertyPanelService.formProperties$.subscribe(properties => {
      this.formProperties = properties;
      this.updateTitleStyles();
      this.updateFormStyles();
    });

    // Subscribe to element state changes
    this.elementStateService.getState$().subscribe(state => {
      // Update elements from state
      this.elements = state.elements;
    });
  }

  ngOnInit() {
    // Subscribe to element property changes
    this.propertyPanelService.elementProperties$.subscribe(properties => {
      // Update elements with new properties
      this.updateElementProperties(properties);
    });

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

  // Универсальный метод для получения всех элементов редактора
  private getAllEditorElements(): BaseEditorComponent[] {
    const allElements: BaseEditorComponent[] = [];
    
    // Добавляем input элементы
    allElements.push(...this.inputElements.toArray());
    
    // Добавляем textarea элементы
    allElements.push(...this.textareaElements.toArray());
    
    // Добавляем button элементы
    allElements.push(...this.buttonElements.toArray());
    
    // Добавляем select элементы
    allElements.push(...this.selectElements.toArray());
    
    return allElements;
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

  private calculateDropPosition(
    mouseX: number,
    mouseY: number,
    editorRect: DOMRect
  ) {
    const elementNodes = this.getAllEditorElements();

    // Handle empty form case
    if (this.elements.length === 0 || (this.elements.length === 1 && this.elements[0].length === 0)) {
      this.showEmptyFormDropIndicator(mouseX, mouseY, editorRect);
      return;
    }

    if (this.dragData?.type === 'input' || this.dragData?.type === 'textarea' ||
        this.dragData?.type === 'select' || this.dragData?.type === 'button') {
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
    // Сначала проверяем промежутки между строками
    for (let rowIndex = 0; rowIndex < this.elements.length - 1; rowIndex++) {
      const currentRowBottom = this.getRowBottom(rowIndex, elementNodes, editorRect);
      const nextRowTop = this.getRowTop(rowIndex + 1, elementNodes, editorRect);
      
      // Если курсор в промежутке между строками
      if (mouseY >= currentRowBottom && mouseY <= nextRowTop) {
        return rowIndex; // Возвращаем индекс текущей строки для обработки промежутка
      }
    }
    
    // Затем проверяем сами строки
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
    const allElementNodes = this.getAllEditorElements();
    
    if (rowElements.length > 0) {
      const firstElement = rowElements[0];
      const lastElement = rowElements[rowElements.length - 1];

      const firstRect = firstElement.getNativeElement().getBoundingClientRect();
      const lastRect = lastElement.getNativeElement().getBoundingClientRect();

      const rowTop = firstRect.top - editorRect.top;
      const rowBottom = lastRect.bottom - editorRect.top;

      // Проверяем, находимся ли мы между строками
      const rowIndex = this.findCurrentRowIndex(rowElements);
      
      if (mouseY - rowTop < 15) {
        // Проверяем, есть ли строка выше
        if (rowIndex > 0 && !this.hasLargeGapAboveRow(rowIndex, allElementNodes, editorRect)) {
          return { type: 'horizontal', position: 'between-rows', currentRowIndex: rowIndex, isAbove: true };
        }
        return { type: 'horizontal', position: 'top' };
      }

      if (rowBottom - mouseY < 15) {
        // Проверяем, есть ли строка ниже
        if (rowIndex < this.elements.length - 1 && !this.hasLargeGapBelowRow(rowIndex, allElementNodes, editorRect)) {
          return { type: 'horizontal', position: 'between-rows', currentRowIndex: rowIndex, isAbove: false };
        }
        return { type: 'horizontal', position: 'bottom' };
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

    // Затем проверяем края элементов (только если нет соседних элементов)
    for (let i = 0; i < rowElements.length; i++) {
      const element = rowElements[i];
      const rect = element.getNativeElement().getBoundingClientRect();
      const elementLeft = rect.left - editorRect.left;
      const elementRight = rect.right - editorRect.left;
      const elementTop = rect.top - editorRect.top;
      const elementBottom = rect.bottom - editorRect.top;

      // Левый край (только если это первый элемент или есть большой промежуток)
      if (
        Math.abs(mouseX - elementLeft) < 20 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom &&
        (i === 0 || this.hasLargeGapBefore(i, rowElements, editorRect))
      ) {
        return { type: 'vertical', position: 'left', element };
      }

      // Правый край (только если это последний элемент или есть большой промежуток)
      if (
        Math.abs(mouseX - elementRight) < 20 &&
        mouseY >= elementTop &&
        mouseY <= elementBottom &&
        (i === rowElements.length - 1 || this.hasLargeGapAfter(i, rowElements, editorRect))
      ) {
        return { type: 'vertical', position: 'right', element };
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
    // Статичные размеры
    this.dropIndicatorWidth = editorRect.width - 40;
    this.dropIndicatorHeight = 3;
    this.dropIndicatorLeft = (editorRect.width - this.dropIndicatorWidth) / 2;

    if (positionInRow.position === 'between-rows') {
      // Отображаем индикатор по центру между строками
      const currentRowIndex = positionInRow.currentRowIndex;
      const currentRowBottom = this.getRowBottom(currentRowIndex, elementNodes, editorRect);
      
      if (positionInRow.isAbove) {
        // Между текущей и предыдущей строкой
        const prevRowBottom = this.getRowBottom(currentRowIndex - 1, elementNodes, editorRect);
        const currentRowTop = this.getRowTop(currentRowIndex, elementNodes, editorRect);
        this.dropIndicatorTop = (prevRowBottom + currentRowTop) / 2;
        
        this.currentDropPosition = {
          x: this.dropIndicatorLeft,
          y: this.dropIndicatorTop,
          insertBefore: true,
          targetRowIndex: currentRowIndex,
          orientation: 'horizontal',
        };
      } else {
        // Между текущей и следующей строкой
        const nextRowTop = this.getRowTop(currentRowIndex + 1, elementNodes, editorRect);
        this.dropIndicatorTop = (currentRowBottom + nextRowTop) / 2;
        
        this.currentDropPosition = {
          x: this.dropIndicatorLeft,
          y: this.dropIndicatorTop,
          insertBefore: false,
          targetRowIndex: currentRowIndex,
          orientation: 'horizontal',
        };
      }
    } else if (positionInRow.position === 'top') {
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
    // Use the element factory to create a new element
    const newElement = this.elementFactory.createElement(elementType);

    // Initialize element properties in the property panel service
    this.propertyPanelService.updateElementProperty(newElement.id, 'id', newElement.id);
    this.propertyPanelService.updateElementProperty(newElement.id, 'type', newElement.type);
    
    // Set all default properties
    Object.keys(newElement).forEach(key => {
      if (key !== 'id' && key !== 'type') {
        this.propertyPanelService.updateElementProperty(newElement.id, key, (newElement as any)[key]);
      }
    });

    if (!this.currentDropPosition) {
      if (this.elements.length === 0 || (this.elements.length === 1 && this.elements[0].length === 0)) {
        // Add element to state service only - the editor component will update through the subscription
        this.elementStateService.addElement(newElement, 0, 0);
      } else {
        // Add element to state service only - the editor component will update through the subscription
        this.elementStateService.addElement(newElement, 0, this.elements[0].length);
      }
      // Select the newly created element
      this.elementSelectionService.selectElement(newElement as FormElementProperties);
      return;
    }

    // Use the state service to add the element - the editor component will update through the subscription
    // Calculate the target position based on currentDropPosition
    let targetRowIndex = 0;
    let targetColIndex = 0;
    
    if (this.currentDropPosition) {
      targetRowIndex = this.currentDropPosition.targetRowIndex !== undefined ? this.currentDropPosition.targetRowIndex : 0;
      
      if (this.currentDropPosition.orientation === 'horizontal') {
        // For horizontal drop, create new row
        const rowIndex = this.currentDropPosition.targetRowIndex ?? 0;
        if (this.currentDropPosition.insertBefore) {
          targetRowIndex = rowIndex;
        } else {
          targetRowIndex = rowIndex + 1;
        }
        targetColIndex = 0;
      } else if (this.currentDropPosition.orientation === 'vertical' && this.currentDropPosition.targetId) {
        const rowIndex = this.currentDropPosition.targetRowIndex;
        if (rowIndex !== undefined && this.elements[rowIndex]) {
          const colIndex = this.elements[rowIndex].findIndex(
            (el: EditorElement) => el.id === this.currentDropPosition!.targetId
          );
          if (colIndex !== -1) {
            targetColIndex = this.currentDropPosition.insertBefore ? colIndex : colIndex + 1;
          } else {
            targetColIndex = this.elements[rowIndex].length;
          }
        }
      }
    }
    
    this.insertElementViaStateService(newElement, targetRowIndex, targetColIndex);
    // Select the newly created element
    this.elementSelectionService.selectElement(newElement as FormElementProperties);
  }

  private insertElement(newElement: EditorElement) {
    if (!this.currentDropPosition) return;

    let targetRowIndex = this.currentDropPosition.targetRowIndex || 0;
    let targetColIndex = 0;

    if (
      this.currentDropPosition.orientation === 'vertical' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;

      if (!this.elements[rowIndex]) {
        this.elements[rowIndex] = [];
      }

      if (this.currentDropPosition.targetId) {
        const colIndex = this.elements[rowIndex].findIndex(
          (el) => el.id === this.currentDropPosition!.targetId
        );
        if (colIndex !== -1) {
          if (this.currentDropPosition.insertBefore) {
            targetColIndex = colIndex;
          } else {
            targetColIndex = colIndex + 1;
          }
        } else {
          targetColIndex = this.elements[rowIndex].length;
        }
      } else {
        targetColIndex = 0;
      }
    } else if (
      this.currentDropPosition.orientation === 'horizontal' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;
      if (this.currentDropPosition.insertBefore) {
        targetRowIndex = rowIndex;
      } else {
        targetRowIndex = rowIndex + 1;
      }
      targetColIndex = 0;
    }

    // Use the state service to add the element - the editor component will update through the subscription
    this.insertElementViaStateService(newElement, targetRowIndex, targetColIndex);
  }

  private insertElementViaStateService(newElement: EditorElement, targetRowIndex: number, targetColIndex: number) {
    // Add element to state service only - the editor component will update through the subscription
    this.elementStateService.addElement(newElement, targetRowIndex, targetColIndex);
  }

  private moveExistingElement() {
    if (!this.currentDropPosition || !this.dragData) return;

    let existingElement: EditorElement | null = null;
    let sourceRowIndex = -1;
    let sourceColIndex = -1;
    
    // Find the element in the current elements array
    for (let rowIndex = 0; rowIndex < this.elements.length; rowIndex++) {
      const colIndex = this.elements[rowIndex].findIndex(
        (el: EditorElement) => el.id === this.dragData.id
      );
      if (colIndex !== -1) {
        existingElement = this.elements[rowIndex][colIndex];
        sourceRowIndex = rowIndex;
        sourceColIndex = colIndex;
        break;
      }
    }

    if (!existingElement) return;

    let targetRowIndex = this.currentDropPosition.targetRowIndex !== undefined ? this.currentDropPosition.targetRowIndex : 0;
    let targetColIndex = 0;

    if (this.currentDropPosition.orientation === 'horizontal') {
      // For horizontal drop, create new row
      const rowIndex = this.currentDropPosition.targetRowIndex ?? 0;
      if (this.currentDropPosition.insertBefore) {
        targetRowIndex = rowIndex;
      } else {
        targetRowIndex = rowIndex + 1;
      }
      targetColIndex = 0;
    } else if (
      this.currentDropPosition.orientation === 'vertical' &&
      this.currentDropPosition.targetRowIndex !== undefined
    ) {
      const rowIndex = this.currentDropPosition.targetRowIndex;

      if (this.currentDropPosition.targetId) {
        const colIndex = this.elements[rowIndex]?.findIndex(
          (el: EditorElement) => el.id === this.currentDropPosition!.targetId
        );
        if (colIndex !== -1 && colIndex !== undefined) {
          targetColIndex = this.currentDropPosition.insertBefore ? colIndex : colIndex + 1;
        } else {
          targetColIndex = this.elements[rowIndex]?.length || 0;
        }
      } else {
        targetColIndex = 0;
      }
    }
    
    // Use the state service to move the element - the editor component will update through the subscription
    this.elementStateService.moveElement(existingElement.id, targetRowIndex, targetColIndex);
    
    // After moving the element, ensure it remains selected
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
    // First check if we have properties in the property panel service
    const serviceProperties = this.propertyPanelService.getElementProperties(elementId);
    if (serviceProperties) {
      return serviceProperties;
    }
    
    // If not in service, find the element in our elements array
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
    
    // Initialize element properties in the property panel service
    this.propertyPanelService.updateElementProperty(newElement.id, 'id', newElement.id);
    this.propertyPanelService.updateElementProperty(newElement.id, 'type', newElement.type);
    
    // Set all properties
    Object.keys(newElement).forEach(key => {
      if (key !== 'id' && key !== 'type') {
        this.propertyPanelService.updateElementProperty(newElement.id, key, (newElement as any)[key]);
      }
    });
    
    // Select the new element
    this.elementSelectionService.selectElement(newElement as FormElementProperties);
    
    this.message.success('Element duplicated successfully');
  }
  
  /**
   * Handle toggle required field
   */
  onToggleRequired(data: { id: string, required: boolean }): void {
    // Update the required property in the property panel service
    this.propertyPanelService.updateElementProperty(data.id, 'required', data.required);
    
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
    // Get custom properties from the property panel service
    return this.propertyPanelService.getCustomElementProperty(elementId, '') || {};
  }
  
  /**
   * Update element properties when they change in the property panel
   */
  private updateElementProperties(properties: Record<string, FormElementProperties>): void {
    // Update our local elements array with the new properties
    for (const row of this.elements) {
      for (let i = 0; i < row.length; i++) {
        const element = row[i];
        if (properties[element.id]) {
          // Create a new element object with merged properties
          const updatedElement: EditorElement = {
            ...element,
            ...properties[element.id]
          } as EditorElement;
          
          // Update custom properties if they exist
          if (properties[element.id].customProperties) {
            if (!updatedElement.customProperties) {
              updatedElement.customProperties = {};
            }
            Object.assign(updatedElement.customProperties, properties[element.id].customProperties);
          }
          
          // Replace the element in the array
          row[i] = updatedElement;
        }
      }
    }
  }
  
  /**
   * Handle inline label editing events
   */
  onLabelEdit(elementId: string, newLabel: string): void {
    // Update the element's label property
    this.propertyPanelService.updateElementProperty(elementId, 'label', newLabel);
    
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
      // Select the element to show its properties in the property panel
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
