import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzResizableModule } from 'ng-zorro-antd/resizable';

// Library imports
import { DragStateService } from '../../core/services/drag-state.service';
import { ElementSelectionService } from '../../core/services/element-selection.service';
import { PropertyPanelService } from '../../core/services/property-panel.service';
import { ElementRegistryService } from '../../core/services/element-registry.service';
import { ElementFactory } from '../../core/factories/element-factory.service';
import { ElementStateService } from '../../core/services/element-state.service';
import { FormService } from '../../core/services/form.service';
import { EditorElement, DropPosition } from '../../models/drag-data.model';
import { FormElementProperties } from '../../models/element-properties.model';
import { FormProperties } from '../../models/form-properties.model';
import { FormConstructorService } from '../../api/form-constructor.service';

// Form element components
import { InputComponent } from '../form-elements/input.component';
import { TextareaComponent } from '../form-elements/textarea.component';
import { ButtonElementComponent } from '../form-elements/button-element/button-element.component';
import { SelectElementComponent } from '../form-elements/select-element/select-element.component';

// Library events and config
import { FormConstructorConfig } from '../../api/form-constructor-config';
import { ElementEvent } from '../../api/events/element-events';
import { FormEvent } from '../../api/events/form-events';

// Базовый интерфейс для всех элементов редактора
export interface BaseEditorComponent {
  id: string;
  getNativeElement(): HTMLElement;
  isDragged: boolean;
}

@Component({
  selector: 'lib-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzMessageModule,
    NzToolTipModule,
    NzDropDownModule,
    NzMenuModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSwitchModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzSliderModule,
    NzRateModule,
    NzUploadModule,
    NzSpinModule,
    NzAlertModule,
    NzTagModule,
    NzBadgeModule,
    NzProgressModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzCardModule,
    NzListModule,
    NzTableModule,
    NzTabsModule,
    NzCollapseModule,
    NzCarouselModule,
    NzTimelineModule,
    NzTreeModule,
    NzTreeSelectModule,
    NzCascaderModule,
    NzTransferModule,
    NzInputNumberModule,
    NzPaginationModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzStepsModule,
    NzResultModule,
    NzStatisticModule,
    NzAvatarModule,
    NzDividerModule,
    NzSpaceModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzSegmentedModule,
    NzImageModule,
    NzDrawerModule,
    NzNotificationModule,
    NzEmptyModule,
    NzAffixModule,
    NzBackTopModule,
    NzAnchorModule,
    NzCommentModule,
    NzSkeletonModule,
    NzFloatButtonModule,
    NzResizableModule,
    InputComponent,
    TextareaComponent,
    ButtonElementComponent,
    SelectElementComponent
  ]
})
export class FormBuilderComponent implements AfterViewInit, OnInit, OnDestroy {
  // Inputs for configuration
  @Input() set config(config: FormConstructorConfig) {
    this._config = { ...this._config, ...config };
    this.applyConfig();
  }
  get config(): FormConstructorConfig {
    return this._config;
  }
  private _config: FormConstructorConfig = {};
  
  @Input() sidebarCollapsed = false;
  @Input() propertyPanelCollapsed = false;
  
  // Outputs for events
  @Output() elementEvent = new EventEmitter<ElementEvent>();
  @Output() formEvent = new EventEmitter<FormEvent>();
  
  private destroy$ = new Subject<void>();
  
  // Универсальный QueryList для всех типов компонентов
  @ViewChildren('inputElement') inputElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('textareaElement') textareaElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('buttonElement') buttonElements!: QueryList<BaseEditorComponent>;
  @ViewChildren('selectElement') selectElements!: QueryList<BaseEditorComponent>;

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
    private message: NzMessageService,
    private formConstructorService: FormConstructorService
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
    // Initialize with config if provided
    if (this.config) {
      this.applyConfig();
    }
    
    // Subscribe to element property changes
    this.propertyPanelService.elementProperties$.subscribe(properties => {
      // Update elements with new properties
      this.updateElementProperties(properties);
    });

