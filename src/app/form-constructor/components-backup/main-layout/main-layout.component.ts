import { Component, signal, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { EditorPanelService } from '../editor-panel/editor-panel.service';
import { PropertyPanelComponent } from '../property-panel/property-panel.component';
import { PreviewPanelComponent } from '../preview-panel/preview-panel.component';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';
import { DragDropService } from '../../services/drag-drop.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup, PropertyPanelComponent, PreviewPanelComponent, EditorPanelComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements AfterViewInit, OnDestroy {
  
  // Handle sidebar drag start events
  onSidebarDragStart(event: any, componentType: string) {
    console.log('📦 Sidebar drag started:', { componentType, event });
    
    // Initialize drag ghost for sidebar drag using the drag-drop service
    const { icon, label } = this.getComponentIconAndLabel(componentType);
    
    // Create a synthetic event object that matches what the service expects
    const syntheticEvent = {
      item: {
        data: {
          type: componentType,
          icon,
          label
        }
      },
      source: {
        dropContainer: {
          id: 'sidebar'
        }
      },
      event: event // Pass the original event for positioning
    };
    
    this.dragDropService.startDrag(syntheticEvent);
  }

  /**
   * Get component icon and label for sidebar drag
   */
  private getComponentIconAndLabel(componentType: string): { icon: string; label: string } {
    const iconMap: { [key: string]: { icon: string; label: string } } = {
      'text-input': { icon: '📝', label: 'Text Input' },
      'email-input': { icon: '📧', label: 'Email Input' },
      'textarea': { icon: '📄', label: 'Textarea' },
      'select': { icon: '📋', label: 'Select' },
      'checkbox': { icon: '☑️', label: 'Checkbox' },
      'button': { icon: '🔘', label: 'Button' },
      'container': { icon: '📦', label: 'Container' }
    };
    
    return iconMap[componentType] || { icon: '📝', label: 'Element' };
  }
  
  // Handle drag move events from sidebar
  onSidebarDragMoved(event: any) {
    if (!event?.event) return;

    const pointerEvent = event.event instanceof PointerEvent
      ? event.event
      : (event.event?.originalEvent instanceof PointerEvent ? event.event.originalEvent : null);

    if (!pointerEvent || !this.editorPanel.visibleCanvas) return;

    const visibleCanvas = this.editorPanel.visibleCanvas.nativeElement;

    // Create a synthetic event object that matches what the service expects
    const syntheticEvent = {
      event: pointerEvent // Pass the original pointer event
    };

    // Update drag position using the drag-drop service
    this.dragDropService.updateDrag(syntheticEvent);

    // Use drag-drop service to find drop target
    const dropTarget = this.dragDropService.getCurrentDropTarget(pointerEvent.clientX, pointerEvent.clientY);
    
    if (dropTarget) {
      // Update insertion strip based on drop target
      const { rect } = dropTarget.position;
      const isHorizontal = dropTarget.layout === 'column';
      
      // Update drop indicator position using the editor panel's properties
      this.editorPanel.dropIndicatorLeft = rect.left;
      this.editorPanel.dropIndicatorTop = rect.top;
      this.editorPanel.dropIndicatorWidth = rect.width;
      this.editorPanel.dropIndicatorHeight = rect.height;
      this.editorPanel.indicatorOrientation = isHorizontal ? 'horizontal' : 'vertical';
      this.editorPanel.showDropIndicator = true;
      
      // Set external drop target for editor panel
      this.editorPanel.setExternalDropTarget({
        containerId: dropTarget.containerId,
        layout: dropTarget.layout,
        index: dropTarget.position.index,
        stripeRect: rect
      });
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
  
  // Handle drag end events from sidebar
  onSidebarDragEnd() {
    // Create a synthetic event object that matches what the service expects
    const syntheticEvent = {
      event: null,
      item: {
        data: this.dragDropService.currentDragComponent
      }
    };
    
    // End the drag operation
    this.dragDropService.endDrag(syntheticEvent);
  }
  public editorService = inject(EditorPanelService);
  public dragDropService = inject(DragDropService);
  @ViewChild(EditorPanelComponent) public editorPanel!: EditorPanelComponent;
  
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLElement>;
  
  // Layout state management
  public sidebarCollapsed = signal(false);
  public previewVisible = signal(true);
  public activePanel = signal<'editor' | 'preview' | 'code'>('editor');
  public windowWidth = signal(window.innerWidth);
  
  // Computed properties for layout classes
  readonly layoutClasses = computed(() => ({
    'layout-grid': true,
    'sidebar-collapsed': this.sidebarCollapsed(),
    'preview-visible': this.previewVisible(),
    [`active-${this.activePanel()}`]: true
  }));
  
  readonly showEditor = computed(() =>
    this.activePanel() === 'editor' || this.windowWidth() > 1024
  );
  
  readonly showPreview = computed(() => {
    if (this.windowWidth() <= 1024) {
      return this.activePanel() === 'preview';
    }
    return this.previewVisible();
  });
  
  readonly showProperties = computed(() =>
    this.windowWidth() > 1024
  );

  readonly showCode = computed(() =>
    this.activePanel() === 'code'
  );

  readonly isMobile = computed(() => this.windowWidth() <= 768);
  readonly isTablet = computed(() => this.windowWidth() <= 1024 && this.windowWidth() > 768);

  // Editor state
  public hasUnsavedChanges = signal(false);
  readonly unsavedChanges = computed(() => this.hasUnsavedChanges());



  ngOnDestroy(): void {
    // Cleanup event listeners if needed
    console.log('Main layout component destroyed');
  }

  // Layout actions
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  togglePreview(): void {
    this.previewVisible.update(visible => !visible);
  }

  setActivePanel(panel: 'editor' | 'preview' | 'code'): void {
    this.activePanel.set(panel);
  }

  // Editor actions
  exportForm(): void {
    try {
      const html = this.editorService.generateFormHtml();
      const components = this.editorService.formComponents();
      
      const exportData = {
        html,
        components,
        timestamp: new Date().toISOString()
      };
      
      const jsonData = JSON.stringify(exportData, null, 2);
      console.log('Exported form data:', jsonData);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  newForm(): void {
    if (this.hasUnsavedChanges() && !confirm('You have unsaved changes. Create new form?')) {
      return;
    }
    
    this.editorService.clearComponents();
    this.hasUnsavedChanges.set(false);
    console.log('New form created');
  }

  openForm(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = event.target?.result as string;
            const data = JSON.parse(jsonData);
            
            // Clear existing components
            this.editorService.clearComponents();
            
            // Load components if available
            if (data.components && Array.isArray(data.components)) {
              data.components.forEach((comp: any) => {
                this.editorService.addComponent(comp);
              });
            }
            
            console.log('Form loaded successfully');
          } catch (error) {
            console.error('Failed to load form:', error);
            alert('Failed to load form. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  saveForm(): void {
    try {
      const html = this.editorService.generateFormHtml();
      const components = this.editorService.formComponents();
      
      const exportData = {
        html,
        components,
        timestamp: new Date().toISOString()
      };
      
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `form-${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.hasUnsavedChanges.set(false);
      console.log('Form saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save form.');
    }
  }

  previewForm(): void {
    if (this.windowWidth() <= 1024) {
      this.setActivePanel('preview');
    } else {
      this.togglePreview();
    }
  }

  // Handle responsive behavior
  onResize(): void {
    this.windowWidth.set(window.innerWidth);
    
    // Auto-switch to editor on mobile if no specific panel selected
    if (this.windowWidth() <= 768 && this.activePanel() === 'preview') {
      this.activePanel.set('editor');
    }
  }

  // Panel switching for mobile/tablet
  showMobilePanel(panel: 'editor' | 'preview' | 'code' | 'properties'): void {
    this.setActivePanel(panel as 'editor' | 'preview' | 'code');
  }

  // Get current panel for mobile navigation
  getCurrentPanelLabel(): string {
    const panel = this.activePanel();
    switch (panel) {
      case 'editor': return 'Editor';
      case 'preview': return 'Preview';
      case 'code': return 'Code';
      default: return 'Editor';
    }
  }


  
  public lastFormChangeTimestamp = 0;

  /**
   * Setup event listeners for form changes
   */
  ngAfterViewInit(): void {
    console.log('🏠 MainLayoutComponent initialized');
    this.setupFormChangeListeners();
    this.initializePreviewSync();
    console.log('Editor initialized successfully');
  }

  public setupFormChangeListeners(): void {
    // Listen for custom form changed events
    window.addEventListener('form:changed', (event: any) => {
      try {
        const eventTimestamp = event.detail?.timestamp || Date.now();
        
        // Prevent processing the same event multiple times
        if (eventTimestamp <= this.lastFormChangeTimestamp) {
          return;
        }
        this.lastFormChangeTimestamp = eventTimestamp;
        
        console.log('Form changed event received');
        this.hasUnsavedChanges.set(true);
      } catch (error) {
        console.error('Error handling form change event:', error);
      }
    });
    
    // Listen for code generation events
    window.addEventListener('code:generated', (event: any) => {
      try {
        console.log('Code generated event received');
        this.updateCodePanel(event.detail);
      } catch (error) {
        console.error('Error handling code generation event:', error);
      }
    });
    
    console.log('Form change listeners setup complete');
  }
  
  /**
   * Initialize preview synchronization
   */
  public initializePreviewSync(): void {
    console.log('Preview synchronization initialized');
  }
  

  
  /**
   * Update code panel with generated code
   */
  public updateCodePanel(data: any): void {
    // Update code panel content
    const codeContent = document.querySelector('.code-content pre code');
    if (codeContent && data.componentCode) {
      codeContent.textContent = data.componentCode;
    }
  }

  // Drag-and-drop logic for containers
  onContainerDrop(event: any, containerType: 'vertical' | 'horizontal') {
    const droppedComponent = event.item.data;
    // Найти контейнер по типу
    const container = this.editorService.findContainerByType(containerType);
    if (container) {
      this.editorService.addComponentToContainer(container.id, droppedComponent);
      this.adjustContainerSize(container.id);
    }
  }

  adjustContainerSize(containerId: string) {
    // Получить контейнер и его дочерние элементы
    const container = this.editorService.getComponentById(containerId);
    if (!container) return;
    const children = container.children ?? [];
    // Для вертикального: высота = сумма высот детей, ширина = макс. ширина
    // Для горизонтального: ширина = сумма ширин детей, высота = макс. высота
    let totalHeight = 0, maxWidth = 0, totalWidth = 0, maxHeight = 0;
    children.forEach((child: any) => {
      totalHeight += child['height'] || 50;
      maxWidth = Math.max(maxWidth, child['width'] || 200);
      totalWidth += child['width'] || 200;
      maxHeight = Math.max(maxHeight, child['height'] || 50);
    });
    if (container.properties?.['containerType'] === 'vertical') {
      container.style = { ...container.style, height: `${totalHeight}px`, width: `${maxWidth}px` };
    } else if (container.properties?.['containerType'] === 'horizontal') {
      container.style = { ...container.style, width: `${totalWidth}px`, height: `${maxHeight}px` };
    }
    this.editorService.updateComponent(container.id, container);
  }
}