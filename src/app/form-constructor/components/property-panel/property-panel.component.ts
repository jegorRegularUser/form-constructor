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
    const basicProps = {
      label: properties.label || 'Label',
      placeholder: properties.placeholder || '',
      required: properties.required || false,
      disabled: properties.disabled || false
    };

    Object.keys(basicProps).forEach(key => {
      formControls[key] = new FormControl(basicProps[key as keyof typeof basicProps]);
    });

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