    // Load initial state from element state service
    const initialState = this.elementStateService.getCurrentState();
    this.elements = initialState.elements;
  }
  
  /**
   * Apply the configuration to the form builder
   */
  private applyConfig(): void {
    // Initialize the FormConstructorService with the configuration
    this.formConstructorService.initialize(this._config);
    
    // Apply form properties if provided
    if (this._config.defaultFormProperties) {
      // Update form properties using the available method
      Object.keys(this._config.defaultFormProperties).forEach(key => {
        this.propertyPanelService.updateFormProperty(key, (this._config.defaultFormProperties as any)[key]);
      });
    }
    
    // Apply theme configuration if provided
    if (this._config.theme) {
      this.applyThemeConfig(this._config.theme);
    }
    
    // Apply behavior configuration if provided
    if (this._config.behavior) {
      this.applyBehaviorConfig(this._config.behavior);
    }
    
    // Apply element configuration if provided
    if (this._config.elements) {
      this.applyElementConfig(this._config.elements);
    }
    
    // Apply form configuration if provided
    if (this._config.form) {
      this.applyFormConfig(this._config.form);
    }
  }
  
  /**
   * Apply theme configuration
   */
  private applyThemeConfig(themeConfig: FormConstructorConfig['theme']): void {
    if (!themeConfig) return;
    
    // Apply theme styles to the form
    const styles: Record<string, string> = {};
    
    if (themeConfig.primaryColor) {
      styles['--form-constructor-primary-color'] = themeConfig.primaryColor;
    }
    
    if (themeConfig.secondaryColor) {
      styles['--form-constructor-secondary-color'] = themeConfig.secondaryColor;
    }
    
    if (themeConfig.backgroundColor) {
      styles['--form-constructor-background-color'] = themeConfig.backgroundColor;
    }
    
    if (themeConfig.textColor) {
      styles['--form-constructor-text-color'] = themeConfig.textColor;
    }
    
    if (themeConfig.borderColor) {
      styles['--form-constructor-border-color'] = themeConfig.borderColor;
    }
    
    if (themeConfig.borderRadius) {
      styles['--form-constructor-border-radius'] = typeof themeConfig.borderRadius === 'number'
        ? `${themeConfig.borderRadius}px`
        : themeConfig.borderRadius;
    }
    
    if (themeConfig.fontFamily) {
      styles['--form-constructor-font-family'] = themeConfig.fontFamily;
    }
    
    if (themeConfig.fontSize) {
      styles['--form-constructor-font-size'] = typeof themeConfig.fontSize === 'number'
        ? `${themeConfig.fontSize}px`
        : themeConfig.fontSize;
    }
    
    // Apply styles to the form builder element
    Object.assign(this.elementRef.nativeElement.style, styles);
  }
  
  /**
   * Apply behavior configuration
   */
  private applyBehaviorConfig(behaviorConfig: FormConstructorConfig['behavior']): void {
    if (!behaviorConfig) return;
    
    // Apply behavior settings to services
    // This will be implemented when the services are updated to support configuration
  }
  
  /**
   * Apply element configuration
   */
  private applyElementConfig(elementConfig: FormConstructorConfig['elements']): void {
    if (!elementConfig) return;
    
    // Apply element settings to services
    // This will be implemented when the services are updated to support configuration
  }
  
  /**
   * Apply form configuration
   */
  private applyFormConfig(formConfig: FormConstructorConfig['form']): void {
    if (!formConfig) return;
    
    // Apply form settings to services
    // This will be implemented when the services are updated to support configuration
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
    event: Event,
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
  onElementClick(elementId: string, event: Event) {
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
    
    // Emit element event
    if (selectedElement) {
      this.elementEvent.emit({
        type: 'element:select',
        elementId: elementId,
        element: selectedElement,
        elementType: selectedElement.type,
        timestamp: new Date(),
        id: `event-${Date.now()}`,
        selectionMethod: 'click'
      });
    }
    
    // Prevent drag when clicking to select
    event.stopPropagation();
    event.preventDefault();
  }
  
  // Handle click on empty editor area to deselect
  onEditorClick(event: Event) {
    // Check if the click is on the editor background (not on an element)
    if (event.target === this.elementRef.nativeElement ||
        (event.target as HTMLElement).classList.contains('editor-content')) {
      this.elementSelectionService.deselectElement();
      
      // Emit form event
      this.formEvent.emit({
        type: 'form:stateChange',
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        previousState: { selectedElement: this.elementSelectionService.getSelectedElement() },
        newState: { selectedElement: null },
        changeType: 'element_update'
      });
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
      
      // Emit element event
      this.elementEvent.emit({
        type: 'element:create',
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        elementId: newElement.id,
        elementType: newElement.type,
        element: newElement as FormElementProperties,
        position: { rowIndex: 0, colIndex: 0 },
        userInitiated: true
      });
      
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
    
    // Emit element event
    this.elementEvent.emit({
      type: 'element:create',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      elementId: newElement.id,
      elementType: newElement.type,
      element: newElement as FormElementProperties,
      position: { rowIndex: targetRowIndex, colIndex: targetColIndex },
      userInitiated: true
    });
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
    
    // Emit element event
    this.elementEvent.emit({
      type: 'element:drag',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      elementId: existingElement.id,
      elementType: existingElement.type,
      dragType: 'end',
      currentPosition: { x: 0, y: 0 },
      originalPosition: { rowIndex: sourceRowIndex, colIndex: sourceColIndex },
      targetPosition: { rowIndex: targetRowIndex, colIndex: targetColIndex }
    });
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
  onDeleteElement(event: Event): void {
    const elementId = (event as any).elementId || (event.target as any).elementId;
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
        
        // Emit element event
        this.elementEvent.emit({
          type: 'element:delete',
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          elementId: elementId,
          elementType: 'unknown', // We don't have the element type here
          element: { id: elementId } as FormElementProperties,
          position: { rowIndex, colIndex: rowIndex },
          confirmed: true,
          reason: 'user_action'
        });
        
        this.message.success('Element deleted successfully');
        break;
      }
    }
  }
  
  /**
   * Handle element duplication
   */
  onDuplicateElement(event: Event): void {
    const elementId = (event as any).elementId || (event.target as any).elementId;
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
    
    // Emit element event
    this.elementEvent.emit({
      type: 'element:duplicate',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      elementId: newElement.id,
      elementType: newElement.type,
      originalElement: elementToDuplicate as FormElementProperties,
      duplicatedElement: newElement as FormElementProperties,
      position: { rowIndex, colIndex: colIndex + 1 }
    });
    
    this.message.success('Element duplicated successfully');
  }
  
  /**
   * Handle toggle required field
   */
  onToggleRequired(event: Event): void {
    const data = (event as any).data || { id: '', required: false };
    // Update the required property in the property panel service
    this.propertyPanelService.updateElementProperty(data.id, 'required', data.required);
    
    // Emit element event
    this.elementEvent.emit({
      type: 'element:update',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      elementId: data.id,
      elementType: 'unknown', // We don't have the element type here
      propertyName: 'required',
      oldValue: !data.required,
      newValue: data.required,
      userInitiated: true
    });
    
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
  onLabelEdit(elementId: string, event: Event): void {
    const newLabel = (event as any).value || (event.target as any).value || '';
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
    
    // Emit element event
    this.elementEvent.emit({
      type: 'element:update',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      elementId: elementId,
      elementType: 'unknown', // We don't have the element type here
      propertyName: 'label',
      oldValue: '', // We don't have the old value here
      newValue: newLabel,
      userInitiated: true
    });
  }
  
  /**
   * Handle opening element settings
   */
  onOpenElementSettings(event: Event): void {
    const elementId = (event as any).elementId || (event.target as any).elementId;
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
      
      // Emit element event
      if (selectedElement) {
        this.elementEvent.emit({
          type: 'element:select',
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          elementId: elementId,
          elementType: selectedElement.type,
          element: selectedElement,
          selectionMethod: 'programmatic'
        });
      }
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
        // Get the submitted form data
        const formData = this.formService.getFormData();
        
        // Emit form event
        this.formEvent.emit({
          type: 'form:submit',
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          formData: formData,
          success: true
        });
        
        this.message.success('Form submitted successfully');
        console.log('Form submitted with data:', formData);
      } else {
        // Emit form event
        this.formEvent.emit({
          type: 'form:submit',
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          formData: this.formService.getFormData(),
          success: false,
          error: 'Form validation failed',
          validationResult: result
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Emit form event
      this.formEvent.emit({
        type: 'form:error',
        id: `event-${Date.now()}`,
        timestamp: new Date(),
        message: 'Form submission failed. Please check for validation errors.',
        severity: 'error',
        recoverable: true
      });
      
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
    
    // Emit form event
    this.formEvent.emit({
      type: 'form:reset',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
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
    
    // Emit form event
    this.formEvent.emit({
      type: 'form:validate',
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      validationResult: result,
      autoTriggered: false
    });
    
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