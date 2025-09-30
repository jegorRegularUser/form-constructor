import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BasePropertyEditorComponent } from './base-property-editor.component';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';

@Component({
  selector: 'app-array-property-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzGridModule,
    NzToolTipModule,
    NzCheckboxModule
  ],
  template: `
    <div class="array-property-editor" [ngClass]="getEditorClasses()">
      <div class="array-items-container">
        <div class="array-item" *ngFor="let item of arrayItems; let i = index">
          <div class="array-item-content">
            <!-- Simple text input for string arrays -->
            <input
              *ngIf="isSimpleStringArray()"
              nz-input
              [(ngModel)]="arrayItems[i]"
              [placeholder]="getPlaceholder()"
              [disabled]="isReadOnly()"
              (ngModelChange)="onItemChange(i, $event)"
              [nzSize]="'small'"
            />
            
            <!-- Number input for number arrays -->
            <nz-input-number
              *ngIf="isSimpleNumberArray()"
              [(ngModel)]="arrayItems[i]"
              [nzMin]="property.min"
              [nzMax]="property.max"
              [nzStep]="property.step || 1"
              [nzDisabled]="isReadOnly()"
              (ngModelChange)="onItemChange(i, $event)"
              [nzSize]="'small'"
            />
            
            <!-- Select input for option arrays -->
            <nz-select
              *ngIf="isOptionArray()"
              [(ngModel)]="arrayItems[i]"
              [nzSize]="'small'"
              [nzDisabled]="isReadOnly()"
              [nzPlaceHolder]="getPlaceholder()"
              (ngModelChange)="onItemChange(i, $event)">
              <nz-option
                *ngFor="let option of property.options"
                [nzLabel]="option.label"
                [nzValue]="option.value">
              </nz-option>
            </nz-select>
            
            <!-- Complex object editor -->
            <div *ngIf="isComplexArray()" class="complex-array-item">
              <!-- Object property editors for select options -->
              <div *ngIf="isSelectOptionsArray()" class="select-options-editor">
                <div class="option-editor-row">
                  <div class="option-field">
                    <label>Label</label>
                    <input
                      nz-input
                      [(ngModel)]="arrayItems[i].label"
                      [placeholder]="'Option label'"
                      [disabled]="isReadOnly()"
                      (ngModelChange)="onItemChange(i, $event)"
                      [nzSize]="'small'"
                    />
                  </div>
                  <div class="option-field">
                    <label>Value</label>
                    <input
                      nz-input
                      [(ngModel)]="arrayItems[i].value"
                      [placeholder]="'Option value'"
                      [disabled]="isReadOnly()"
                      (ngModelChange)="onItemChange(i, $event)"
                      [nzSize]="'small'"
                    />
                  </div>
                  <div class="option-field disabled-field">
                    <label>Disabled</label>
                    <nz-checkbox
                      [(ngModel)]="arrayItems[i].disabled"
                      [disabled]="isReadOnly()"
                      (ngModelChange)="onItemChange(i, $event)"
                    ></nz-checkbox>
                  </div>
                </div>
              </div>
              <!-- Generic complex object placeholder -->
              <div *ngIf="!isSelectOptionsArray()" class="complex-array-placeholder">
                Complex object editor would be rendered here
              </div>
            </div>
          </div>
          
          <div class="array-item-actions">
            <button
              nz-button
              nzType="default"
              nzSize="small"
              nzDanger
              [disabled]="isReadOnly() || !property.canRemove"
              (click)="removeItem(i)"
              nz-tooltip
              nzTooltipTitle="Remove item">
              <span nz-icon nzType="delete"></span>
            </button>
            
            <button
              *ngIf="i > 0 && property.canReorder"
              nz-button
              nzType="default"
              nzSize="small"
              [disabled]="isReadOnly()"
              (click)="moveItemUp(i)"
              nz-tooltip
              nzTooltipTitle="Move up">
              <span nz-icon nzType="up"></span>
            </button>
            
            <button
              *ngIf="i < arrayItems.length - 1 && property.canReorder"
              nz-button
              nzType="default"
              nzSize="small"
              [disabled]="isReadOnly()"
              (click)="moveItemDown(i)"
              nz-tooltip
              nzTooltipTitle="Move down">
              <span nz-icon nzType="down"></span>
            </button>
          </div>
        </div>
        
        <div *ngIf="arrayItems.length === 0" class="array-empty">
          No items in array
        </div>
      </div>
      
      <div class="array-actions">
        <button
          nz-button
          nzType="dashed"
          [disabled]="isReadOnly() || !property.canAdd || (property.maxItems !== undefined && arrayItems.length >= property.maxItems)"
          (click)="addItem()">
          <span nz-icon nzType="plus"></span>
          Add Item
        </button>
        
        <div class="array-info" *ngIf="property.minItems !== undefined || property.maxItems !== undefined">
          <span class="array-item-count">{{ arrayItems.length }} items</span>
          <span class="array-item-limits">
            <ng-container *ngIf="property.minItems !== undefined">
              Min: {{ property.minItems }}
            </ng-container>
            <ng-container *ngIf="property.minItems !== undefined && property.maxItems !== undefined">
              ,
            </ng-container>
            <ng-container *ngIf="property.maxItems !== undefined">
              Max: {{ property.maxItems }}
            </ng-container>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .array-property-editor {
      width: 100%;
    }
    
    .array-items-container {
      margin-bottom: 12px;
    }
    
    .array-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background-color: #fafafa;
    }
    
    .array-item-content {
      flex: 1;
    }
    
    .array-item-actions {
      display: flex;
      gap: 4px;
      margin-left: 8px;
    }
    
    .array-empty {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
    }
    
    .array-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .array-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .complex-array-item {
      width: 100%;
    }
    
    .complex-array-placeholder {
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      text-align: center;
    }
    
    .select-options-editor {
      width: 100%;
    }
    
    .option-editor-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    
    .option-field {
      flex: 1;
    }
    
    .option-field label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
    }
    
    .option-field.disabled-field {
      flex: 0 0 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .option-field.disabled-field nz-checkbox {
      margin-top: 4px;
    }
    
    .property-editor-invalid {
      border: 1px solid #ff4d4f;
    }
    `
  ]
})
export class ArrayPropertyEditorComponent extends BasePropertyEditorComponent implements OnInit {
  arrayItems: any[] = [];
  
