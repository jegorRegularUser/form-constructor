import { Injectable, signal } from '@angular/core';
import { DroppedComponent, DropZoneState, ComponentType } from '../../core/models/component.model';
import { COMPONENT_TYPES, DROP_ZONE_POSITIONS, DRAG_SOURCES, CSS_CLASSES, DEFAULT_VALUES, COLORS, ID_PREFIXES, SELECTORS } from '../constants/editor.constants';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  // Drag state
  public isDragging = signal<boolean>(false);
  public dragSource: 'sidebar' | 'canvas' = DRAG_SOURCES.SIDEBAR;
  public currentDragComponent: any = null;
  public dragGhost: HTMLElement | null = null;
  
  // Drop zones state
  public isCanvasHovered = signal<boolean>(false);
  public canvasDropZone = signal<'top' | 'bottom' | null>(null);
  public dropZones = signal<Map<string, 'top' | 'bottom' | 'left' | 'right'>>(new Map());
  public hoverStates = signal<Map<string, boolean>>(new Map());

  // Private properties for drag elements
  private insertionStrip: HTMLElement | null = null;

  /**
   * Initialize drag operation
   */
  public startDrag(event: any): void {
    this.isDragging.set(true);
    
    // Determine drag source
    const previousContainer = event.source?.dropContainer?.id;
    this.dragSource = previousContainer?.includes('sidebar') ? DRAG_SOURCES.SIDEBAR : DRAG_SOURCES.CANVAS;
    
    // Save drag component data
    this.currentDragComponent = event.item.data;
    
    // Make element semi-transparent if dragging from canvas
    if (this.dragSource === DRAG_SOURCES.CANVAS) {
      const componentId = event.item.data.id;
      const visibleComponent = document.querySelector(`.visible-layer [data-component-id="${componentId}"]`);
      if (visibleComponent) {
        visibleComponent.classList.add(CSS_CLASSES.DRAGGING);
        (visibleComponent as HTMLElement).style.opacity = '0.5';
      }
    }
    
    // Create ghost element
    this.createDragGhost(event);
    
    // Hide CDK preview
    this.hideCdkPreview();
  }

  /**
   * Update drag position and drop zones
   */
  public updateDrag(event: any): void {
    this.updateDragGhostPosition(event);
  }

  /**
   * Handle drag enter
   */
  public onDragEnter(): void {
    this.isCanvasHovered.set(true);
  }

  /**
   * Handle drag exit
   */
  public onDragExit(): void {
    this.isCanvasHovered.set(false);
    this.canvasDropZone.set(null);
  }

  /**
   * End drag operation
   */
  public endDrag(event: any): void {
    this.isDragging.set(false);
    
    // Remove dragging class and restore opacity for canvas elements
    if (this.dragSource === DRAG_SOURCES.CANVAS && event.item?.data?.id) {
      const componentId = event.item.data.id;
      const visibleComponent = document.querySelector(`.visible-layer [data-component-id="${componentId}"]`);
      if (visibleComponent) {
        visibleComponent.classList.remove(CSS_CLASSES.DRAGGING);
        (visibleComponent as HTMLElement).style.opacity = '1';
      }
    }
    
    this.cleanupDragEffects();
  }

  /**
   * Create drag ghost (mini plaque) element
   */
  private createDragGhost(event: any): void {
    const draggedComponent = event.item?.data;
    if (!draggedComponent) return;

    // Create mini plaque
    this.dragGhost = document.createElement('div');
    this.dragGhost.className = 'drag-mini-plaque';
    
    this.dragGhost.style.position = 'fixed';
    this.dragGhost.style.zIndex = (parseInt(DEFAULT_VALUES.Z_INDEX_MAX) + 1).toString();
    this.dragGhost.style.pointerEvents = 'none';
    this.dragGhost.style.display = 'flex';
    this.dragGhost.style.alignItems = 'center';
    this.dragGhost.style.gap = '8px';
    this.dragGhost.style.backgroundColor = 'white';
    this.dragGhost.style.border = '1px solid #e2e8f0';
    this.dragGhost.style.borderRadius = '6px';
    this.dragGhost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    this.dragGhost.style.padding = '8px 12px';
    this.dragGhost.style.fontSize = '14px';
    this.dragGhost.style.fontWeight = '500';
    this.dragGhost.style.color = '#334155';
    this.dragGhost.style.whiteSpace = 'nowrap';
    
    // Set content based on component type
    const { icon, label } = this.getComponentIconAndLabel(draggedComponent);
    this.dragGhost.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span>${label}</span>
    `;
    
    document.body.appendChild(this.dragGhost);
    
    // Create insertion strip
    this.createInsertionStrip();
  }

  /**
   * Create blue insertion strip
   */
  private createInsertionStrip(): void {
    if (this.insertionStrip) return;

    this.insertionStrip = document.createElement('div');
    this.insertionStrip.className = 'insertion-strip';
    
    this.insertionStrip.style.position = 'fixed';
    this.insertionStrip.style.zIndex = DEFAULT_VALUES.Z_INDEX_MAX;
    this.insertionStrip.style.pointerEvents = 'none';
    this.insertionStrip.style.backgroundColor = COLORS.PRIMARY;
    this.insertionStrip.style.borderRadius = '2px';
    this.insertionStrip.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.8)';
    this.insertionStrip.style.display = 'none';
    
    document.body.appendChild(this.insertionStrip);
  }

  /**
   * Get component icon and label
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

  /**
   * Hide CDK preview element and placeholder
   */
  private hideCdkPreview(): void {
    setTimeout(() => {
      const previewElements = document.querySelectorAll(SELECTORS.CDK_DRAG_PREVIEW);
      previewElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
        (el as HTMLElement).style.opacity = DEFAULT_VALUES.OPACITY_ZERO;
      });
      
      const placeholderElements = document.querySelectorAll('.cdk-drag-placeholder');
      placeholderElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.height = '0';
        (el as HTMLElement).style.width = '0';
        (el as HTMLElement).style.margin = '0';
        (el as HTMLElement).style.padding = '0';
        (el as HTMLElement).style.border = 'none';
        (el as HTMLElement).style.background = 'transparent';
      });
    }, 0);
  }

  /**
   * Update drag ghost position and mini plaque
   */
  private updateDragGhostPosition(event: any): void {
    const pointerEvent = event.event instanceof PointerEvent ? event.event :
                        event.event?.originalEvent instanceof PointerEvent ? event.event.originalEvent : null;
    
    if (!pointerEvent) return;

    // Update mini plaque position to follow cursor
    if (this.dragGhost) {
      this.dragGhost.style.left = `${pointerEvent.clientX + 10}px`;
      this.dragGhost.style.top = `${pointerEvent.clientY - 30}px`;
    }

    // Find target container and update blue insertion strip
    const targetInfo = this.findDropTarget(pointerEvent.clientX, pointerEvent.clientY);
    if (targetInfo) {
      this.updateInsertionStrip(targetInfo);
    }
  }

  /**
   * Find drop target container and position
   */
  private findDropTarget(x: number, y: number): DropTargetInfo | null {
    const canvas = document.querySelector('.editor-canvas.visible-layer') as HTMLElement;
    if (!canvas) return null;

    // Find deepest container at coordinates
    const containers = Array.from(canvas.querySelectorAll('[data-droppable="true"], .container-component')) as HTMLElement[];
    const hits = containers
      .map(el => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
      .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height));

    const targetEl = hits.length > 0 ? hits[0].el : canvas;
    const layout = this.getContainerLayout(targetEl);
    const position = this.calculateInsertionPosition(targetEl, x, y, layout);

    return {
      element: targetEl,
      layout,
      position,
      containerId: targetEl === canvas ? null : targetEl.getAttribute('data-component-id')
    };
  }

  /**
   * Get container layout direction
   */
  private getContainerLayout(element: HTMLElement): 'row' | 'column' {
    if (element.classList.contains('editor-canvas')) return 'column';
    
    const layoutAttr = element.getAttribute('data-layout');
    if (layoutAttr === 'row' || layoutAttr === 'column') {
      return layoutAttr as 'row' | 'column';
    }

    const computedStyle = getComputedStyle(element);
    return computedStyle.flexDirection === 'row' ? 'row' : 'column';
  }

  /**
   * Calculate insertion position within container
   */
  private calculateInsertionPosition(container: HTMLElement, x: number, y: number, layout: 'row' | 'column'): InsertionPosition {
    const containerRect = container.getBoundingClientRect();
    const computedStyle = getComputedStyle(container);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

    // Get direct children
    const children = Array.from(container.children)
      .filter(child => child.classList.contains('dropped-component') || child.classList.contains('nested-component'))
      .map(child => child as HTMLElement);

    if (children.length === 0) {
      // Empty container - show insertion at start
      return {
        index: 0,
        rect: layout === 'column' ? {
          left: containerRect.left + paddingLeft,
          top: containerRect.top + paddingTop,
          width: containerRect.width - paddingLeft - paddingRight,
          height: 3
        } : {
          left: containerRect.left + paddingLeft,
          top: containerRect.top + paddingTop,
          width: 3,
          height: containerRect.height - paddingTop - paddingBottom
        }
      };
    }

    // Find nearest child
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    children.forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const distance = layout === 'column' 
        ? Math.abs(y - (childRect.top + childRect.height / 2))
        : Math.abs(x - (childRect.left + childRect.width / 2));
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearestChild = children[nearestIndex];
    const nearestRect = nearestChild.getBoundingClientRect();
    
    if (layout === 'column') {
      const insertBefore = y < (nearestRect.top + nearestRect.height / 2);
      return {
        index: insertBefore ? nearestIndex : nearestIndex + 1,
        rect: {
          left: containerRect.left + paddingLeft,
          top: insertBefore ? nearestRect.top : nearestRect.bottom,
          width: containerRect.width - paddingLeft - paddingRight,
          height: 3
        }
      };
    } else {
      const insertBefore = x < (nearestRect.left + nearestRect.width / 2);
      return {
        index: insertBefore ? nearestIndex : nearestIndex + 1,
        rect: {
          left: insertBefore ? nearestRect.left : nearestRect.right,
          top: containerRect.top + paddingTop,
          width: 3,
          height: containerRect.height - paddingTop - paddingBottom
        }
      };
    }
  }

  /**
   * Update insertion strip visual
   */
  private updateInsertionStrip(targetInfo: DropTargetInfo): void {
    if (!this.insertionStrip) {
      this.createInsertionStrip();
    }

    if (this.insertionStrip) {
      const { rect } = targetInfo.position;
      this.insertionStrip.style.left = `${rect.left}px`;
      this.insertionStrip.style.top = `${rect.top}px`;
      this.insertionStrip.style.width = `${rect.width}px`;
      this.insertionStrip.style.height = `${rect.height}px`;
      this.insertionStrip.style.display = 'block';
    }
  }

  /**
   * Get current drop target info
   */
  public getCurrentDropTarget(x: number, y: number): DropTargetInfo | null {
    return this.findDropTarget(x, y);
  }

  /**
   * Cleanup drag effects
   */
  private cleanupDragEffects(): void {
    // Remove drag ghost
    if (this.dragGhost) {
      this.dragGhost.remove();
      this.dragGhost = null;
    }
    
    // Remove insertion strip
    if (this.insertionStrip) {
      this.insertionStrip.remove();
      this.insertionStrip = null;
    }
    
    // Remove dragging classes
    const draggedElements = document.querySelectorAll(`.${CSS_CLASSES.DRAGGING}`);
    draggedElements.forEach(element => {
      element.classList.remove(CSS_CLASSES.DRAGGING);
      (element as HTMLElement).style.opacity = '1';
    });
  }

  // Public methods for compatibility with form-builder.service
  public setDropZone(componentId: string, position: 'top' | 'bottom' | 'left' | 'right' | null): void {
    this.dropZones.update(zones => {
      const newZones = new Map(zones);
      if (position) {
        newZones.set(componentId, position);
      } else {
        newZones.delete(componentId);
      }
      return newZones;
    });
  }

  public setHoverState(componentId: string, isHovered: boolean): void {
    this.hoverStates.update(states => new Map(states.set(componentId, isHovered)));
  }

  public getDropZone(componentId: string): 'top' | 'bottom' | 'left' | 'right' | null {
    return this.dropZones().get(componentId) || null;
  }

  public getHoverState(componentId: string): boolean {
    return this.hoverStates().get(componentId) || false;
  }

  public clearDropZones(): void {
    this.dropZones.set(new Map());
    this.hoverStates.set(new Map());
  }
}

// Type definitions for better type safety
interface DropTargetInfo {
  element: HTMLElement;
  layout: 'row' | 'column';
  position: InsertionPosition;
  containerId: string | null;
}

interface InsertionPosition {
  index: number;
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}