import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-boolean-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSwitchModule],
  template: `
    <nz-switch 
      [(ngModel)]="currentValue" 
      (ngModelChange)="onValueChange($event)"
      [nzDisabled]="property.disabled || false"
    />
  `
})
export class BooleanPropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'boolean', label: '' };
  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();
  
  currentValue: boolean = false;
  
  ngOnChanges() {
    this.currentValue = this.value;
  }
  
  onValueChange(value: boolean) {
    this.currentValue = value;
    this.valueChange.emit(value);
  }
  
  validateValue(): boolean {
    // Boolean values are always valid
    return true;
  }
}