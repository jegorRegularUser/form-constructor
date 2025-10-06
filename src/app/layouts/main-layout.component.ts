import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../features/form-builder/components/sidebar/sidebar.component';
import { EditorComponent } from '../features/form-builder/components/editor/editor.component';
import { PropertiesPanelComponent } from '../features/form-builder/components/properties-panel/properties-panel.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ElementSelectionService } from '../core/services/element-selection.service';
import { DragStateService } from '../core/services/drag-state.service';
import { ElementStateService } from '../core/services/element-state.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NzIconModule, 
    NzButtonModule, 
    SidebarComponent, 
    EditorComponent,
    PropertiesPanelComponent
  ],
  template: `
    <div class="layout">
      <div class="container">
        <div class="sidebar-container">
          <app-sidebar></app-sidebar>
        </div>
        <div class="editor-container">
          <app-editor></app-editor>
        </div>
        <div class="properties-panel-container">
          <app-properties-panel></app-properties-panel>
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
      padding: 0 16px 16px;
      overflow: auto;
    }

    .properties-panel-container {
      flex-shrink: 0;
      width: 320px;
      border-left: 1px solid #dee2e6;
      background: #fafafa;
    }

    @media (max-width: 768px) {
      .sidebar-container {
        width: 150px;
      }
      
      .properties-panel-container {
        position: fixed;
        right: 0;
        top: 0;
        height: 100vh;
        z-index: 1000;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isSidebarCollapsed = false;

  constructor(
    private elementSelectionService: ElementSelectionService,
    private dragStateService: DragStateService,
    private elementStateService: ElementStateService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    // Subscribe to element selection changes
    this.elementSelectionService.selectedElement$.subscribe(element => {
      // Element selection handling
    });
    
    // Subscribe to drag state to handle drag operations
    this.dragStateService.dragData$.subscribe(dragData => {
      // Drag state handling
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  handleSidebarToggle() {
    this.toggleSidebar();
  }

  clearForm() {
    this.elementStateService.clearState();
    this.elementSelectionService.deselectElement();
    this.message.success('Form cleared successfully');
  }
}