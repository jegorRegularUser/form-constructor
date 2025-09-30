import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-property-editor',
  template: '',
  standalone: true
})
export class PropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'text', label: '' };
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();
  
  currentValue: any = null;
  
  ngOnChanges() {
    this.currentValue = this.value;
  }
  
  onValueChange(value: any) {
    this.currentValue = value;
    this.valueChange.emit(value);
  }
}