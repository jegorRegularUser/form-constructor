import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BasePropertyEditorComponent } from './base-property-editor.component';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-multi-select-property-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzGridModule,
    NzToolTipModule,
    NzIconModule
  ],
  template: `
    <div class="multi-select-property-editor" [ngClass]="getEditorClasses()">
      <nz-select
        [(ngModel)]="selectedValues"
        [nzMode]="'multiple'"
        [nzSize]="'small'"
        [nzDisabled]="isReadOnly()"
        [nzPlaceHolder]="getPlaceholder()"
        [nzAllowClear]="getPropertyConfig('allowClear', true) !== false"
        [nzMaxTagCount]="getPropertyConfig('maxTagCount')"
        [nzMaxTagPlaceholder]="maxTagPlaceholder"
        (ngModelChange)="onValueChange($event)">
        <nz-option
          *ngFor="let option of property.options"
          [nzLabel]="option.label"
          [nzValue]="option.value"
          [nzDisabled]="option.disabled">
        </nz-option>
      </nz-select>
      
      <div *ngIf="getPropertyConfig('minSelected') !== undefined || getPropertyConfig('maxSelected') !== undefined" class="multi-select-info">
        <span class="multi-select-count">{{ selectedValues.length }} selected</span>
        <span class="multi-select-limits">
          <ng-container *ngIf="getPropertyConfig('minSelected') !== undefined">
            Min: {{ getPropertyConfig('minSelected') }}
          </ng-container>
          <ng-container *ngIf="getPropertyConfig('minSelected') !== undefined && getPropertyConfig('maxSelected') !== undefined">
            ,
          </ng-container>
          <ng-container *ngIf="getPropertyConfig('maxSelected') !== undefined">
            Max: {{ getPropertyConfig('maxSelected') }}
          </ng-container>
        </span>
      </div>
      
      <div *ngIf="!isValid && validationErrors.length > 0" class="multi-select-errors">
        <div *ngFor="let error of validationErrors" class="multi-select-error">
          <span nz-icon nzType="exclamation-circle" nzTheme="fill"></span>
          {{ error }}
        </div>
      </div>
    </div>
    
    <ng-template #maxTagPlaceholder>
      <span>+ {{ selectedValues.length - (getPropertyConfig('maxTagCount') || 0) }} more</span>
    </ng-template>
  `,
  styles: [
    `
    .multi-select-property-editor {
      width: 100%;
    }
    
    .multi-select-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .multi-select-errors {
      margin-top: 4px;
    }
    
    .multi-select-error {
      display: flex;
      align-items: center;
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 2px;
    }
    
    .multi-select-error span {
      margin-right: 4px;
    }
    
    .property-editor-invalid nz-select {
      border: 1px solid #ff4d4f;
      border-radius: 4px;
    }
    `
  ]
})
export class MultiSelectPropertyEditorComponent extends BasePropertyEditorComponent implements OnInit {
  selectedValues: any[] = [];
  
  protected getPropertyConfig = (key: string, defaultValue?: any): any => {
    return (this.property as any)[key] !== undefined ? (this.property as any)[key] : defaultValue;
  };
  
  override ngOnInit(): void {
    super.ngOnInit();
    
    // Initialize selected values from the current value
    if (Array.isArray(this.currentValue)) {
      this.selectedValues = [...this.currentValue];
    } else {
      this.selectedValues = [];
    }
    
    // Set default values for multi-select configuration

    
    if (this.getPropertyConfig('allowClear') === undefined) {
      (this.property as any).allowClear = true;
    }
    
    // Validate initial values
    this.validate();
  }
  
  /**
   * Handle value change
   */
  protected override onValueChange(newValue: any[]): void {
    this.selectedValues = newValue || [];
    super.onValueChange(this.selectedValues);
  }
  
  /**
   * Perform type-specific validation
   */
  protected override performTypeSpecificValidation(): void {
    // Check minimum selected items
    if (this.getPropertyConfig('minSelected') !== undefined && this.selectedValues.length < this.getPropertyConfig('minSelected')) {
      this.isValid = false;
      this.validationErrors.push(`${this.property.label} must have at least ${this.getPropertyConfig('minSelected')} items selected`);
    }
    
    // Check maximum selected items
    if (this.getPropertyConfig('maxSelected') !== undefined && this.selectedValues.length > this.getPropertyConfig('maxSelected')) {
      this.isValid = false;
      this.validationErrors.push(`${this.property.label} must have at most ${this.getPropertyConfig('maxSelected')} items selected`);
    }
    
    // Validate that all selected values are valid options
    if (this.property.options) {
      const validValues = this.property.options.map(option => option.value);
      const invalidValues = this.selectedValues.filter(value => !validValues.includes(value));
      
      if (invalidValues.length > 0) {
        this.isValid = false;
        this.validationErrors.push(`${this.property.label} contains invalid options`);
      }
    }
  }
}