  override ngOnInit(): void {
    super.ngOnInit();
    
    // Initialize array items from the current value
    if (Array.isArray(this.currentValue)) {
      this.arrayItems = [...this.currentValue];
    } else {
      this.arrayItems = [];
    }
    
    // Set default values for array configuration
    if (this.property.canAdd === undefined) {
      this.property.canAdd = true;
    }
    
    if (this.property.canRemove === undefined) {
      this.property.canRemove = true;
    }
    
    if (this.property.canReorder === undefined) {
      this.property.canReorder = true;
    }
  }
  
  /**
   * Check if this is a simple string array
   */
  protected isSimpleStringArray(): boolean {
    return !this.property.itemSchema || 
           this.property.itemSchema.type === 'text' || 
           this.property.itemSchema.type === undefined;
  }
  
  /**
   * Check if this is a simple number array
   */
  protected isSimpleNumberArray(): boolean {
    return !!(this.property.itemSchema && this.property.itemSchema.type === 'number');
  }
  
  /**
   * Check if this is an option array
   */
  protected isOptionArray(): boolean {
    return !!(this.property.itemSchema &&
           (this.property.itemSchema.type === 'select' || this.property.itemSchema.type === 'multi-select') &&
           this.property.itemSchema.options);
  }
  
  /**
   * Check if this is a complex array
   */
  protected isComplexArray(): boolean {
    return !!(this.property.itemSchema &&
           (this.property.itemSchema.type === 'object' || this.property.itemSchema.type === 'array'));
  }
  
