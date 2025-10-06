import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CodeViewerComponent } from './code-viewer.component';
import { EditorElement } from '../../../../core/models/drag-data.model';
import { FormProperties } from '../../../../core/models/form-properties.model';

export type EditorMode = 'editor' | 'preview' | 'code';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, NzToolTipModule, CodeViewerComponent],
  template: `
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title">Form Builder</span>
      </div>
      
      <div class="toolbar-center">
        <div class="mode-switcher">
          <button
            nz-button
            [nzType]="currentMode === 'editor' ? 'primary' : 'default'"
            (click)="onModeChange('editor')"
            nz-tooltip="Edit Form"
          >
            <span nz-icon nzType="edit"></span>
            Editor
          </button>
          
          <button
            nz-button
            [nzType]="currentMode === 'preview' ? 'primary' : 'default'"
            (click)="onModeChange('preview')"
            nz-tooltip="Preview Form"
          >
            <span nz-icon nzType="eye"></span>
            Preview
          </button>
          
          <button
            nz-button
            [nzType]="currentMode === 'code' ? 'primary' : 'default'"
            (click)="onModeChange('code')"
            nz-tooltip="View Angular Code"
          >
            <span nz-icon nzType="code"></span>
            Code
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <div class="form-info" *ngIf="elements.length > 0">
          <span class="elements-count">{{ getTotalElements() }} elements</span>
        </div>
      </div>
    </div>


  `,
  styles: [`
    .editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #fff;
      border-bottom: 1px solid #d9d9d9;
      height: 48px;
    }
    
    .toolbar-left {
      flex: 1;
    }
    
    .toolbar-center {
      flex: 2;
      display: flex;
      justify-content: center;
    }
    
    .toolbar-right {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }
    
    .toolbar-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }
    
    .mode-switcher {
      display: flex;
      gap: 8px;
    }
    
    .mode-switcher button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .form-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .elements-count {
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
    }
  `]
})
export class EditorToolbarComponent {
  @Input() currentMode: EditorMode = 'editor';
  @Input() elements: EditorElement[][] = [];
  @Input() formProperties: FormProperties = { id: 'default-form' };
  @Output() modeChange = new EventEmitter<EditorMode>();
  
  constructor(private message: NzMessageService) {}

  onModeChange(mode: EditorMode): void {
    this.modeChange.emit(mode);
  }

  getTotalElements(): number {
    return this.elements.reduce((total, row) => total + row.length, 0);
  }
}