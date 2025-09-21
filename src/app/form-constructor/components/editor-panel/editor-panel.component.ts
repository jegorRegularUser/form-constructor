import { Component, signal, computed, ElementRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { EditorPanelService } from './editor-panel.service';

interface DroppedComponent {
  id: string;
  type: string;
  label: string;
  properties: any;
  children?: DroppedComponent[];
  parentId?: string | null;
}

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList],
  templateUrl: './editor-panel.component.html',
  styleUrl: './editor-panel.component.css'
})
export class EditorPanelComponent implements OnInit, OnDestroy {
  private editorService = inject(EditorPanelService);
  
  @ViewChild('editorCanvas', { static: false }) editorCanvas!: ElementRef<HTMLElement>;

  // Editor state
  private droppedComponents = signal<DroppedComponent[]>([]);
  public selectedComponentId = signal<string | null>(null);
  private selectedContainerId = signal<string | null>(null);
  private updateTimeout: any;

  // Computed properties
  readonly components = computed(() => this.droppedComponents());
  readonly selectedComponent = computed(() => {
    const id = this.selectedComponentId();
    return id ? this.findComponentById(id, this.droppedComponents()) : null;
  });
  readonly hasComponents = computed(() => this.droppedComponents().length > 0);

  // CDK Event handlers for debugging
  onDragStarted(event: any) {
    console.log('🚀 Drag started:', event);
  }

  onDragEntered(event: any) {
    console.log('🎯 Drag entered drop zone:', event);
  }

  onDragExited(event: any) {
    console.log('🚪 Drag exited drop zone:', event);
  }

  ngOnInit(): void {
    console.log('🚀 EditorPanelComponent initialized');
    console.log('📊 Initial components:', this.components());
    this.setupPropertyListener();
  }

