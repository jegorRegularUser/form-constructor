import { Component } from '@angular/core';
import { SidebarComponent } from '../features/form-builder/components/sidebar/sidebar.component';
import { EditorComponent } from '../features/form-builder/components/editor/editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, EditorComponent],
  template: `
    <div class="layout">
      <h1>{{ title }}</h1>
      <div class="container">
        <div class="sidebar-container">
          <app-sidebar></app-sidebar>
        </div>
        <div class="editor-container">
          <app-editor></app-editor>
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

    h1 {
      margin: 0;
      padding: 16px 24px;
      background: #fff;
      border-bottom: 1px solid #dee2e6;
      color: #495057;
      font-size: 24px;
      font-weight: 600;
    }

    .container {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidebar-container {
      flex-shrink: 0;
    }

    .editor-container {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }
  `]
})
export class MainLayoutComponent {
  title = 'Form Constructor';
}