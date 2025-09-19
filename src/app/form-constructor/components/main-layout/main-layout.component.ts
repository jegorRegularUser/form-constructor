import { Component, signal, computed, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorPanelService } from '../editor-panel/editor-panel.service';
import { PropertyPanelComponent } from '../property-panel/property-panel.component';
import { PreviewPanelComponent } from '../preview-panel/preview-panel.component';
import { EditorPanelComponent } from '../editor-panel/editor-panel.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, PropertyPanelComponent, PreviewPanelComponent, EditorPanelComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements AfterViewInit, OnDestroy {
  private editorService = inject(EditorPanelService);
  
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLElement>;
  
  // Layout state management
  private sidebarCollapsed = signal(false);
  public previewVisible = signal(true);
  public activePanel = signal<'editor' | 'preview' | 'code'>('editor');
  private windowWidth = signal(window.innerWidth);
  
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
  private hasUnsavedChanges = signal(false);
  readonly unsavedChanges = computed(() => this.hasUnsavedChanges());

  ngAfterViewInit(): void {
    // Setup event listeners for form changes
    this.setupFormChangeListeners();
    
    // Initialize preview synchronization
    this.initializePreviewSync();
    
    console.log('Editor initialized successfully');
  }

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

  // Drag and drop handling for component blocks
  onDragStart(event: DragEvent, componentType: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', componentType);
      event.dataTransfer.effectAllowed = 'copy';
      
      // Add visual feedback
      const target = event.target as HTMLElement;
      target.classList.add('dragging');
      
      console.log(`Started dragging: ${componentType}`);
    }
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }
  
  /**
   * Handle drag over event for the editor canvas
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }
  
  private lastFormChangeTimestamp = 0;

  /**
   * Setup event listeners for form changes
   */
  private setupFormChangeListeners(): void {
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
  private initializePreviewSync(): void {
    console.log('Preview synchronization initialized');
  }
  

  
  /**
   * Update code panel with generated code
   */
  private updateCodePanel(data: any): void {
    // Update code panel content
    const codeContent = document.querySelector('.code-content pre code');
    if (codeContent && data.componentCode) {
      codeContent.textContent = data.componentCode;
    }
  }
}