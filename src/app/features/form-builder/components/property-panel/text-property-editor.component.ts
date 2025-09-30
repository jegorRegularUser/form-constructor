import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-text-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule],
  template: `
    <input 
      nz-input 
      [(ngModel)]="currentValue" 
      [placeholder]="property.placeholder || ''"
      [nzSize]="'small'"
      (ngModelChange)="onValueChange($event)"
      [disabled]="property.disabled || false"
    />
  `
})
export class TextPropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'text', label: '' };
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  
  currentValue: string = '';
  
  ngOnChanges() {
    this.currentValue = this.value;
  }
  
  onValueChange(value: string) {
    this.currentValue = value;
    this.valueChange.emit(value);
  }
  
  validateValue(): boolean {
    // Basic validation for text properties
    if (this.property.required && (!this.currentValue || this.currentValue.trim() === '')) {
      return false;
    }
    return true;
  }
}