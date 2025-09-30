import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-color-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule],
  template: `
    <div class="color-editor">
      <input
        type="color"
        [value]="currentValue"
        (input)="onColorChange($event)"
        [disabled]="property.disabled || false"
        class="color-picker"
      />
      <input
        nz-input
        [(ngModel)]="currentValue"
        (ngModelChange)="onTextChange($event)"
        [placeholder]="property.placeholder || '#000000'"
        [nzSize]="'small'"
        [disabled]="property.disabled || false"
        class="color-text"
      />
    </div>
  `,
  styles: [
    `
    .color-editor {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    
    .color-picker {
      width: 32px;
      height: 32px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      padding: 0;
    }
    
    .color-picker:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .color-text {
      flex: 1;
    }
    `
  ]
})
export class ColorPropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'color', label: '' };
  @Input() value: string = '#000000';
  @Output() valueChange = new EventEmitter<string>();
  
  currentValue: string = '#000000';
  
  ngOnChanges() {
    this.currentValue = this.value;
  }
  
  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentValue = input.value;
    this.valueChange.emit(this.currentValue);
  }
  
  onTextChange(value: string): void {
    // Validate hex color format
    if (this.isValidColor(value)) {
      this.currentValue = value;
      this.valueChange.emit(this.currentValue);
    }
  }
  
  validateValue(): boolean {
    // Basic validation for color properties
    if (this.property.required && (!this.currentValue || this.currentValue.trim() === '')) {
      return false;
    }
    
    // Validate color format
    return this.isValidColor(this.currentValue);
  }
  
  private isValidColor(value: string): boolean {
    // Simple validation for hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(value);
  }
}