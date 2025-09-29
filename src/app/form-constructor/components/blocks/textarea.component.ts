import { Component, Input, ElementRef } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block/base-form-block.component';
import { DragHandleComponent } from './drag-handle/drag-handle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, DragHandleComponent],
  template: `
    <div class="textarea-content">
      <!-- Use the reusable drag handle component -->
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      <textarea
        class="textarea-field"
        [value]="value"
        (input)="onInput($event)"
        [attr.rows]="rows"
        [attr.placeholder]="placeholder"
      ></textarea>
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .textarea-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    .textarea-field {
      flex: 1;
      border: none;
      background: transparent;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      color: #333;
      outline: none;
      padding: 8px 0;
      line-height: 1.4;
    }

    .textarea-field:focus {
      outline: none;
    }

    .textarea-field::placeholder {
      color: #999;
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

  onInput(event: Event) {
    this.value = (event.target as HTMLTextAreaElement).value;
  }
}