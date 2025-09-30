import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { BasePropertyEditorComponent } from './base-property-editor.component';
import { PropertyDefinition } from '../../../../core/models/property-schema.model';
import { PropertyPanelService } from '../../../../core/services/property-panel.service';

@Component({
  selector: 'app-object-property-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSelectModule,
    NzGridModule,
    NzToolTipModule,
    NzCollapseModule,
    NzTabsModule
  ],
  template: `
    <div class="object-property-editor" [ngClass]="getEditorClasses()">
      <div *ngIf="hasProperties(property)" class="object-properties-container">
        <div class="object-property-group" *ngFor="let prop of getVisibleProperties()">
          <div class="object-property-label">
            {{ prop.label }}
            <span *ngIf="prop.required" class="property-required">*</span>
            <span *ngIf="prop.description" nz-tooltip [nzTooltipTitle]="prop.description" nz-icon nzType="info-circle" class="property-info"></span>
          </div>
          <div class="object-property-editor">
            <!-- Text Property Editor -->
            <input 
              *ngIf="prop.type === 'text'"
              nz-input 
              [(ngModel)]="currentObject[prop.name]"
              [placeholder]="prop.placeholder"
              [nzSize]="'small'"
              [disabled]="isReadOnly()"
              (ngModelChange)="onPropertyChange(prop.name, $event)"
            />
            
            <!-- Number Property Editor -->
            <nz-input-number 
              *ngIf="prop.type === 'number'"
              [(ngModel)]="currentObject[prop.name]"
              [nzMin]="prop.min"
              [nzMax]="prop.max"
              [nzStep]="prop.step || 1"
              [nzSize]="'small'"
              [nzDisabled]="isReadOnly()"
              (ngModelChange)="onPropertyChange(prop.name, $event)"
            />
            
            <!-- Boolean Property Editor -->
            <nz-switch 
              *ngIf="prop.type === 'boolean'"
              [(ngModel)]="currentObject[prop.name]"
              [nzDisabled]="isReadOnly()"
              (ngModelChange)="onPropertyChange(prop.name, $event)"
            />
            
            <!-- Select Property Editor -->
            <nz-select 
              *ngIf="prop.type === 'select'"
              [(ngModel)]="currentObject[prop.name]"
              [nzSize]="'small'"
              [nzDisabled]="isReadOnly()"
              [nzPlaceHolder]="prop.placeholder || 'Select an option'"
              (ngModelChange)="onPropertyChange(prop.name, $event)">
              <nz-option 
                *ngFor="let option of prop.options" 
                [nzLabel]="option.label" 
                [nzValue]="option.value">
              </nz-option>
            </nz-select>
            
            <!-- Array Property Editor -->
            <div *ngIf="prop.type === 'array'" class="nested-array-editor">
              <div class="nested-array-label">
                {{ prop.label }}
                <button 
                  nz-button 
                  nzType="default" 
                  nzSize="small" 
                  [disabled]="isReadOnly()"
                  (click)="addArrayItem(prop.name)">
                  <span nz-icon nzType="plus"></span>
                </button>
              </div>
              <div class="nested-array-items">
                <div *ngFor="let item of getArrayItems(prop.name); let i = index" class="nested-array-item">
                  <input 
                    *ngIf="isSimpleStringArray(prop)"
                    nz-input 
                    [(ngModel)]="currentObject[prop.name][i]"
                    [placeholder]="prop.placeholder"
                    [nzSize]="'small'"
                    [disabled]="isReadOnly()"
                    (ngModelChange)="onArrayItemChange(prop.name, i, $event)"
                  />
                  
                  <nz-input-number 
                    *ngIf="isSimpleNumberArray(prop)"
                    [(ngModel)]="currentObject[prop.name][i]"
                    [nzMin]="prop.min"
                    [nzMax]="prop.max"
                    [nzStep]="prop.step || 1"
                    [nzSize]="'small'"
                    [nzDisabled]="isReadOnly()"
                    (ngModelChange)="onArrayItemChange(prop.name, i, $event)"
                  />
                  
                  <button 
                    nz-button 
                    nzType="default" 
                    nzSize="small" 
                    nzDanger
                    [disabled]="isReadOnly()"
                    (click)="removeArrayItem(prop.name, i)">
                    <span nz-icon nzType="delete"></span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Object Property Editor (nested) -->
            <div *ngIf="prop.type === 'object'" class="nested-object-editor">
              <div class="nested-object-header">
                {{ prop.label }}
                <button 
                  nz-button 
                  nzType="default" 
                  nzSize="small" 
                  [disabled]="isReadOnly()"
                  (click)="resetNestedObject(prop.name)">
                  Reset
                </button>
              </div>
              <div class="nested-object-content">
                <!-- This would recursively render another object property editor -->
                <div class="nested-object-placeholder">
                  Nested object editor would be rendered here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!hasProperties(property)" class="object-empty">
        No properties defined for this object
      </div>
      
      <div class="object-actions">
        <button
          nz-button
          nzType="default"
          [disabled]="isReadOnly()"
          (click)="resetObject()">
          <span nz-icon nzType="undo"></span>
          Reset to Default
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .object-property-editor {
      width: 100%;
    }
    
    .object-properties-container {
      margin-bottom: 12px;
    }
    
    .object-property-group {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      padding: 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background-color: #fafafa;
    }
    
    .object-property-label {
      flex: 1;
      font-weight: 500;
      margin-right: 12px;
      padding-top: 5px;
    }
    
    .object-property-editor {
      flex: 2;
    }
    
    .property-required {
      color: #f5222d;
      margin-left: 4px;
    }
    
    .property-info {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.45);
      cursor: help;
    }
    
    .object-empty {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    
    .object-actions {
      display: flex;
      justify-content: flex-end;
    }
    
    /* Nested Array Editor Styles */
    .nested-array-editor {
      width: 100%;
    }
    
    .nested-array-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .nested-array-items {
      margin-left: 8px;
    }
    
    .nested-array-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .nested-array-item input,
    .nested-array-item nz-input-number {
      flex: 1;
      margin-right: 8px;
    }
    
    /* Nested Object Editor Styles */
    .nested-object-editor {
      width: 100%;
      margin-top: 8px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      padding: 8px;
      background-color: #fff;
    }
    
    .nested-object-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .nested-object-content {
      padding: 8px;
    }
    
    .nested-object-placeholder {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
    }
    
    .property-editor-invalid {
      border: 1px solid #ff4d4f;
    }
    `
  ]
})
export class ObjectPropertyEditorComponent extends BasePropertyEditorComponent implements OnInit {
  currentObject: any = {};
  defaultObject: any = {};
  
