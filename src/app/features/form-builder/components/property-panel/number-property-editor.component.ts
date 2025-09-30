import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PropertyDefinition, DimensionUnit } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-number-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputNumberModule, NzSelectModule],
  template: `
    <div class="number-property-editor" [class.with-unit]="showUnitSelector">
      <nz-input-number 
        [(ngModel)]="currentValue" 
        [nzMin]="property.min"
        [nzMax]="property.max"
        [nzStep]="property.step || 1"
        [nzSize]="'small'"
        (ngModelChange)="onValueChange($event)"
        [nzDisabled]="property.disabled || false"
        class="number-input"
      />
      
      <nz-select 
        *ngIf="showUnitSelector"
        [(ngModel)]="currentUnit"
        (ngModelChange)="onUnitChange($event)"
        [nzSize]="'small'"
        [nzDisabled]="property.disabled"
        class="unit-selector"
        [nzPlaceHolder]="'Unit'">
        <nz-option 
          *ngFor="let unit of availableUnits" 
          [nzLabel]="unit" 
          [nzValue]="unit">
        </nz-option>
      </nz-select>
    </div>
  `
})
export class NumberPropertyEditorComponent implements OnChanges {
  @Input() property: PropertyDefinition = { name: '', type: 'number', label: '' };
  @Input() value: number | { value: number; unit: string } = 0;
  @Output() valueChange = new EventEmitter<number | { value: number; unit: string }>();
  
  currentValue: number = 0;
  currentUnit: DimensionUnit = 'px';
  showUnitSelector: boolean = false;
  availableUnits: DimensionUnit[] = ['px', '%', 'em', 'rem', 'vw', 'vh'];
  
  ngOnChanges() {
    // Determine if this is a dimension property
    this.showUnitSelector = this.property.type === 'dimension';
    
    // Set available units based on property definition
    if (this.property.dimensionUnits && this.property.dimensionUnits.length > 0) {
      this.availableUnits = this.property.dimensionUnits;
    }
    
    // Set default unit if specified
    if (this.property.defaultUnit) {
      this.currentUnit = this.property.defaultUnit;
    }
    
    // Handle different value types
    if (typeof this.value === 'object' && this.value !== null && 'value' in this.value) {
      // Dimension value with unit
      this.currentValue = this.value.value;
      this.currentUnit = (this.value.unit as DimensionUnit) || this.currentUnit;
    } else {
      // Simple numeric value
      this.currentValue = this.value as number;
    }
  }
  
  onValueChange(value: number) {
    this.currentValue = value;
    
    if (this.showUnitSelector) {
      // Emit dimension object
      this.valueChange.emit({ value, unit: this.currentUnit });
    } else {
      // Emit simple number
      this.valueChange.emit(value);
    }
  }
  
  onUnitChange(unit: DimensionUnit) {
    this.currentUnit = unit;
    
    // Emit dimension object with updated unit
    this.valueChange.emit({ value: this.currentValue, unit });
  }
  
  validateValue(): boolean {
    // Basic validation for number properties
    if (this.property.required && (this.currentValue === null || this.currentValue === undefined)) {
      return false;
    }
    
    if (this.currentValue !== null && this.currentValue !== undefined) {
      if (this.property.min !== undefined && this.currentValue < this.property.min) {
        return false;
      }
      if (this.property.max !== undefined && this.currentValue > this.property.max) {
        return false;
      }
    }
    
    return true;
  }
}