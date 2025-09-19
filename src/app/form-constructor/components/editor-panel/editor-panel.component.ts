import { Component, signal, computed, ElementRef, ViewChild, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorPanelService } from './editor-panel.service';

interface DroppedComponent {
  id: string;
  type: string;
  label: string;
  properties: any;
}

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.css'
})
export class EditorPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  private editorService = inject(EditorPanelService);
  
  @ViewChild('editorCanvas', { static: false }) editorCanvas!: ElementRef<HTMLElement>;

  // Editor state
  private droppedComponents = signal<DroppedComponent[]>([]);
  public selectedComponentId = signal<string | null>(null);
  private isDragOver = signal(false);

  // Computed properties
  readonly components = computed(() => this.droppedComponents());
  readonly selectedComponent = computed(() => {
    const id = this.selectedComponentId();
    return id ? this.droppedComponents().find(c => c.id === id) : null;
  });
  readonly hasComponents = computed(() => this.droppedComponents().length > 0);
  readonly dragOverState = computed(() => this.isDragOver());

  ngOnInit(): void {
    this.setupPropertyListener();
  }

  ngAfterViewInit(): void {
    this.setupNativeDragDrop();
  }

  ngOnDestroy(): void {
    // Clear any pending timeouts
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  private setupNativeDragDrop(): void {
    if (this.editorCanvas?.nativeElement) {
      const canvas = this.editorCanvas.nativeElement;
      
      canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'copy';
        this.isDragOver.set(true);
      });

      canvas.addEventListener('dragleave', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) {
          this.isDragOver.set(false);
        }
      });

      canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        this.isDragOver.set(false);
        this.handleDrop(e);
      });
      
      console.log('Native drag-and-drop setup complete');
    }
  }

  private handleDrop(event: DragEvent): void {
    try {
      const componentType = event.dataTransfer?.getData('text/plain');
      if (!componentType) {
        console.log('No component type in drag data');
        return;
      }

      const newComponent: DroppedComponent = {
        id: this.generateId(),
        type: componentType,
        label: this.getComponentLabel(componentType),
        properties: this.getDefaultProperties(componentType)
      };

      this.droppedComponents.update(components => [...components, newComponent]);
      console.log('Component dropped:', newComponent);
      
      // Add to editor service
      this.editorService.addComponent({
        id: newComponent.id,
        type: newComponent.type,
        label: newComponent.label,
        properties: newComponent.properties
      });
      
      // Auto-select the new component
      this.selectedComponentId.set(newComponent.id);
      
      // Trigger preview update with debouncing
      this.debouncedPreviewUpdate();
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }

  onComponentClick(componentId: string): void {
    this.selectedComponentId.set(componentId);
    console.log('Component selected:', componentId);
    
    // Emit selection to property panel
    const component = this.droppedComponents().find(c => c.id === componentId);
    if (component) {
      window.dispatchEvent(new CustomEvent('component-selected', {
        detail: component
      }));
    }
  }

  // Move component up/down in the list
  moveComponent(componentId: string, direction: 'up' | 'down'): void {
    try {
      const components = this.droppedComponents();
      const index = components.findIndex(c => c.id === componentId);
      
      if (index === -1) return;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= components.length) return;
      
      const newComponents = [...components];
      [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
      
      this.droppedComponents.set(newComponents);
      this.debouncedPreviewUpdate();
    } catch (error) {
      console.error('Error moving component:', error);
    }
  }

  // Delete component
  onComponentDelete(componentId: string): void {
    try {
      this.droppedComponents.update(components => 
        components.filter(c => c.id !== componentId)
      );
      
      this.editorService.removeComponent(componentId);
      
      if (this.selectedComponentId() === componentId) {
        this.selectedComponentId.set(null);
      }
      
      this.debouncedPreviewUpdate();
    } catch (error) {
      console.error('Error deleting component:', error);
    }
  }
  
  // Clear all components
  clearCanvas(): void {
    try {
      this.droppedComponents.set([]);
      this.editorService.clearComponents();
      this.selectedComponentId.set(null);
      this.debouncedPreviewUpdate();
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  }
  
  // Export form
  exportForm(): void {
    const html = this.editorService.generateFormHtml();
    const components = this.droppedComponents();
    
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

  private generateId(): string {
    return 'comp_' + Math.random().toString(36).substr(2, 9);
  }

  private getComponentLabel(type: string): string {
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

  private getDefaultProperties(type: string): any {
    const defaults: { [key: string]: any } = {
      'text-input': {
        label: 'Text Input',
        placeholder: 'Enter text',
        required: false
      },
      'email-input': {
        label: 'Email',
        placeholder: 'Enter email',
        required: false
      },
      'textarea': {
        label: 'Description',
        placeholder: 'Enter description',
        rows: 3
      },
      'select': {
        label: 'Select Option',
        options: ['Option 1', 'Option 2', 'Option 3']
      },
      'checkbox': {
        label: 'Checkbox',
        checked: false
      },
      'button': {
        text: 'Button',
        type: 'button',
        variant: 'primary'
      },
      'container': {
        layout: 'flex',
        direction: 'column',
        gap: '1rem'
      }
    };
    return defaults[type] || {};
  }

  private lastUpdateTime = 0;
  private updateTimeout: any;

  private setupPropertyListener(): void {
    // Listen for property updates from property panel
    window.addEventListener('component-property-updated', (event: any) => {
      try {
        const { componentId, properties } = event.detail;
        
        this.droppedComponents.update(components =>
          components.map(comp =>
            comp.id === componentId
              ? { ...comp, properties: { ...comp.properties, ...properties } }
              : comp
          )
        );
        
        // Update editor service
        this.editorService.updateComponent(componentId, properties);
        
        // Trigger preview update with debouncing
        this.debouncedPreviewUpdate();
      } catch (error) {
        console.error('Error handling property update:', error);
      }
    });
  }

  private debouncedPreviewUpdate(): void {
    // Clear existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    // Set new timeout
    this.updateTimeout = setTimeout(() => {
      this.triggerPreviewUpdate();
    }, 300); // 300ms debounce
  }

  private triggerPreviewUpdate(): void {
    try {
      // Prevent rapid-fire updates
      const now = Date.now();
      if (now - this.lastUpdateTime < 100) {
        return;
      }
      this.lastUpdateTime = now;

      // Generate HTML and emit form change event
      const html = this.editorService.generateFormHtml();
      window.dispatchEvent(new CustomEvent('form:changed', {
        detail: { 
          html,
          components: this.droppedComponents(),
          timestamp: now
        }
      }));
    } catch (error) {
      console.error('Error triggering preview update:', error);
    }
  }
  
  // Handle drag over for component reordering
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}