  constructor(private propertyPanelService: PropertyPanelService) {
    super();
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    
    // Initialize the current object from the value
    if (this.currentValue && typeof this.currentValue === 'object') {
      this.currentObject = { ...this.currentValue };
    } else {
      this.currentObject = {};
    }
    
    // Initialize the default object
    if (this.property.defaultValue && typeof this.property.defaultValue === 'object') {
      this.defaultObject = { ...this.property.defaultValue };
    } else {
      this.defaultObject = this.getDefaultObject();
    }
    
    // Ensure all properties have values
    this.initializeObjectProperties();
  }
  
  /**
   * Get the default object with all properties initialized
   */
  /**
   * Check if a property has properties
   */
  protected hasProperties(propertyDef: PropertyDefinition): boolean {
    return !!(propertyDef.properties && Object.keys(propertyDef.properties).length > 0);
  }
  
  /**
   * Get the properties of an object property
   */
  protected getObjectProperties(propertyDef: PropertyDefinition): PropertyDefinition[] {
    if (!propertyDef.properties) {
      return [];
    }
    
    return Object.values(propertyDef.properties);
  }
  
  private getDefaultObject(): any {
    const defaultObj: any = {};
    
    const properties = this.getObjectProperties(this.property);
    
    properties.forEach(prop => {
      if (prop.defaultValue !== undefined) {
        defaultObj[prop.name] = prop.defaultValue;
      } else {
        // Set default based on property type
        switch (prop.type) {
          case 'text':
            defaultObj[prop.name] = '';
            break;
          case 'number':
            defaultObj[prop.name] = prop.min !== undefined ? prop.min : 0;
            break;
          case 'boolean':
            defaultObj[prop.name] = false;
            break;
          case 'select':
            defaultObj[prop.name] = prop.options && prop.options.length > 0 ? prop.options[0].value : null;
            break;
          case 'array':
            defaultObj[prop.name] = [];
            break;
          case 'object':
            defaultObj[prop.name] = {};
            break;
          default:
            defaultObj[prop.name] = null;
        }
      }
    });
    
    return defaultObj;
  }
  
  /**
   * Initialize object properties with default values if they don't exist
   */
  private initializeObjectProperties(): void {
    const properties = this.getObjectProperties(this.property);
    
    properties.forEach(prop => {
      if (this.currentObject[prop.name] === undefined) {
        this.currentObject[prop.name] = this.defaultObject[prop.name];
      }
    });
  }
  
  /**
   * Get properties that should be visible based on conditions
   */
  protected getVisibleProperties(): PropertyDefinition[] {
    const properties = this.getObjectProperties(this.property);
    
    return properties.filter(prop => {
      // If no condition is defined, the property is visible
      if (!prop.condition) {
        return true;
      }
      
      // Evaluate the condition
      return this.propertyPanelService.evaluateConditions(prop.condition, this.currentObject);
    });
  }
  
  /**
   * Handle property change
   */
  protected onPropertyChange(propertyName: string, value: any): void {
    this.currentObject[propertyName] = value;
    this.emitValueChange();
  }
  