  /**
   * Check if this is a select options array (special case for select element options)
   */
  protected isSelectOptionsArray(): boolean {
    return !!(this.property.name === 'options' &&
           this.property.itemSchema &&
           this.property.itemSchema.type === 'object' &&
           this.property.itemSchema.properties &&
           this.property.itemSchema.properties['label'] &&
           this.property.itemSchema.properties['value']);
  }
  
  /**
   * Add a new item to the array
   */
  protected addItem(): void {
    let newItem: any;
    
    if (this.isSimpleNumberArray()) {
      newItem = this.property.min !== undefined ? this.property.min : 0;
    } else if (this.isOptionArray() && this.property.itemSchema!.options && this.property.itemSchema!.options.length > 0) {
      newItem = this.property.itemSchema!.options![0].value;
    } else {
      newItem = '';
    }
    
    this.arrayItems.push(newItem);
    this.emitValueChange();
  }
  
  /**
   * Remove an item from the array
   */
  protected removeItem(index: number): void {
    if (index >= 0 && index < this.arrayItems.length) {
      this.arrayItems.splice(index, 1);
      this.emitValueChange();
    }
  }
  
  /**
   * Move an item up in the array
   */
  protected moveItemUp(index: number): void {
    if (index > 0 && index < this.arrayItems.length) {
      const temp = this.arrayItems[index];
      this.arrayItems[index] = this.arrayItems[index - 1];
      this.arrayItems[index - 1] = temp;
      this.emitValueChange();
    }
  }
  
  /**
   * Move an item down in the array
   */
  protected moveItemDown(index: number): void {
    if (index >= 0 && index < this.arrayItems.length - 1) {
      const temp = this.arrayItems[index];
      this.arrayItems[index] = this.arrayItems[index + 1];
      this.arrayItems[index + 1] = temp;
      this.emitValueChange();
    }
  }
  
  /**
   * Handle item value change
   */
  protected onItemChange(index: number, value: any): void {
    if (index >= 0 && index < this.arrayItems.length) {
      this.arrayItems[index] = value;
      this.emitValueChange();
    }
  }
  
  /**
   * Emit the value change event
   */
  protected emitValueChange(): void {
    this.onValueChange([...this.arrayItems]);
  }
  
  /**
   * Perform type-specific validation
   */
  protected override performTypeSpecificValidation(): void {
    // Check minimum items
    if (this.property.minItems !== undefined && this.arrayItems.length < this.property.minItems) {
      this.isValid = false;
      this.validationErrors.push(`${this.property.label} must have at least ${this.property.minItems} items`);
    }
    
    // Check maximum items
    if (this.property.maxItems !== undefined && this.arrayItems.length > this.property.maxItems) {
      this.isValid = false;
      this.validationErrors.push(`${this.property.label} must have at most ${this.property.maxItems} items`);
    }
    
    // Validate each item if item schema is provided
    if (this.property.itemSchema) {
      for (let i = 0; i < this.arrayItems.length; i++) {
        const item = this.arrayItems[i];
        
        // Validate number items
        if (this.isSimpleNumberArray()) {
          if (typeof item !== 'number' || isNaN(item)) {
            this.isValid = false;
            this.validationErrors.push(`Item ${i + 1} must be a valid number`);
          } else if (this.property.min !== undefined && item < this.property.min) {
            this.isValid = false;
            this.validationErrors.push(`Item ${i + 1} must be at least ${this.property.min}`);
          } else if (this.property.max !== undefined && item > this.property.max) {
            this.isValid = false;
            this.validationErrors.push(`Item ${i + 1} must be at most ${this.property.max}`);
          }
        }
        
        // Validate option items
        if (this.isOptionArray() && this.property.itemSchema.options) {
          const validValues = this.property.itemSchema.options.map(opt => opt.value);
          if (!validValues.includes(item)) {
            this.isValid = false;
            this.validationErrors.push(`Item ${i + 1} is not a valid option`);
          }
        }
      }
    }
  }
}