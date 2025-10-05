import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { ElementStateService } from '../../../../core/services/element-state.service';
import { PropertySection, PropertyGroup, PropertyDefinition } from '../../../../core/models/property-schema.model';
import { PropertyType, DimensionUnit } from '../../../../core/enums/property-type.enum';
import { getElementPropertySections } from '../../../../core/configs/element-property-sections';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzButtonModule,
    NzColorPickerModule,
    NzInputNumberModule,
    NzCollapseModule,
    NzIconModule,

    NzTagModule,
    NzEmptyModule,
    NzToolTipModule
  ],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent implements OnInit, OnDestroy {
  selectedElementId: string | null = null;
  elementType: string | null = null;
  propertySections: PropertySection[] = [];
  propertiesForm: FormGroup;
  activeTab = 0;
  panelCollapsed = false;

  // Make DimensionUnit available in template
  DimensionUnit = DimensionUnit;

  private formUpdateInProgress = false;

  constructor(
    private elementSelectionService: ElementSelectionService,
    private elementStateService: ElementStateService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.propertiesForm = this.fb.group({});
  }

  ngOnInit() {
    // Subscribe to element selection
    this.elementSelectionService.selectedElement$.subscribe(element => {
      if (element) {
        this.selectedElementId = element.id;
        this.elementType = element.type;
        this.loadPropertiesForElement(element.id, element.type);
      } else {
        this.selectedElementId = null;
        this.elementType = null;
        this.propertySections = [];
        this.propertiesForm = this.fb.group({});
      }
    });

    // Subscribe to element state changes to update form when element properties change externally
    this.elementStateService.formState$.subscribe(state => {
      if (this.selectedElementId && state.elementProperties[this.selectedElementId]) {
        const currentElement = state.elementProperties[this.selectedElementId];
        this.syncFormWithElementProperties(currentElement);
      }
    });
  }

  ngOnDestroy() {}

  private loadPropertiesForElement(elementId: string, elementType: string) {
    // Get property sections for this element type
    this.propertySections = getElementPropertySections(elementType);
    
    // Get current element properties
    const elementState = this.elementStateService.getElementState(elementId);
    const currentProperties = elementState || {};
    
    // Initialize form with current element properties
    this.initializeForm(currentProperties);
  }

  private initializeForm(currentProperties: any = {}) {
    const formGroup: any = {};

    // First pass: build form structure and set values from current properties
    this.propertySections.forEach(section => {
      section.groups.forEach(group => {
        group.properties.forEach(property => {
          // Get value from current properties or use default
          const value = this.getPropertyValue(property, currentProperties);
          const disabled = property.disabled || false;
          formGroup[property.name] = [{ value, disabled }];
        });
      });
    });

    this.propertiesForm = this.fb.group(formGroup);

    // Subscribe to form changes
    this.propertiesForm.valueChanges.subscribe(values => {
      if (!this.formUpdateInProgress) {
        this.onPropertiesChange(values);
      }
    });
  }

  private getPropertyValue(property: PropertyDefinition, currentProperties: any): any {
    // Check if property exists in current properties
    if (currentProperties && currentProperties.hasOwnProperty(property.name)) {
      return currentProperties[property.name];
    }

    // Use property default value
    if (property.defaultValue !== undefined) {
      return property.defaultValue;
    }

    // Fallback to type-based defaults
    switch (property.type) {
      case PropertyType.TEXT:
        return '';
      case PropertyType.NUMBER:
        return property.min || 0;
      case PropertyType.BOOLEAN:
        return false;
      case PropertyType.SELECT:
        return property.options?.[0]?.value || '';
      case PropertyType.COLOR:
        return '#000000';
      case PropertyType.DIMENSION:
        return { value: property.min || 0, unit: property.defaultUnit || DimensionUnit.PX };
      case PropertyType.ARRAY:
        return [];
      case PropertyType.OBJECT:
        return {};
      default:
        return '';
    }
  }

  private syncFormWithElementProperties(properties: any) {
    if (!properties || this.formUpdateInProgress) return;

    this.formUpdateInProgress = true;
    
    // Update form values without triggering valueChanges
    this.propertiesForm.patchValue(properties, { emitEvent: false });
    
    setTimeout(() => {
      this.formUpdateInProgress = false;
    });
  }

  private onPropertiesChange(values: any) {
    if (!this.selectedElementId || this.formUpdateInProgress) return;

    // Filter out undefined values and keep only changed properties
    const changedProperties: any = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null) {
        changedProperties[key] = values[key];
      }
    });

    // Update element properties
    this.elementStateService.updateElementProperties(this.selectedElementId, changedProperties);
  }

  // Helper methods for template
  isTextProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.TEXT;
  }

  isNumberProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.NUMBER;
  }

  isBooleanProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.BOOLEAN;
  }

  isSelectProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.SELECT;
  }

  isColorProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.COLOR;
  }

  isDimensionProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.DIMENSION;
  }

  isArrayProperty(property: PropertyDefinition): boolean {
    return property.type === PropertyType.ARRAY;
  }

  // Dimension property handlers
  onDimensionValueChange(propertyName: string, value: number) {
    const currentValue = this.propertiesForm.get(propertyName)?.value || { value: 0, unit: DimensionUnit.PX };
    this.propertiesForm.get(propertyName)?.setValue({ ...currentValue, value });
  }

  onDimensionUnitChange(propertyName: string, unit: DimensionUnit) {
    const currentValue = this.propertiesForm.get(propertyName)?.value || { value: 0, unit: DimensionUnit.PX };
    this.propertiesForm.get(propertyName)?.setValue({ ...currentValue, unit });
  }

  // Get current dimension value for display
  getDimensionValue(propertyName: string): number {
    const value = this.propertiesForm.get(propertyName)?.value;
    return value?.value || 0;
  }

  // Get current dimension unit for display
  getDimensionUnit(propertyName: string): DimensionUnit {
    const value = this.propertiesForm.get(propertyName)?.value;
    return value?.unit || DimensionUnit.PX;
  }

  // Reset to default values
  resetToDefaults() {
    if (!this.selectedElementId) return;

    const defaultValues: any = {};
    this.propertySections.forEach(section => {
      section.groups.forEach(group => {
        group.properties.forEach(property => {
          defaultValues[property.name] = this.getPropertyValue(property, {});
        });
      });
    });

    this.propertiesForm.patchValue(defaultValues);
    this.message.success('Properties reset to defaults');
  }

  togglePanel() {
    this.panelCollapsed = !this.panelCollapsed;
  }

  // Handle complex property names (nested properties)
  getFormControlName(propertyName: string): string {
    return propertyName;
  }

  // Check if property has nested structure
  isNestedProperty(propertyName: string): boolean {
    return propertyName.includes('.');
  }
}