  ngOnDestroy(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  // CDK Drop handlers
  onDrop(event: CdkDragDrop<DroppedComponent[]>) {
    console.log('🎯 DROP EVENT TRIGGERED!');
    console.log('📦 Event details:', {
      previousContainer: event.previousContainer.id,
      currentContainer: event.container.id,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      itemData: event.item.data,
      previousData: event.previousContainer.data,
      currentData: event.container.data
    });
    
    if (event.previousContainer === event.container) {
      console.log('🔄 Reordering within same container');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.droppedComponents.set([...event.container.data]);
    } else {
      const isFromSidebar = event.previousContainer.data.length === 0;
      const componentData = event.item.data;
      
      console.log('🔍 Cross-container drop analysis:', {
        isFromSidebar,
        componentDataType: typeof componentData,
        componentData
      });
      
      if (isFromSidebar && typeof componentData === 'string') {
        console.log('✅ Adding new component from sidebar:', componentData);
        this.addNewComponent(componentData, event.currentIndex);
      } else if (!isFromSidebar) {
        console.log('🔄 Moving existing component between containers');
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.droppedComponents.set([...event.container.data]);
      } else {
        console.log('❌ Drop condition not met:', { isFromSidebar, componentDataType: typeof componentData });
      }
    }
    
    console.log('📊 Components after drop:', this.components());
    this.debouncedPreviewUpdate();
  }

  onContainerDrop(event: CdkDragDrop<DroppedComponent[]>, container: DroppedComponent) {
    console.log('🗂️ Container drop:', { container: container.id, event });
    if (!container.children) container.children = [];
    if (event.previousContainer === event.container) {
      moveItemInArray(container.children, event.previousIndex, event.currentIndex);
    } else {
      const isFromSidebar = event.previousContainer.id.includes('sidebar');
      const componentData = event.item.data;
      console.log('📦 Container drop analysis:', { isFromSidebar, componentData, previousId: event.previousContainer.id });
      if (isFromSidebar && typeof componentData === 'string') {
        const newComponent = this.createComponent(componentData);
        newComponent.parentId = container.id;
        container.children.splice(event.currentIndex, 0, newComponent);
        console.log('✅ Added to container:', newComponent);
      } else if (!isFromSidebar && typeof componentData === 'object') {
        // Remove from previous parent if moving from another container
        this.findAndRemoveComponentById(componentData.id, this.droppedComponents());
        // Add to new container
        componentData.parentId = container.id;
        container.children.splice(event.currentIndex, 0, componentData);
        console.log('🔄 Moved to container:', componentData);
      }
    }
    this.droppedComponents.set([...this.droppedComponents()]);
    this.debouncedPreviewUpdate();
  }

  // Component creation and management
  private addNewComponent(type: string, index: number) {
    console.log('🏗️ Creating new component:', { type, index });
    const newComponent = this.createComponent(type);
    console.log('✨ New component created:', newComponent);
    
    const beforeCount = this.droppedComponents().length;
    
    this.droppedComponents.update(components => {
      const newComps = [...components];
      const insertIndex = Math.min(index, newComps.length);
      newComps.splice(insertIndex, 0, newComponent);
      console.log('📝 Components array updated:', {
        before: components.length,
        after: newComps.length,
        insertIndex,
        newComps
      });
      return newComps;
    });
    
    const afterCount = this.droppedComponents().length;
    console.log('📊 Component count change:', { before: beforeCount, after: afterCount });
    
    this.editorService.addComponent({
      id: newComponent.id,
      type: newComponent.type,
      label: newComponent.label,
      properties: newComponent.properties
    });
    
    this.selectedComponentId.set(newComponent.id);
    console.log('✅ Component addition completed');
  }

  private createComponent(type: string): DroppedComponent {
    return {
      id: this.generateId(),
      type: type,
      label: this.getComponentLabel(type),
      properties: this.getDefaultProperties(type),
      children: type === 'container' ? [] : undefined,
      parentId: null
    };
  }

  onComponentClick(component: DroppedComponent, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    this.selectedComponentId.set(component.id);
    if (component.type === 'container') {
      this.selectedContainerId.set(component.id);
    } else {
      this.selectedContainerId.set(null);
    }
    
    window.dispatchEvent(new CustomEvent('component-selected', {
      detail: component
    }));
  }

  // Delete component
  onComponentDelete(componentId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      this.droppedComponents.update(components => 
        this.removeComponentById(components, componentId)
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

  private removeComponentById(components: DroppedComponent[], id: string): DroppedComponent[] {
    return components.filter(comp => {
      if (comp.id === id) return false;
      if (comp.children) {
        comp.children = this.removeComponentById(comp.children, id);
      }
      return true;
    });
  }

  // Clear all components
  clearCanvas() {
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
  exportForm() {
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

  // Utility methods
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

  private setupPropertyListener(): void {
    window.addEventListener('component-property-updated', (event: any) => {
      try {
        const { componentId, properties } = event.detail;
        
        this.droppedComponents.update(components =>
          this.updateComponentProperties(components, componentId, properties)
        );
        
        this.editorService.updateComponent(componentId, properties);
        this.debouncedPreviewUpdate();
      } catch (error) {
        console.error('Error handling property update:', error);
      }
    });
  }

  private updateComponentProperties(components: DroppedComponent[], componentId: string, properties: any): DroppedComponent[] {
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

  private debouncedPreviewUpdate(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.triggerPreviewUpdate();
    }, 300);
  }

  private triggerPreviewUpdate(): void {
    try {
      const html = this.editorService.generateFormHtml();
      window.dispatchEvent(new CustomEvent('form:changed', {
        detail: { 
          html,
          components: this.droppedComponents(),
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('Error triggering preview update:', error);
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

  private getAllContainerIds(): string[] {
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
    
    findContainers(this.droppedComponents());
    return containerIds;
  }

  /**
   * Рекурсивно ищет и удаляет компонент по id из вложенной структуры
   */
  private findAndRemoveComponentById(id: string, components: DroppedComponent[]): boolean {
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (comp.id === id) {
        components.splice(i, 1);
        return true;
      }
      if (comp.children && comp.children.length) {
        const removed = this.findAndRemoveComponentById(id, comp.children);
        if (removed) return true;
      }
    }
    return false;
  }

  private removeFromParent(componentId: string): void {
    this.findAndRemoveComponentById(componentId, this.droppedComponents());
    this.droppedComponents.set([...this.droppedComponents()]);
  }
}