  /**
   * Handle array item change
   */
  protected onArrayItemChange(propertyName: string, index: number, value: any): void {
    if (this.currentObject[propertyName] && Array.isArray(this.currentObject[propertyName])) {
      this.currentObject[propertyName][index] = value;
      this.emitValueChange();
    }
  }
  
  /**
   * Add an item to an array property
   */
  protected addArrayItem(propertyName: string): void {
    if (!this.currentObject[propertyName]) {
      this.currentObject[propertyName] = [];
    }
    
    const properties = this.getObjectProperties(this.property);
    const propertyDef = properties.find(p => p.name === propertyName);
    if (!propertyDef) return;
    
    let newItem: any;
    
    if (this.isSimpleNumberArray(propertyDef)) {
      newItem = propertyDef.min !== undefined ? propertyDef.min : 0;
    } else if (this.isOptionArray(propertyDef) && propertyDef.options && propertyDef.options.length > 0) {
      newItem = propertyDef.options[0].value;
    } else {
      newItem = '';
    }
    
    this.currentObject[propertyName].push(newItem);
    this.emitValueChange();
  }
  
  /**
   * Remove an item from an array property
   */
  protected removeArrayItem(propertyName: string, index: number): void {
    if (this.currentObject[propertyName] && Array.isArray(this.currentObject[propertyName])) {
      this.currentObject[propertyName].splice(index, 1);
      this.emitValueChange();
    }
  }
  
  /**
   * Get array items for a property
   */
  protected getArrayItems(propertyName: string): any[] {
    if (this.currentObject[propertyName] && Array.isArray(this.currentObject[propertyName])) {
      return this.currentObject[propertyName];
    }
    return [];
  }
  
  /**
   * Reset a nested object property
   */
  protected resetNestedObject(propertyName: string): void {
    if (this.defaultObject[propertyName] !== undefined) {
      this.currentObject[propertyName] = { ...this.defaultObject[propertyName] };
      this.emitValueChange();
    }
  }
  
  /**
   * Reset the entire object to default values
   */
  protected resetObject(): void {
    this.currentObject = { ...this.defaultObject };
    this.emitValueChange();
  }
  
  /**
   * Check if a property is a simple string array
   */
  protected isSimpleStringArray(propertyDef: PropertyDefinition): boolean {
    return propertyDef.type === 'array' && 
           (!propertyDef.itemSchema || 
            propertyDef.itemSchema.type === 'text' || 
            propertyDef.itemSchema.type === undefined);
  }
  
  /**
   * Check if a property is a simple number array
   */
  protected isSimpleNumberArray(propertyDef: PropertyDefinition): boolean {
    return propertyDef.type === 'array' &&
           !!(propertyDef.itemSchema &&
           propertyDef.itemSchema.type === 'number');
  }
  
  /**
   * Check if a property is an option array
   */
  protected isOptionArray(propertyDef: PropertyDefinition): boolean {
    return propertyDef.type === 'array' &&
           !!(propertyDef.itemSchema &&
           (propertyDef.itemSchema.type === 'select' || propertyDef.itemSchema.type === 'multi-select') &&
           propertyDef.itemSchema.options);
  }
  
  /**
   * Emit the value change event
   */
  protected emitValueChange(): void {
    this.onValueChange({ ...this.currentObject });
  }
  
  /**
   * Perform type-specific validation
   */
  protected override performTypeSpecificValidation(): void {
    // Validate each property if properties are defined
    const properties = this.getObjectProperties(this.property);
    
    for (const prop of properties) {
      const value = this.currentObject[prop.name];
      
      // Check if required and value is empty
      if (prop.required && (value === null || value === undefined || value === '')) {
        this.isValid = false;
        this.validationErrors.push(`${prop.label} is required`);
      }
      
      // Type-specific validation
      if (value !== null && value !== undefined) {
        switch (prop.type) {
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must be a valid number`);
            } else if (prop.min !== undefined && value < prop.min) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must be at least ${prop.min}`);
            } else if (prop.max !== undefined && value > prop.max) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must be at most ${prop.max}`);
            }
            break;
            
          case 'select':
            if (prop.options) {
              const validValues = prop.options.map((opt: any) => opt.value);
              if (!validValues.includes(value)) {
                this.isValid = false;
                this.validationErrors.push(`${prop.label} is not a valid option`);
              }
            }
            break;
            
          case 'array':
            if (!Array.isArray(value)) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must be an array`);
            } else if (prop.minItems !== undefined && value.length < prop.minItems) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must have at least ${prop.minItems} items`);
            } else if (prop.maxItems !== undefined && value.length > prop.maxItems) {
              this.isValid = false;
              this.validationErrors.push(`${prop.label} must have at most ${prop.maxItems} items`);
            }
            break;
        }
      }
    }
  }
  

}