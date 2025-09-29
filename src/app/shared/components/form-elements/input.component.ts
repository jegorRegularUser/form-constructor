import { Component, Input, ElementRef } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block.component';
import { DragHandleComponent } from './drag-handle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, DragHandleComponent],
  template: `
    <div class="form-block-content">
      <!-- Use the reusable drag handle component -->
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      <span class="input-text">{{ value }}</span>
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .input-text {
      font-weight: 500;
      color: #333;
    }
  `]
})
export class InputComponent extends BaseFormBlockComponent {
  @Input() value: string = '';
  
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}