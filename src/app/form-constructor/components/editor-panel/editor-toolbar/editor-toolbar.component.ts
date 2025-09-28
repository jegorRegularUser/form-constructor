import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button class="btn btn-sm" (click)="onClearCanvas()" title="Clear Canvas">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
        
        <div class="toolbar-separator"></div>
        
        <button class="btn btn-sm" (click)="onExportForm()" title="Generate Code">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </button>
      </div>
      
      <div class="editor-info">
        <span class="text-sm text-gray-500">
          {{ componentCount > 0 ? componentCount + ' components' : 'Drag components here' }}
        </span>
      </div>
    </div>
  `,
  styles: `
    .editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toolbar-separator {
      width: 1px;
      height: 1.5rem;
      background: var(--gray-300);
      margin: 0 0.5rem;
    }

    .editor-info {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .btn {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .w-16 {
      width: 1rem;
    }

    .h-16 {
      height: 1rem;
    }
  `
})
export class EditorToolbarComponent {
  @Input() componentCount: number = 0;
  @Output() clearCanvas = new EventEmitter<void>();
  @Output() exportForm = new EventEmitter<void>();

  onClearCanvas() {
    this.clearCanvas.emit();
  }

  onExportForm() {
    this.exportForm.emit();
  }
}