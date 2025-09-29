import { Component, Input, ElementRef } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block.component';
import { DragHandleComponent } from './drag-handle.component';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, DragHandleComponent, NzInputModule, FormsModule],
  template: `
    <div class="form-block-content">
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      <textarea 
        nz-input 
        [(ngModel)]="value" 
        [placeholder]="placeholder"
        [nzAutosize]="{ minRows: rows, maxRows: 6 }"
        class="textarea-field"
      ></textarea>
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .form-block-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      min-height: 60px;
    }

    .textarea-field {
      flex: 1;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent;
      resize: none;
      padding: 0;
      font-size: 14px;
      line-height: 1.5715;
      color: rgba(0, 0, 0, 0.85);
    }

    .textarea-field::placeholder {
      color: rgba(0, 0, 0, 0.25);
    }
  `]
})
export class TextareaComponent extends BaseFormBlockComponent {
  @Input() value: string = '';
  @Input() rows: number = 3;
  @Input() placeholder: string = 'Enter text here...';
  
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}