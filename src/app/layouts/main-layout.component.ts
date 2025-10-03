import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../features/form-builder/components/sidebar/sidebar.component';
import { EditorComponent } from '../features/form-builder/components/editor/editor.component';
import { PropertyPanelComponent } from '../features/form-builder/components/property-panel/property-panel.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ElementSelectionService } from '../core/services/element-selection.service';
import { PropertyPanelService } from '../core/services/property-panel.service';
import { DragStateService } from '../core/services/drag-state.service';
import { ElementStateService } from '../core/services/element-state.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzButtonModule, SidebarComponent, EditorComponent, PropertyPanelComponent],
  template: `
    <div class="layout">
      <div class="container">
        <div class="sidebar-container">
          <app-sidebar></app-sidebar>
        </div>
        <div class="editor-container">
          <app-editor></app-editor>
        </div>
        <div class="property-panel-container" [class.hidden]="!isPropertyPanelVisible">
          <app-property-panel></app-property-panel>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
    }

    .container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar-container {
      flex-shrink: 0;
      width: 200px;
      border-right: 1px solid #dee2e6;
    }

    .editor-container {
      flex: 1;
      padding: 16px;
      overflow: auto;
      transition: margin-right 0.3s ease;
    }

    .editor-container.expanded {
      margin-right: 0;
    }

    .property-panel-container {
      flex-shrink: 0;
      width: 300px;
      border-left: 1px solid #f0f0f0;
      transition: width 0.3s ease;
      overflow: hidden;
    }

    .property-panel-container.hidden {
      width: 0;
      border-left: none;
    }

    @media (max-width: 768px) {
      .sidebar-container {
        width: 150px;
      }
      
      .property-panel-container {
        width: 250px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isPropertyPanelVisible = true;
  isSidebarCollapsed = false;
  isPropertyPanelCollapsed = false;

  constructor(
    private elementSelectionService: ElementSelectionService,
    private propertyPanelService: PropertyPanelService,
    private dragStateService: DragStateService,
    private elementStateService: ElementStateService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    // Initialize the property panel service
    this.propertyPanelService.initialize();
    
    // Subscribe to element selection changes to show/hide property panel
    this.elementSelectionService.selectedElement$.subscribe(element => {
      // Property panel is always visible, but content changes based on selection
      this.isPropertyPanelVisible = true;
    });
    
    // Subscribe to drag state to handle property panel visibility during drag operations
    this.dragStateService.dragData$.subscribe(dragData => {
      // Keep property panel visible during drag operations
      if (dragData) {
        this.isPropertyPanelVisible = true;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  togglePropertyPanel() {
    this.isPropertyPanelCollapsed = !this.isPropertyPanelCollapsed;
  }

  handleSidebarToggle() {
    this.toggleSidebar();
  }

  handlePropertyPanelToggle() {
    this.togglePropertyPanel();
  }

  clearForm() {
    this.elementStateService.clearState();
    this.elementSelectionService.deselectElement();
    this.message.success('Form cleared successfully');
  }
}