import { Component, signal, computed, ElementRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilderService } from '../../../services/form-builder.service';
import { StateManagementService } from '../../services/state-management.service';
import { DragDropService } from '../../services/drag-drop.service';
import { DroppedComponent, DropZoneState, ComponentType } from '../../../core/models/component.model';
import { EditorToolbarComponent } from './editor-toolbar/editor-toolbar.component';
import { FormElementComponent } from './form-elements/form-element.component';
import { DragGhostComponent } from './drag-ghost/drag-ghost.component';

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList, EditorToolbarComponent, FormElementComponent, DragGhostComponent],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.css'
})
export class EditorPanelComponent implements OnInit, OnDestroy {
  public builder = inject(FormBuilderService);
  public stateManagementService = inject(StateManagementService);
  public dragDropService = inject(DragDropService);

  @ViewChild('visibleCanvas', { static: false }) public visibleCanvas!: ElementRef<HTMLElement>;
  @ViewChild('invisibleCanvas', { static: false }) invisibleCanvas!: ElementRef<HTMLElement>;
  @ViewChild(DragGhostComponent) public dragGhostComponent?: DragGhostComponent;

  // Сигналы из сервиса
  droppedComponents = this.stateManagementService.components;
  selectedComponentId = this.builder.selectedComponentId;
  selectedContainerId = signal<string | null>(null);
  isCanvasHovered = this.builder.isCanvasHovered;
  canvasDropZone = this.builder.canvasDropZone;

  updateTimeout: any;

  // Методы для шаблона
  getDropZone(id: string) { return this.builder.getDropZone(id); }
  getHoverState(id: string) { return this.builder.getHoverState(id); }

  // Для шаблона
  components() { 
    const comps = this.droppedComponents();
    console.log('📋 components() called, returning:', comps.length, 'components');
    return comps;
  }
  hasComponents() { 
    const hasComps = this.droppedComponents().length > 0;
    console.log('📋 hasComponents() called, returning:', hasComps);
    return hasComps;
  }

  ngOnInit(): void {
    console.log('🚀 EditorPanelComponent initialized');
    console.log('📋 Initial components count:', this.droppedComponents().length);
    console.log('📋 StateManagement components count:', this.stateManagementService.components().length);
    this.setupPropertyListener();
    
    // Synchronize drag layer with static layer after initialization
    setTimeout(() => {
      this.synchronizeLayers();
    }, 100);
  }

  ngOnDestroy(): void {
    this.cleanupDragEffects();
  }

  // ==================== ПРОСТАЯ ЛОГИКА DRAG & DROP ====================

  private isDragging = signal(false);
  private dropIndicator = signal<HTMLElement | null>(null);
  private currentDropTarget: {
    containerId: string | null;
    layout: 'row' | 'column';
    index: number;
    stripeRect: { left: number; top: number; width: number; height: number };
  } | null = null;
  
  // Track if drag is in progress to disable other drag operations
  public dragInProgress = signal(false);
  
  onDragStarted(event: any) {
    console.log('🎯 Drag started:', event);
    this.isDragging.set(true);
    this.dragInProgress.set(true);
    
    // Initialize drag with drag-drop service
    this.dragDropService.startDrag(event);
    
    // Set up drag ghost component
    if (this.dragGhostComponent) {
      this.dragGhostComponent.setVisible(true);
      this.dragGhostComponent.setMiniPlaqueVisible(true);
      
      // Get component info and set mini plaque content
      const dragData = event.source?.item?.data;
      if (dragData) {
        const { icon, label } = this.getComponentIconAndLabel(dragData);
        this.dragGhostComponent.setMiniPlaqueContent(icon, label);
      }
    }
    
    // Handle canvas element dragging (make semi-transparent)
    const dragData = event.source?.item?.data;
    if (dragData && dragData.id) {
      const visibleComponent = this.visibleCanvas?.nativeElement.querySelector(`[data-component-id="${dragData.id}"]`);
      if (visibleComponent) {
        visibleComponent.classList.add('dragging');
        (visibleComponent as HTMLElement).style.opacity = '0.5';
      }
    }
    
    this.hideCdkPlaceholder();
  }

