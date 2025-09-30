import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-select-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  template: `
    <nz-select 
      [(ngModel)]="currentValue" 
      [nzSize]="'small'"
      (ngModelChange)="onValueChange($event)"
      [nzDisabled]="property.disabled || false"
      [nzPlaceHolder]="property.placeholder || 'Select an option'">
      <nz-option 
        *ngFor="let option of property.options || []" 
        [nzLabel]="option.label" 
        [nzValue]="option.value">
      </nz-option>
    </nz-select>
  `
})
export class SelectPropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'select', label: '' };
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
    // Basic validation for select properties
    if (this.property.required && (!this.currentValue || this.currentValue === '')) {
      return false;
    }
    
    // Check if the value is in the options list
    if (this.property.options && this.property.options.length > 0) {
      const validValues = this.property.options.map(option => option.value);
      if (!validValues.includes(this.currentValue)) {
        return false;
      }
    }
    
    return true;
  }
}