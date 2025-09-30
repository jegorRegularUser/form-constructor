import { Component, OnInit, OnDestroy, ComponentFactoryResolver, ViewChild, ViewContainerRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Subject, takeUntil } from 'rxjs';
import { FormElementProperties } from '../../../../core/models/element-properties.model';
import { FormProperties } from '../../../../core/models/form-properties.model';
import {
  PropertyGroup,
  PropertyChangeEvent,
  PropertyDefinition,
  PropertySection,
  PropertyCondition,
  PropertyEditorConfig
} from '../../../../core/models/property-schema.model';
import { ElementSelectionService } from '../../../../core/services/element-selection.service';
import { PropertyPanelService } from '../../../../core/services/property-panel.service';
import { ElementRegistryService } from '../../../../core/services/element-registry.service';
import { DragStateService } from '../../../../core/services/drag-state.service';
import { PropertyEditorFactory } from '../../../../core/factories/property-editor.factory';
import { BaseGenericPropertyEditorComponent } from './base-generic-property-editor.component';

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzCardModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzSelectModule,
    NzCollapseModule,
    NzGridModule,
    NzToolTipModule,
    NzIconModule,
    BaseGenericPropertyEditorComponent
  ],
  template: `
    <div class="property-panel">
      <nz-card>
        <nz-tabset>
          <nz-tab nzTitle="Properties">
            <div *ngIf="selectedElement" class="properties-container">
              <div class="property-section" *ngFor="let section of elementPropertySections">
                <div class="property-section-header" *ngIf="section.title">
                  <span class="property-section-title">{{ section.title }}</span>
                  <span *ngIf="section.description" class="property-section-description">{{ section.description }}</span>
                </div>
                <div class="property-section-content">
                  <div class="property-group" *ngFor="let group of section.groups">
                    <div class="property-group-header" [class.collapsed]="!isGroupExpanded(group.id || group.title)">
                      <div class="property-group-title-container" (click)="toggleGroup(group.id || group.title)">
                        <span nz-icon [nzType]="isGroupExpanded(group.id || group.title) ? 'down' : 'right'" class="property-group-toggle"></span>
                        <span class="property-group-title">{{ group.title }}</span>
                        <span *ngIf="group.description" [nz-tooltip]="group.description" nz-icon nzType="info-circle" class="property-group-info"></span>
                      </div>
                    </div>
                    <div class="property-group-content" *ngIf="isGroupExpanded(group.id || group.title)">
                      <div class="property-items">
                        <div class="property-item" *ngFor="let property of getVisibleProperties(group.properties)">
                          <div class="property-editor">
                            <!-- Generic Property Editor Component -->
                            <app-base-generic-property-editor
                              [property]="property"
                              [value]="getElementPropertyValue(property.name)"
                              [disabled]="property.disabled || false"
                              (valueChange)="onPropertyChange(property.name, $event)"
                            ></app-base-generic-property-editor>
                          </div>
                        </div>
                        
                        <!-- Nested Property Groups -->
                        <div class="property-nested-groups" *ngIf="group.groups && group.groups.length > 0">
                          <div class="property-group" *ngFor="let nestedGroup of group.groups">
                            <div class="property-group-header" [class.collapsed]="!isGroupExpanded(nestedGroup.id || nestedGroup.title)">
                              <div class="property-group-title-container" (click)="toggleGroup(nestedGroup.id || nestedGroup.title)">
                                <span nz-icon [nzType]="isGroupExpanded(nestedGroup.id || nestedGroup.title) ? 'down' : 'right'" class="property-group-toggle"></span>
                                <span class="property-group-title">{{ nestedGroup.title }}</span>
                                <span *ngIf="nestedGroup.description" [nz-tooltip]="nestedGroup.description" nz-icon nzType="info-circle" class="property-group-info"></span>
                              </div>
                            </div>
                            <div class="property-group-content" *ngIf="isGroupExpanded(nestedGroup.id || nestedGroup.title)">
                              <div class="property-items">
                                <div class="property-item" *ngFor="let property of getVisibleProperties(nestedGroup.properties)">
                                  <div class="property-editor">
                                    <!-- Generic Property Editor Component -->
                                    <app-base-generic-property-editor
                                      [property]="property"
                                      [value]="getElementPropertyValue(property.name)"
                                      [disabled]="property.disabled || false"
                                      (valueChange)="onPropertyChange(property.name, $event)"
                                    ></app-base-generic-property-editor>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="!selectedElement" class="no-selection">
              No element selected
            </div>
          </nz-tab>
          <nz-tab nzTitle="Form Settings">
            <div class="property-group" *ngFor="let group of formPropertyGroups">
              <div class="property-group-header" [class.collapsed]="!isGroupExpanded(group.id || group.title)">
                <div class="property-group-title-container" (click)="toggleGroup(group.id || group.title)">
                  <span nz-icon [nzType]="isGroupExpanded(group.id || group.title) ? 'down' : 'right'" class="property-group-toggle"></span>
                  <span class="property-group-title">{{ group.title }}</span>
                  <span *ngIf="group.description" [nz-tooltip]="group.description" nz-icon nzType="info-circle" class="property-group-info"></span>
                </div>
              </div>
              <div class="property-group-content" *ngIf="isGroupExpanded(group.id || group.title)">
                <div class="property-items">
                  <div class="property-item" *ngFor="let property of group.properties">
                    <div class="property-editor">
                      <!-- Generic Property Editor Component -->
                      <app-base-generic-property-editor
                        [property]="property"
                        [value]="getFormPropertyValue(property.name)"
                        [disabled]="property.disabled || false"
                        (valueChange)="onFormPropertyChange(property.name, $event)"
                      ></app-base-generic-property-editor>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nz-tab>
        </nz-tabset>
      </nz-card>
    </div>
  `,
  styles: [
    `
    .property-panel {
      width: 300px;
      background: #fff;
      border-left: 1px solid #f0f0f0;
      height: 100%;
      overflow-y: auto;
    }
    
    .properties-container {
      padding: 8px 0;
    }
    
    .no-selection {
      padding: 24px;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .property-group {
      margin-bottom: 16px;
    }
    
    .property-group-title {
      font-weight: 500;
      margin-bottom: 8px;
      padding: 0 8px;
      color: rgba(0, 0, 0, 0.85);
    }
    
    .property-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .property-item {
      margin-bottom: 8px;
      padding: 0 8px;
    }
    
    .property-editor {
      width: 100%;
    }
    
    /* Property Section Styles */
    .property-section {
      margin-bottom: 16px;
    }
    
    .property-section-header {
      padding: 8px 16px;
      background-color: #fafafa;
      border-bottom: 1px solid #f0f0f0;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }
    
    .property-section-title {
      font-weight: 500;
      font-size: 16px;
    }
    
    .property-section-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      margin-left: 8px;
    }
    
    .property-section-content {
      padding: 8px 0;
    }
    
    /* Property Group Header Styles */
    .property-group-header {
      padding: 8px 16px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e8e8e8;
      cursor: pointer;
      user-select: none;
    }
    
    .property-group-header.collapsed {
      border-bottom: none;
    }
    
    .property-group-title-container {
      display: flex;
      align-items: center;
    }
    
    .property-group-toggle {
      margin-right: 8px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .property-group-title {
      font-weight: 500;
      flex: 1;
    }
    
    .property-group-info {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.45);
      cursor: help;
    }
    
    .property-group-content {
      padding: 8px 0;
    }
    
    /* Property Item Styles */
    
    /* Nested Property Groups */
    .property-nested-groups {
      margin-left: 16px;
      border-left: 1px solid #f0f0f0;
      padding-left: 8px;
    }
    `
  ]
})
export class PropertyPanelComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  selectedElement: FormElementProperties | null = null;
  formProperties: FormProperties = { id: 'default-form' };
  elementPropertyGroups: PropertyGroup[] = [];
  elementPropertySections: PropertySection[] = [];
  layoutPropertyGroups: PropertyGroup[] = [];
  formPropertyGroups: PropertyGroup[] = [];
  
  // Track expanded state of property groups
  private expandedGroups: Set<string> = new Set<string>();
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private elementSelectionService: ElementSelectionService,
    private propertyPanelService: PropertyPanelService,
    private elementRegistryService: ElementRegistryService,
    private dragStateService: DragStateService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private propertyEditorFactory: PropertyEditorFactory
  ) {}
  
  ngOnInit() {
    // Initialize the property panel service
    this.propertyPanelService.initialize();
    
    this.elementSelectionService.selectedElement$
      .pipe(takeUntil(this.destroy$))
      .subscribe(element => {
        this.selectedElement = element;
        if (element) {
          // Initialize element properties in the service if they don't exist
          const existingProperties = this.propertyPanelService.getElementProperties(element.id);
          if (!existingProperties) {
            // Create a copy of the element properties and store them in the service
            const elementProperties = { ...element } as FormElementProperties;
            this.propertyPanelService.updateElementProperty(element.id, 'id', element.id);
            this.propertyPanelService.updateElementProperty(element.id, 'type', element.type);
            
            // Initialize other properties
            Object.keys(elementProperties).forEach(key => {
              if (key !== 'id' && key !== 'type') {
                this.propertyPanelService.updateElementProperty(
                  element.id,
                  key,
                  (elementProperties as any)[key]
                );
              }
            });
          }
          
          // Get property sections for the element type
          this.elementPropertySections = this.propertyPanelService.getElementPropertySections(element.type);
          
          // Convert legacy property groups to sections for backward compatibility
          if (this.elementPropertySections.length === 0) {
            const legacyGroups = this.propertyPanelService.getElementPropertyGroups(element.type);
            this.elementPropertySections = [{
              id: 'legacy',
              title: 'Properties',
              groups: legacyGroups
            }];
          }
          
          this.layoutPropertyGroups = this.getLayoutPropertyGroups(element.type);
          
          // Expand all groups by default
          this.expandAllGroups();
        } else {
          this.elementPropertySections = [];
          this.layoutPropertyGroups = [];
        }
      });
    
    this.propertyPanelService.formProperties$
      .pipe(takeUntil(this.destroy$))
      .subscribe(properties => {
        this.formProperties = properties;
        this.formPropertyGroups = this.propertyPanelService.getFormPropertyGroups();
      });
      
    // Subscribe to drag state to update property panel during drag operations
    this.dragStateService.dragData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dragData => {
        // Update property panel state during drag operations if needed
      });
      
    // Subscribe to drag end events to refresh property panel
    this.dragStateService.dragEnd$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Refresh property panel after drag operation completes
        if (this.selectedElement) {
          // Re-select the current element to refresh the property panel
          const currentElement = this.selectedElement;
          this.elementSelectionService.selectElement(currentElement);
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onPropertyChange(propertyName: string, value: any) {
    if (this.selectedElement) {
      this.propertyPanelService.updateElementProperty(
        this.selectedElement.id,
        propertyName,
        value
      );
      
      // Handle special case for autoExpand property
      if (propertyName === 'layout.autoExpand') {
        // When autoExpand is toggled, we need to refresh the property panel
        // to show/hide the width and height properties
        this.refreshPropertyPanel();
      }
      
      // Handle special case for label property changes from property panel
      if (propertyName === 'label') {
        // When label is changed from property panel, ensure any inline editing is cancelled
        this.cancelInlineLabelEdit();
      }
      
      // If the property change affects the element's appearance or behavior,
      // we might need to notify other services or components
      // For now, the property panel service handles the updates
    }
  }
  
  onFormPropertyChange(propertyName: string, value: any) {
    // Check if this is a form style property
    if (propertyName.startsWith('formStyle.')) {
      const stylePropertyName = propertyName.replace('formStyle.', '');
      this.propertyPanelService.updateFormStyleProperty(stylePropertyName, value);
    } else {
      this.propertyPanelService.updateFormProperty(
        propertyName,
        value
      );
    }
  }
  
  getElementPropertyValue(propertyName: string): any {
    if (!this.selectedElement) return undefined;
    
    // First try to get the property from the service
    const serviceValue = this.propertyPanelService.getElementProperties(this.selectedElement.id);
    if (serviceValue) {
      // Handle nested properties (e.g., 'validation.required')
      if (propertyName.includes('.')) {
        const parts = propertyName.split('.');
        let currentValue = serviceValue as any;
        
        // Traverse the property path
        for (const part of parts) {
          if (currentValue && currentValue[part] !== undefined) {
            currentValue = currentValue[part];
          } else {
            currentValue = undefined;
            break;
          }
        }
        
        if (currentValue !== undefined) {
          return currentValue;
        }
      } else if ((serviceValue as any)[propertyName] !== undefined) {
        return (serviceValue as any)[propertyName];
      }
    }
    
    // If not found in service, try the selected element directly
    // Handle nested properties (e.g., 'validation.required')
    if (propertyName.includes('.')) {
      const parts = propertyName.split('.');
      const topLevelProperty = parts[0];
      const nestedProperty = parts[1];
      
      if (this.selectedElement[topLevelProperty as keyof FormElementProperties]) {
        return (this.selectedElement[topLevelProperty as keyof FormElementProperties] as any)[nestedProperty];
      }
      return undefined;
    }
    
    return this.selectedElement[propertyName as keyof FormElementProperties];
  }
  
  getFormPropertyValue(propertyName: string): any {
    // Handle nested properties (e.g., 'submitButton.text')
    if (propertyName.includes('.')) {
      const parts = propertyName.split('.');
      const topLevelProperty = parts[0];
      const nestedProperty = parts[1];
      
      if (this.formProperties[topLevelProperty as keyof FormProperties]) {
        return (this.formProperties[topLevelProperty as keyof FormProperties] as any)[nestedProperty];
      }
      return undefined;
    }
    
    return this.formProperties[propertyName as keyof FormProperties];
  }
  
  getLayoutPropertyGroups(elementType: string): PropertyGroup[] {
    // Get all property groups for the element type
    const allGroups = this.propertyPanelService.getElementPropertyGroups(elementType);
    
    // Filter and return only the groups that contain layout-related properties
    return allGroups.filter(group =>
      group.title === 'Layout' ||
      group.properties.some(property =>
        property.name.startsWith('layout.') ||
        property.name.includes('width') ||
        property.name.includes('height') ||
        property.name.includes('minWidth') ||
        property.name.includes('maxWidth') ||
        property.name.includes('minHeight') ||
        property.name.includes('maxHeight')
      )
    );
  }
  
  // Property group management methods
  
  /**
   * Check if a property group is expanded
   */
  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroups.has(groupId);
  }
  
  /**
   * Toggle the expanded state of a property group
   */
  toggleGroup(groupId: string): void {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }
  
  /**
   * Expand all property groups
   */
  expandAllGroups(): void {
    this.elementPropertySections.forEach(section => {
      section.groups.forEach(group => {
        const groupId = group.id || group.title;
        this.expandedGroups.add(groupId);
        
        // Expand nested groups as well
        if (group.groups) {
          group.groups.forEach(nestedGroup => {
            const nestedGroupId = nestedGroup.id || nestedGroup.title;
            this.expandedGroups.add(nestedGroupId);
          });
        }
      });
    });
  }
  
  /**
   * Collapse all property groups
   */
  collapseAllGroups(): void {
    this.expandedGroups.clear();
  }
  
  // Property visibility methods
  
  /**
   * Get properties that should be visible based on conditions
   */
  getVisibleProperties(properties: PropertyDefinition[]): PropertyDefinition[] {
    if (!this.selectedElement) {
      return properties;
    }
    
    return properties.filter(property => {
      // If no condition is defined, the property is visible
      if (!property.condition) {
        return true;
      }
      
      // Evaluate the condition
      return this.propertyPanelService.evaluateConditions(property.condition, this.selectedElement);
    });
  }
  
  /**
   * Get custom properties for the selected element
   */
  getCustomProperties(): Record<string, any> {
    if (!this.selectedElement) return {};
    
    const elementProperties = this.propertyPanelService.getElementProperties(this.selectedElement.id);
    if (!elementProperties || !elementProperties.customProperties) {
      return {};
    }
    
    return elementProperties.customProperties;
  }
  
  /**
   * Update a custom property for the selected element
   */
  updateCustomProperty(propertyName: string, value: any): void {
    if (!this.selectedElement) return;
    
    this.propertyPanelService.updateCustomElementProperty(
      this.selectedElement.id,
      propertyName,
      value
    );
  }
  
  /**
   * Refresh the property panel to update property visibility
   */
  refreshPropertyPanel(): void {
    if (this.selectedElement) {
      // Get the current element
      const currentElement = this.selectedElement;
      
      // Re-select the element to refresh the property panel
      this.elementSelectionService.selectElement(currentElement);
    }
  }
  
  /**
   * Cancel any inline label editing when property is changed from property panel
   */
  private cancelInlineLabelEdit(): void {
    if (this.selectedElement) {
      // Update the isEditingLabel property to false
      this.propertyPanelService.updateElementProperty(
        this.selectedElement.id,
        'isEditingLabel',
        false
      );
    }
  }
}