  onDragMoved(event: any) {
    if (!this.isDragging()) return;
    if (!event?.event) return;

    const pointerEvent = event.event instanceof PointerEvent
      ? event.event
      : (event.event?.originalEvent instanceof PointerEvent ? event.event.originalEvent : null);

    if (!pointerEvent) return;

    const visibleCanvas = this.visibleCanvas?.nativeElement;
    if (!visibleCanvas) return;

    // Update mini plaque to follow the pointer
    if (this.dragGhostComponent) {
      this.dragGhostComponent.updateMiniPlaquePosition(pointerEvent.clientX, pointerEvent.clientY);
      this.dragGhostComponent.setVisible(true);
      this.dragGhostComponent.setMiniPlaqueVisible(true);
    }

    // Use drag-drop service to find drop target
    const dropTarget = this.dragDropService.getCurrentDropTarget(pointerEvent.clientX, pointerEvent.clientY);
    
    if (dropTarget && this.dragGhostComponent) {
      // Update insertion strip based on drop target
      const { rect } = dropTarget.position;
      
      // Store drop target for drop event
      this.currentDropTarget = {
        containerId: dropTarget.containerId,
        layout: dropTarget.layout,
        index: dropTarget.position.index,
        stripeRect: rect
      };
    }

    // Auto-scroll near canvas edges
    const canvasRect = visibleCanvas.getBoundingClientRect();
    const edge = 24;
    const scrollStep = 16;
    
    if (pointerEvent.clientY < canvasRect.top + edge) {
      visibleCanvas.scrollBy({ top: -scrollStep, behavior: 'smooth' });
    } else if (pointerEvent.clientY > canvasRect.bottom - edge) {
      visibleCanvas.scrollBy({ top: scrollStep, behavior: 'smooth' });
    }
    
    if (pointerEvent.clientX < canvasRect.left + edge) {
      visibleCanvas.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    } else if (pointerEvent.clientX > canvasRect.right - edge) {
      visibleCanvas.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  }

  onDrop(event: CdkDragDrop<DroppedComponent[]>) {
    console.log('🎯 DROP EVENT:', event);
    const dragData = event.item?.data;

    // Hide visuals
    if (this.dragGhostComponent) {
      this.dragGhostComponent.setVisible(false);
      this.dragGhostComponent.setMiniPlaqueVisible(false);
      this.dragGhostComponent.setBlueStripVisible(false);
    }
    this.dragInProgress.set(false);

    if (!dragData) {
      console.warn('❌ No drag data');
      return;
    }

    // Remove dragging class from visible component
    if (dragData.id) {
      const visibleComponent = this.visibleCanvas?.nativeElement.querySelector(`[data-component-id="${dragData.id}"]`);
      visibleComponent?.classList.remove('dragging');
    }

    // Resolve target (fallback to root end if none)
    const target = this.currentDropTarget || {
      containerId: null,
      layout: 'column' as const,
      index: this.components().length,
      stripeRect: { left: 0, top: 0, width: 0, height: 0 }
    };

    // Helpers (scoped)
    const removeById = (list: DroppedComponent[], id: string): { list: DroppedComponent[]; removed: DroppedComponent | null } => {
      const out: DroppedComponent[] = [];
      let removed: DroppedComponent | null = null;
      for (const item of list) {
        if (item.id === id) {
          removed = item;
          continue;
        }
        if (item.children?.length) {
          const res = removeById(item.children, id);
          if (res.removed) removed = res.removed;
          out.push({ ...item, children: res.list });
        } else {
          out.push(item);
        }
      }
      return { list: out, removed };
    };
    
    const insertIntoContainer = (list: DroppedComponent[], containerId: string | null, index: number, comp: DroppedComponent): DroppedComponent[] => {
      if (containerId === null) {
        const copy = [...list];
        const i = Math.max(0, Math.min(index, copy.length));
        copy.splice(i, 0, comp);
        return copy;
      }
      return list.map(item => {
        if (item.id === containerId) {
          const children = [...(item.children || [])];
          const i = Math.max(0, Math.min(index, children.length));
          children.splice(i, 0, comp);
          return { ...item, children };
        }
        if (item.children?.length) {
          return { ...item, children: insertIntoContainer(item.children, containerId, index, comp) };
        }
        return item;
      });
    };

    let updatedComponents = this.stateManagementService.components();

    if (typeof dragData === 'string' && event.previousContainer.id.includes('sidebar')) {
      // Sidebar -> create new and insert at computed target
      const newComponent = this.createComponent(dragData);
      updatedComponents = insertIntoContainer(updatedComponents, target.containerId, target.index, newComponent);
    } else if (dragData.id) {
      // Move existing component (id-based)
      const removedRes = removeById(updatedComponents, dragData.id);
      const moved = removedRes.removed;
      updatedComponents = removedRes.list;

      if (!moved) {
        console.warn('❌ Could not locate component being moved, id:', dragData.id);
        return;
      }

      // Prevent inserting into itself or its descendants
      if (target.containerId === moved.id || (target.containerId && this.isDescendantComponent(moved.id, target.containerId))) {
        console.warn('⛔ Prevented inserting a component into itself or its descendants');
        return;
      }

      updatedComponents = insertIntoContainer(updatedComponents, target.containerId, target.index, moved);
    }

    this.stateManagementService.updateState({ components: updatedComponents });

    // Resync layers and trigger preview update
    setTimeout(() => this.synchronizeLayers(), 50);
    this.debouncedPreviewUpdate();

    // Clear target
    this.currentDropTarget = null;
  }

  // Создание компонента
  private createComponent(type: string): DroppedComponent {
    console.log('🏗️ Creating component of type:', type);
    
    const newComponent: DroppedComponent = {
      id: this.generateId(),
      type: type as ComponentType,
      label: this.getComponentLabel(type),
      properties: this.getDefaultProperties(type),
      children: type === 'container' ? [] : undefined,
      parentId: null
    };
    
    console.log('🏗️ Created component:', newComponent);
    return newComponent;
  }

  /**
   * Check if candidateId node is inside subtree of parentId node
   */
  private isDescendantComponent(parentId: string, candidateId: string, list: DroppedComponent[] = this.components()): boolean {
    const findNode = (id: string, nodes: DroppedComponent[]): DroppedComponent | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children?.length) {
          const f = findNode(id, n.children);
          if (f) return f;
        }
      }
      return null;
    };

    const parent = findNode(parentId, list);
    if (!parent) return false;

    const walk = (node: DroppedComponent): boolean => {
      if (node.id === candidateId) return true;
      if (node.children?.length) {
        return node.children.some(child => walk(child));
      }
      return false;
    };

    if (!parent.children?.length) return false;
    return parent.children.some(child => walk(child));
  }

  /**
   * External setter from sidebar drag to update the computed drop target and draw stripe
   */
  public setExternalDropTarget(target: {
    containerId: string | null;
    layout: 'row' | 'column';
    index: number;
    stripeRect: { left: number; top: number; width: number; height: number };
  }): void {
    this.currentDropTarget = target;

    if (this.dragGhostComponent) {
      const isHorizontal = target.layout === 'column';
      this.dragGhostComponent.setOrientation(isHorizontal ? 'horizontal' : 'vertical');
      this.dragGhostComponent.updateInsertionStripRect(
        target.stripeRect.left,
        target.stripeRect.top,
        target.stripeRect.width,
        target.stripeRect.height
      );
      this.dragGhostComponent.setBlueStripVisible(true);
      this.dragGhostComponent.setVisible(true);
    }
  }

  // ==================== СУЩЕСТВУЮЩИЕ МЕТОДЫ ====================

  onComponentClick(component: DroppedComponent, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    this.builder.setSelectedComponentId(component.id);
    if (component.type === 'container') {
      this.selectedContainerId.set(component.id);
    } else {
      this.selectedContainerId.set(null);
    }
    
    window.dispatchEvent(new CustomEvent('component-selected', {
      detail: component
    }));
  }

  clearCanvas() {
    this.builder.clearDropZones();
    this.builder.clearComponents();
    this.builder.setSelectedComponentId(null);
  }

  exportForm() {
    const html = this.builder.generateFormHtml();
    const components = this.builder.getDroppedComponents();
    
    const exportData = {
      html,
      components,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  public generateId(): string {
    return 'comp_' + Math.random().toString(36).substr(2, 9);
  }

  public getComponentLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'text-input': 'Text Input',
      'email-input': 'Email Input',
      'textarea': 'Textarea',
      'select': 'Select',
      'checkbox': 'Checkbox',
      'button': 'Button',
      'container': 'Container'
    };
    return labels[type] || type;
  }

  public getDefaultProperties(type: string): any {
    console.log('🛠️ Getting default properties for type:', type);
    
    const defaults: { [key: string]: any } = {
      'text-input': {
        label: 'Text Input',
        placeholder: 'Enter text',
        required: false,
        width: '100%'
      },
      'email-input': {
        label: 'Email Input',
        placeholder: 'Enter email',
        required: false,
        width: '100%'
      },
      'textarea': {
        label: 'Description',
        placeholder: 'Enter description',
        rows: 3,
        width: '100%'
      },
      'select': {
        label: 'Select Option',
        options: ['Option 1', 'Option 2', 'Option 3'],
        width: '100%'
      },
      'checkbox': {
        label: 'Checkbox',
        checked: false,
        width: '100%'
      },
      'button': {
        text: 'Button',
        type: 'button',
        variant: 'primary',
        fullWidth: false,
        width: 'auto'
      },
      'container': {
        layout: 'flex',
        direction: 'column',
        gap: '1rem',
        padding: '0.5rem',
        columns: 2,
        width: '100%'
      }
    };
    
    const properties = defaults[type] || { width: '100%' };
    console.log('🛠️ Default properties for', type, ':', properties);
    return properties;
  }

  public setupPropertyListener(): void {
    window.addEventListener('component-property-updated', (event: any) => {
      try {
        const { componentId, properties } = event.detail;
        
        this.stateManagementService.updateState({
          components: this.updateComponentProperties(this.components(), componentId, properties)
        });
        
        this.builder.updateComponent(componentId, properties);
        this.debouncedPreviewUpdate();
      } catch (error) {
        console.error('Error handling property update:', error);
      }
    });

    window.addEventListener('component-delete-requested', (event: any) => {
      try {
        const { componentId } = event.detail;
        
        const components = this.stateManagementService.components();
        const updatedComponents = this.removeComponentById(components, componentId);
        this.stateManagementService.updateState({ components: updatedComponents });
        
        this.builder.removeComponent(componentId);
        
        if (this.selectedComponentId() === componentId) {
          this.builder.setSelectedComponentId(null);
        }
        
        this.debouncedPreviewUpdate();
      } catch (error) {
        console.error('Error handling component delete:', error);
      }
    });
  }

  public updateComponentProperties(components: DroppedComponent[], componentId: string, properties: any): DroppedComponent[] {
    return components.map(comp => {
      if (comp.id === componentId) {
        return { ...comp, properties: { ...comp.properties, ...properties } };
      }
      if (comp.children) {
        return { ...comp, children: this.updateComponentProperties(comp.children, componentId, properties) };
      }
      return comp;
    });
  }

  public debouncedPreviewUpdate(): void {
    console.log('⏰ debouncedPreviewUpdate called');
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      console.log('⏰ Triggering preview update after timeout');
      this.triggerPreviewUpdate();
    }, 300);
  }

  public triggerPreviewUpdate(): void {
    try {
      console.log('🔄 triggerPreviewUpdate called');
      console.log('📋 Current components count:', this.components().length);
      
      const html = this.builder.generateFormHtml();
      const components = this.builder.getDroppedComponents();
      
      console.log('📝 Generated HTML:', html);
      console.log('📋 Components for preview:', components());
      
      window.dispatchEvent(new CustomEvent('form:changed', {
        detail: {
          html,
          components,
          timestamp: Date.now()
        }
      }));
      
      console.log('✅ Preview update event dispatched');
    } catch (error) {
      console.error('❌ Error triggering preview update:', error);
    }
  }

  findComponentById(id: string, list: DroppedComponent[]): DroppedComponent | null {
    for (const comp of list) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = this.findComponentById(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  }

  getFilteredChildren(component: DroppedComponent): DroppedComponent[] {
    return (component.children ?? []).filter((x): x is DroppedComponent => !!x);
  }

  getContainerConnectedLists(containerId: string): string[] {
    const baseLists = ['sidebar-list', 'sidebar-layout-list', 'sidebar-actions-list', 'main-editor-list'];
    const containerLists = this.getAllContainerIds().filter(id => id !== containerId);
    return [...baseLists, ...containerLists];
  }

  public getAllContainerIds(): string[] {
    const containerIds: string[] = [];
    
    const findContainers = (components: DroppedComponent[]) => {
      components.forEach(comp => {
        if (comp.type === 'container') {
          containerIds.push(`container-${comp.id}`);
          if (comp.children) {
            findContainers(comp.children);
          }
        }
      });
    };
    
    findContainers(this.components());
    return containerIds;
  }

  public removeComponentFromAllContainers(componentId: string): void {
    const components = this.stateManagementService.components();
    const updatedComponents = this.removeComponentFromContainersRecursive(components, componentId);
    this.stateManagementService.updateState({ components: updatedComponents });
  }

  private removeComponentFromContainersRecursive(components: DroppedComponent[], componentId: string): DroppedComponent[] {
    return components
      .filter(comp => comp.id !== componentId)
      .map(comp => {
        if (comp.children && comp.children.length > 0) {
          return {
            ...comp,
            children: this.removeComponentFromContainersRecursive(comp.children, componentId)
          };
        }
        return comp;
      });
  }

  public removeComponentById(components: DroppedComponent[], componentId: string): DroppedComponent[] {
    return components.filter(component => {
      if (component.id === componentId) return false;
      if (component.children) {
        component.children = this.removeComponentById(component.children, componentId);
      }
      return true;
    });
  }

  /**
   * Get component icon and label for drag ghost
   */
  private getComponentIconAndLabel(component: any): { icon: string; label: string } {
    const type = typeof component === 'string' ? component : component.type;
    
    const iconMap: { [key: string]: { icon: string; label: string } } = {
      'text-input': { icon: '📝', label: 'Text Input' },
      'email-input': { icon: '📧', label: 'Email Input' },
      'textarea': { icon: '📄', label: 'Textarea' },
      'select': { icon: '📋', label: 'Select' },
      'checkbox': { icon: '☑️', label: 'Checkbox' },
      'button': { icon: '🔘', label: 'Button' },
      'container': { icon: '📦', label: 'Container' }
    };
    
    return iconMap[type] || { icon: '📝', label: 'Element' };
  }

  // Очистка эффектов перетаскивания
  private cleanupDragEffects() {
    this.isDragging.set(false);
    this.dragInProgress.set(false);
    
    // Use drag-drop service cleanup
    this.dragDropService.endDrag({});
    
    // Hide drag ghost components
    if (this.dragGhostComponent) {
      this.dragGhostComponent.reset();
    }
    
    // Remove dragging effects from visible components
    const draggedComponents = document.querySelectorAll('.dropped-component.dragging');
    draggedComponents.forEach(comp => {
      comp.classList.remove('dragging');
      (comp as HTMLElement).style.opacity = '1';
    });
    
    // Clear current drop target
    this.currentDropTarget = null;
  }

  // Скрытие CDK placeholder
  private hideCdkPlaceholder() {
    setTimeout(() => {
      const placeholders = document.querySelectorAll('.cdk-drag-placeholder');
      placeholders.forEach(placeholder => {
        (placeholder as HTMLElement).style.display = 'none';
        (placeholder as HTMLElement).style.visibility = 'hidden';
        (placeholder as HTMLElement).style.opacity = '0';
        (placeholder as HTMLElement).style.height = '0';
        (placeholder as HTMLElement).style.width = '0';
        (placeholder as HTMLElement).style.margin = '0';
        (placeholder as HTMLElement).style.padding = '0';
      });
    }, 0);
  }

  // Synchronize invisible layer with visible layer
  private synchronizeLayers(): void {
    if (!this.visibleCanvas || !this.invisibleCanvas) return;
    
    // Get the visible canvas dimensions
    const visibleRect = this.visibleCanvas.nativeElement.getBoundingClientRect();
    
    // Apply the same dimensions to the invisible canvas
    const invisibleCanvas = this.invisibleCanvas.nativeElement;
    invisibleCanvas.style.width = `${visibleRect.width}px`;
    invisibleCanvas.style.height = `${visibleRect.height}px`;
    
    // Synchronize element dimensions using component IDs instead of index
    const visibleComponents = this.visibleCanvas.nativeElement.querySelectorAll('.dropped-component.visible-component');
    
    visibleComponents.forEach((visibleComp) => {
      const componentId = visibleComp.getAttribute('data-component-id');
      if (componentId) {
        // Find the corresponding invisible component by ID
        const invisibleComp = this.invisibleCanvas.nativeElement.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement;
        if (invisibleComp) {
          const compRect = visibleComp.getBoundingClientRect();
          const canvasRect = this.visibleCanvas.nativeElement.getBoundingClientRect();
          
          // Set position and dimensions to match visible component
          invisibleComp.style.position = 'absolute';
          invisibleComp.style.top = `${compRect.top - canvasRect.top}px`;
          invisibleComp.style.left = `${compRect.left - canvasRect.left}px`;
          invisibleComp.style.width = `${compRect.width}px`;
          invisibleComp.style.height = `${compRect.height}px`;
        }
      }
    });
    
    // Synchronize scroll positions
    this.visibleCanvas.nativeElement.addEventListener('scroll', () => {
      invisibleCanvas.scrollTop = this.visibleCanvas.nativeElement.scrollTop;
      invisibleCanvas.scrollLeft = this.visibleCanvas.nativeElement.scrollLeft;
    });
    
    invisibleCanvas.addEventListener('scroll', () => {
      this.visibleCanvas.nativeElement.scrollTop = invisibleCanvas.scrollTop;
      this.visibleCanvas.nativeElement.scrollLeft = invisibleCanvas.scrollLeft;
    });
  }
}