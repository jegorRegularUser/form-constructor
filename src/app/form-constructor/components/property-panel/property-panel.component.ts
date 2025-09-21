import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PropertyDefinition } from '../../../core/models';

interface PropertyGroup {
  name: string;
  label: string;
  properties: PropertyDefinition[];
  expanded: boolean;
}

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-panel.component.html',
  styleUrl: './property-panel.component.css'
})
export class PropertyPanelComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  // Component state
  private selectedComponent = signal<any>(null);
  private propertyForm = signal<FormGroup | null>(null);
  private propertyGroups = signal<PropertyGroup[]>([]);

  // Computed properties
  readonly hasSelectedComponent = computed(() => this.selectedComponent() !== null);
  readonly currentForm = computed(() => this.propertyForm());
  readonly groups = computed(() => this.propertyGroups());
  readonly componentName = computed(() => {
    const component = this.selectedComponent();
    return component ? component.label || 'Component' : 'No Selection';
  });

  ngOnInit(): void {
    this.setupDirectSelection();
    this.propertyGroups.set([]);
  }

  ngOnDestroy(): void {
    // Cleanup handled automatically
  }

  private setupDirectSelection(): void {
    // Listen for component selection from editor panel
    window.addEventListener('component-selected', (event: any) => {
      const componentData = event.detail;
      this.onDirectComponentSelected(componentData);
    });
  }

  private onDirectComponentSelected(componentData: any): void {
    console.log('Property panel: Direct component selected', componentData);
    this.selectedComponent.set(componentData);
    this.buildDirectPropertyForm(componentData);
    
    // Automatically expand the first property group
    this.propertyGroups.update(groups =>
      groups.map((group, index) => ({
        ...group,
        expanded: index === 0
      }))
    );
  }

  private buildDirectPropertyForm(componentData: any): void {
    if (!componentData) return;

    // Create form controls based on component properties
    const formControls: { [key: string]: FormControl } = {};
    const properties = componentData.properties || {};
    
    // Basic properties for all components
    if (componentData.type !== "container"){
      const basicProps = {
        label: properties.label || 'Label',
        placeholder: properties.placeholder || '',
        required: properties.required || false,
        disabled: properties.disabled || false
      };
      Object.keys(basicProps).forEach(key => {
        formControls[key] = new FormControl(basicProps[key as keyof typeof basicProps]);
      });
    }

    // Component-specific properties
    if (componentData.type === 'text-input' || componentData.type === 'email-input') {
      formControls['maxLength'] = new FormControl(properties.maxLength || '');
      formControls['minLength'] = new FormControl(properties.minLength || '');
    }
    
    if (componentData.type === 'textarea') {
      formControls['rows'] = new FormControl(properties.rows || 3);
    }
    
    if (componentData.type === 'select') {
      formControls['options'] = new FormControl((properties.options || []).join('\n'));
    }
    
    if (componentData.type === 'button') {
      formControls['text'] = new FormControl(properties.text || 'Button');
      formControls['variant'] = new FormControl(properties.variant || 'primary');
    }

    // Container-specific properties
    if (componentData.type === "container") {
      formControls['layout'] = new FormControl(properties.layout || 'block');
      formControls['direction'] = new FormControl(properties.direction || 'column');
      formControls['justifyContent'] = new FormControl(properties.justifyContent || 'flex-start');
      formControls['alignItems'] = new FormControl(properties.alignItems || 'stretch');
      formControls['columns'] = new FormControl(properties.columns || 2);
      formControls['gap'] = new FormControl(properties.gap || 'var(--space-4)');
      formControls['padding'] = new FormControl(properties.padding || 'var(--space-4)');
      formControls['margin'] = new FormControl(properties.margin || '0');
      formControls['borderRadius'] = new FormControl(properties.borderRadius || 'var(--radius-md)');
      formControls['backgroundColor'] = new FormControl(properties.backgroundColor || 'transparent');
      formControls['border'] = new FormControl(properties.border || '1px solid var(--gray-200)');
    }

    // Create the reactive form
    const form = this.fb.group(formControls);
    this.propertyForm.set(form);
    
    // Create property groups
    const groups = this.createDirectPropertyGroups(componentData.type, formControls);
    this.propertyGroups.set(groups);

    // Subscribe to form changes
    form.valueChanges.subscribe(values => {
      this.onDirectPropertyChange(componentData.id, values);
    });
  }

  private createDirectPropertyGroups(componentType: string, formControls: any): PropertyGroup[] {
    if (componentType === 'container') {
      // Container property groups
      const layoutGroup: PropertyGroup = {
        name: 'layout',
        label: 'Layout',
        properties: [],
        expanded: true
      };
      const spacingGroup: PropertyGroup = {
        name: 'spacing',
        label: 'Spacing',
        properties: [],
        expanded: false
      };
      const stylingGroup: PropertyGroup = {
        name: 'styling',
        label: 'Styling',
        properties: [],
        expanded: false
      };
      // Layout properties
      if (formControls.layout) {
        layoutGroup.properties.push({
          name: 'layout',
          type: 'select',
          label: 'Layout Type',
          defaultValue: 'block',
          options: [
            { value: 'block', label: 'Block' },
            { value: 'flex', label: 'Flexbox' },
            { value: 'grid', label: 'CSS Grid' }
          ],
          group: 'layout'
        });
      }
      if (formControls.direction && formControls.layout?.value === 'flex') {
        layoutGroup.properties.push({
          name: 'direction',
          type: 'select',
          label: 'Flex Direction',
          defaultValue: 'column',
          options: [
            { value: 'row', label: 'Row' },
            { value: 'column', label: 'Column' },
            { value: 'row-reverse', label: 'Row Reverse' },
            { value: 'column-reverse', label: 'Column Reverse' }
          ],
          group: 'layout'
        });
      }
      if (formControls.justifyContent && formControls.layout?.value === 'flex') {
        layoutGroup.properties.push({
          name: 'justifyContent',
          type: 'select',
          label: 'Justify Content',
          defaultValue: 'flex-start',
          options: [
            { value: 'flex-start', label: 'Start' },
            { value: 'flex-end', label: 'End' },
            { value: 'center', label: 'Center' },
            { value: 'space-between', label: 'Space Between' },
            { value: 'space-around', label: 'Space Around' },
            { value: 'space-evenly', label: 'Space Evenly' }
          ],
          group: 'layout'
        });
      }
      if (formControls.alignItems && formControls.layout?.value === 'flex') {
        layoutGroup.properties.push({
          name: 'alignItems',
          type: 'select',
          label: 'Align Items',
          defaultValue: 'stretch',
          options: [
            { value: 'stretch', label: 'Stretch' },
            { value: 'flex-start', label: 'Start' },
            { value: 'flex-end', label: 'End' },
            { value: 'center', label: 'Center' },
            { value: 'baseline', label: 'Baseline' }
          ],
          group: 'layout'
        });
      }
      if (formControls.columns && formControls.layout?.value === 'grid') {
        layoutGroup.properties.push({
          name: 'columns',
          type: 'number',
          label: 'Grid Columns',
          defaultValue: 2,
          group: 'layout'
        });
      }
      if (formControls.gap) {
        layoutGroup.properties.push({
          name: 'gap',
          type: 'text',
          label: 'Gap',
          defaultValue: 'var(--space-4)',
          group: 'layout'
        });
      }
      // Spacing properties
      if (formControls.padding) {
        spacingGroup.properties.push({
          name: 'padding',
          type: 'text',
          label: 'Padding',
          defaultValue: 'var(--space-4)',
          group: 'spacing'
        });
      }
      if (formControls.margin) {
        spacingGroup.properties.push({
          name: 'margin',
          type: 'text',
          label: 'Margin',
          defaultValue: '0',
          group: 'spacing'
        });
      }
      // Styling properties
      if (formControls.borderRadius) {
        stylingGroup.properties.push({
          name: 'borderRadius',
          type: 'text',
          label: 'Border Radius',
          defaultValue: 'var(--radius-md)',
          group: 'styling'
        });
      }
      if (formControls.backgroundColor) {
        stylingGroup.properties.push({
          name: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          defaultValue: 'transparent',
          group: 'styling'
        });
      }
      if (formControls.border) {
        stylingGroup.properties.push({
          name: 'border',
          type: 'text',
          label: 'Border',
          defaultValue: '1px solid var(--gray-200)',
          group: 'styling'
        });
      }
      // Only return groups with properties
      return [layoutGroup, spacingGroup, stylingGroup].filter(g => g.properties.length > 0);
    }

    // Default groups for other component types
    const groups: PropertyGroup[] = [
      {
        name: 'content',
        label: 'Content',
        properties: [],
        expanded: true
      },
      {
        name: 'validation',
        label: 'Validation',
        properties: [],
        expanded: false
      }
    ];

    // Add properties to appropriate groups
    if (formControls.label) {
      groups[0].properties.push({
        name: 'label',
        type: 'text',
        label: 'Label Text',
        defaultValue: '',
        group: 'content'
      });
    }

    if (formControls.placeholder) {
      groups[0].properties.push({
        name: 'placeholder',
        type: 'text',
        label: 'Placeholder',
        defaultValue: '',
        group: 'content'
      });
    }

    if (formControls.text) {
      groups[0].properties.push({
        name: 'text',
        type: 'text',
        label: 'Button Text',
        defaultValue: 'Button',
        group: 'content'
      });
    }

    if (formControls.options) {
      groups[0].properties.push({
        name: 'options',
        type: 'text',
        label: 'Options (one per line)',
        defaultValue: '',
        group: 'content'
      });
    }

    if (formControls.rows) {
      groups[0].properties.push({
        name: 'rows',
        type: 'number',
        label: 'Rows',
        defaultValue: 3,
        group: 'content'
      });
    }

    if (formControls.required) {
      groups[1].properties.push({
        name: 'required',
        type: 'boolean',
        label: 'Required',
        defaultValue: false,
        group: 'validation'
      });
    }

    return groups.filter(group => group.properties.length > 0);
  }

  private onDirectPropertyChange(componentId: string, values: any): void {
    // Process options if it's a select component
    if (values.options && typeof values.options === 'string') {
      values.options = values.options.split('\n').filter((opt: string) => opt.trim());
    }

    // Emit property changes to editor panel
    window.dispatchEvent(new CustomEvent('component-property-updated', {
      detail: { componentId, properties: values }
    }));
  }

  // UI Actions
  toggleGroup(groupName: string): void {
    this.propertyGroups.update(groups => 
      groups.map(group => 
        group.name === groupName 
          ? { ...group, expanded: !group.expanded }
          : group
      )
    );
  }

  resetToDefaults(): void {
    const form = this.propertyForm();
    if (!form) return;

    // Reset form to default values
    const defaultValues: any = {};
    
    // Get default values from component definition
    this.propertyGroups().forEach(group => {
      group.properties.forEach(prop => {
        defaultValues[prop.name] = prop.defaultValue;
      });
    });

    form.patchValue(defaultValues);
  }

  copyProperties(): void {
    const form = this.propertyForm();
    if (!form) return;

    const properties = form.value;
    navigator.clipboard.writeText(JSON.stringify(properties, null, 2))
      .then(() => console.log('Properties copied to clipboard'))
      .catch(err => console.error('Failed to copy properties:', err));
  }

  pasteProperties(): void {
    navigator.clipboard.readText()
      .then(text => {
        try {
          const properties = JSON.parse(text);
          const form = this.propertyForm();
          if (form) {
            form.patchValue(properties);
          }
        } catch (error) {
          console.error('Invalid JSON in clipboard:', error);
        }
      })
      .catch(err => console.error('Failed to read clipboard:', err));
  }
}