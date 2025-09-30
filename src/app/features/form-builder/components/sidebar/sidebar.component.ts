import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { DragStateService } from '../../../../core/services/drag-state.service';
import { ElementRegistryService } from '../../../../core/services/element-registry.service';
import { PropertyPanelService } from '../../../../core/services/property-panel.service';
import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { DragData } from '../../../../core/models/drag-data.model';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzToolTipModule,
    NzCollapseModule
  ],
  template: `
    <div class="sidebar">
      <h3>Components</h3>
      
      <nz-collapse>
        <nz-collapse-panel
          *ngFor="let category of elementCategories"
          [nzHeader]="category.displayName"
          [nzActive]="category.expanded">
          <div
            *ngFor="let element of category.elements"
            class="draggable-item"
            [class.dragging]="isDragging && currentDragType === element.type"
            (mousedown)="onDragStart($event, element.type)">
            <span nz-icon [nzType]="element.icon" class="element-icon"></span>
            <span class="element-name">{{ element.displayName }}</span>
          </div>
        </nz-collapse-panel>
      </nz-collapse>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 200px;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 16px;
      height: 100%;
      overflow-y: auto;
    }

    h3 {
      margin: 0 0 16px 0;
      color: #495057;
      font-size: 14px;
      font-weight: 600;
    }

    .draggable-item {
      width: 100%;
      height: 40px;
      background: #e9ecef;
      border: 2px solid #ced4da;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      cursor: grab;
      font-weight: 500;
      color: #495057;
      transition: all 0.2s ease;
      user-select: none;
      margin-bottom: 10px;
    }

    .draggable-item:hover {
      background: #dee2e6;
      border-color: #adb5bd;
    }

    .draggable-item.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }

    .element-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .element-name {
      flex: 1;
    }

    /* Custom styles for collapse panel */
    ::ng-deep .ant-collapse {
      background: transparent;
      border: none;
    }

    ::ng-deep .ant-collapse-item {
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 8px;
    }

    ::ng-deep .ant-collapse-header {
      padding: 8px 12px !important;
      background: #e9ecef;
      border-radius: 4px;
      font-weight: 500;
      color: #495057;
    }

    ::ng-deep .ant-collapse-content-box {
      padding: 8px 0 !important;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  isDragging = false;
  currentDragType: string | null = null;
  elementCategories: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private dragStateService: DragStateService,
    private elementRegistryService: ElementRegistryService,
    private propertyPanelService: PropertyPanelService,
    private elementSelectionService: ElementSelectionService
  ) {}

  ngOnInit(): void {
    // Get element categories from the element registry service
    this.elementCategories = this.elementRegistryService.getElementCategories();
    
    // Make sure each category has an expanded property
    this.elementCategories.forEach(category => {
      if (category.expanded === undefined) {
        category.expanded = true;
      }
    });
    
    // Subscribe to element selection changes to update the sidebar state
    this.elementSelectionService.selectedElement$
      .pipe(takeUntil(this.destroy$))
      .subscribe(element => {
        // Update sidebar state based on selection if needed
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragStart(event: MouseEvent, elementType: string) {
    this.isDragging = true;
    this.currentDragType = elementType;
    
    // Get element definition from registry
    const elementDef = this.elementRegistryService.getElementDefinition(elementType);
    
    const dragData: DragData = {
      type: elementType as 'input' | 'textarea' | 'select' | 'button' | 'existing' | 'element',
      elementType: elementType,
      elementDefinition: elementDef
    };
    
    this.dragStateService.setDragData(dragData);

    const dragImage = (event.target as HTMLElement).cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.width = '120px';
    document.body.appendChild(dragImage);

    const moveListener = (e: MouseEvent) => {
      dragImage.style.left = e.clientX + 10 + 'px';
      dragImage.style.top = e.clientY + 10 + 'px';
    };

    const upListener = () => {
      this.isDragging = false;
      this.currentDragType = null;
      this.dragStateService.clearDragData();
      this.dragStateService.notifyDragEnd();
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      document.body.removeChild(dragImage);
    };

    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);

    event.preventDefault();
  }
}