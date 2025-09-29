import { Component, Input, ElementRef } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block.component';
import { DragHandleComponent } from './drag-handle.component';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, DragHandleComponent, NzInputModule, FormsModule],
  template: `
    <div class="form-block-content">
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      <input 
        nz-input 
        [(ngModel)]="value" 
        [placeholder]="placeholder"
        class="input-field"
      />
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .form-block-content {
      display: flex;
      align-items: center;
      height: 100%;
      position: relative;
      min-height: 24px;
    }

    .input-field {
      flex: 1;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent;
      padding: 0;
      font-size: 14px;
      line-height: 1.5715;
      color: rgba(0, 0, 0, 0.85);
    }

    .input-field::placeholder {
      color: rgba(0, 0, 0, 0.25);
    }
  `]
})
export class InputComponent extends BaseFormBlockComponent {
  @Input() value: string = '';
  @Input() placeholder: string = 'Enter text...';
  
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}