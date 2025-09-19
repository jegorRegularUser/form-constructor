import { Injectable, signal, computed, ViewContainerRef, ComponentRef, Type, inject, EnvironmentInjector, createComponent } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FormElementType, FormStructure, ValidationRule } from '../models';

export interface RenderedComponent {
  id: string;
  componentRef: ComponentRef<any>;
  formControl?: FormControl;
  metadata: ComponentMetadata;
}

export interface ComponentMetadata {
  type: string;
  properties: any;
  styling: any;
  validation?: ValidationRule[];
}

export interface RenderContext {
  formGroup: FormGroup;
  viewContainer: ViewContainerRef;
  parentElement?: RenderedComponent;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicRendererService {
  private fb = inject(FormBuilder);
  private injector = inject(EnvironmentInjector);

  // Component registry for dynamic creation
  private componentRegistry = new Map<string, Type<any>>();
  private renderedComponents = signal<Map<string, RenderedComponent>>(new Map());
  private currentFormGroup = signal<FormGroup | null>(null);

  // Computed properties
  readonly hasRenderedComponents = computed(() => this.renderedComponents().size > 0);
  readonly formData = computed(() => {
    const formGroup = this.currentFormGroup();
    return formGroup ? formGroup.value : {};
  });

  constructor() {
    this.initializeComponentRegistry();
  }

  /**
   * Initialize the component registry with available dynamic components
   */
  private initializeComponentRegistry(): void {
    // Register basic HTML elements as fallbacks
    this.componentRegistry.set('input', this.createInputComponentType());
    this.componentRegistry.set('select', this.createSelectComponentType());
    this.componentRegistry.set('checkbox', this.createCheckboxComponentType());
    this.componentRegistry.set('textarea', this.createTextareaComponentType());
    this.componentRegistry.set('button', this.createButtonComponentType());
    this.componentRegistry.set('container', this.createContainerComponentType());
  }

  /**
   * Render form structure in the provided view container
   */
  renderForm(structure: any, viewContainer: ViewContainerRef): FormGroup {
    try {
      // Clear existing components
      this.clearRenderedComponents();
      viewContainer.clear();

      // Create form group
      const formGroup = this.createFormGroup(structure);
      this.currentFormGroup.set(formGroup);

      // Create render context
      const context: RenderContext = {
        formGroup,
        viewContainer
      };

      // Render components
      this.renderComponents(structure.components || [], context);

      console.log('Form rendered successfully', { formGroup, components: this.renderedComponents().size });
      return formGroup;

    } catch (error) {
      console.error('Failed to render form:', error);
      throw error;
    }
  }

  /**
   * Create form group from structure
   */
  private createFormGroup(structure: any): FormGroup {
    const controls: { [key: string]: FormControl } = {};
    
    if (structure.components) {
      this.extractFormControls(structure.components, controls);
    }

    return this.fb.group(controls);
  }

  /**
   * Extract form controls from component structure
   */
  private extractFormControls(components: any[], controls: { [key: string]: FormControl }): void {
    components.forEach(component => {
      // Check if component has form control name
      const formControlName = this.getFormControlName(component);
      if (formControlName) {
        const validators = this.createValidators(component);
        const defaultValue = this.getDefaultValue(component);
        controls[formControlName] = new FormControl(defaultValue, validators);
      }

      // Recursively process child components
      if (component.components && Array.isArray(component.components)) {
        this.extractFormControls(component.components, controls);
      }
    });
  }

  /**
   * Render components in view container
   */
  private renderComponents(components: any[], context: RenderContext): void {
    components.forEach(component => {
      try {
        const renderedComponent = this.renderSingleComponent(component, context);
        if (renderedComponent) {
          this.renderedComponents.update(map => {
            const newMap = new Map(map);
            newMap.set(component.id || component.cid, renderedComponent);
            return newMap;
          });
        }
      } catch (error) {
        console.error(`Failed to render component ${component.id}:`, error);
      }
    });
  }

  /**
   * Render a single component
   */
  private renderSingleComponent(component: any, context: RenderContext): RenderedComponent | null {
    const componentType = this.getComponentType(component);
    const ComponentClass = this.componentRegistry.get(componentType);

    if (!ComponentClass) {
      console.warn(`No component class found for type: ${componentType}`);
      return null;
    }

    try {
      // Create component using Angular 19's standalone component approach
      const componentRef = createComponent(ComponentClass, {
        environmentInjector: this.injector,
        hostElement: context.viewContainer.element.nativeElement
      });

      // Set component properties
      this.setComponentProperties(componentRef, component);

      // Setup form control binding if applicable
      const formControlName = this.getFormControlName(component);
      let formControl: FormControl | undefined;
      
      if (formControlName) {
        formControl = context.formGroup.get(formControlName) as FormControl;
        this.bindFormControl(componentRef, formControl);
      }

      // Append to view
      context.viewContainer.insert(componentRef.hostView);

      return {
        id: component.id || component.cid,
        componentRef,
        formControl,
        metadata: {
          type: componentType,
          properties: this.extractProperties(component),
          styling: this.extractStyling(component),
          validation: this.extractValidation(component)
        }
      };

    } catch (error) {
      console.error(`Error creating component of type ${componentType}:`, error);
      return null;
    }
  }

  /**
   * Create basic input component type
   */
  private createInputComponentType(): Type<any> {
    return class DynamicInputComponent {
      value: string = '';
      placeholder: string = '';
      required: boolean = false;
      disabled: boolean = false;
      type: string = 'text';
    };
  }

  /**
   * Create basic select component type
   */
  private createSelectComponentType(): Type<any> {
    return class DynamicSelectComponent {
      value: string = '';
      options: any[] = [];
      required: boolean = false;
      disabled: boolean = false;
      multiple: boolean = false;
    };
  }

  /**
   * Create basic checkbox component type
   */
  private createCheckboxComponentType(): Type<any> {
    return class DynamicCheckboxComponent {
      checked: boolean = false;
      value: string = 'true';
      required: boolean = false;
      disabled: boolean = false;
    };
  }

  /**
   * Create basic textarea component type
   */
  private createTextareaComponentType(): Type<any> {
    return class DynamicTextareaComponent {
      value: string = '';
      placeholder: string = '';
      rows: number = 3;
      required: boolean = false;
      disabled: boolean = false;
    };
  }

  /**
   * Create basic button component type
   */
  private createButtonComponentType(): Type<any> {
    return class DynamicButtonComponent {
      text: string = 'Button';
      type: string = 'button';
      disabled: boolean = false;
      variant: string = 'primary';
      size: string = 'md';
    };
  }

  /**
   * Create basic container component type
   */
  private createContainerComponentType(): Type<any> {
    return class DynamicContainerComponent {
      layout: string = 'block';
      gap: string = 'var(--space-4)';
      padding: string = 'var(--space-4)';
    };
  }

  /**
   * Helper methods
   */
  private getComponentType(component: any): string {
    return component.type || component.get?.('type') || 'div';
  }

  private getFormControlName(component: any): string | null {
    return component.formControlName || 
           component.get?.('formControlName') || 
           component.attributes?.name ||
           null;
  }

  private getDefaultValue(component: any): any {
    return component.defaultValue || 
           component.get?.('defaultValue') || 
           component.attributes?.value || 
           '';
  }

  private createValidators(component: any): any[] {
    const validators: any[] = [];
    
    if (component.required || component.get?.('required')) {
      validators.push(Validators.required);
    }
    
    if (component.minLength || component.get?.('minLength')) {
      const minLength = component.minLength || component.get('minLength');
      validators.push(Validators.minLength(minLength));
    }
    
    if (component.maxLength || component.get?.('maxLength')) {
      const maxLength = component.maxLength || component.get('maxLength');
      validators.push(Validators.maxLength(maxLength));
    }
    
    if (component.pattern || component.get?.('pattern')) {
      const pattern = component.pattern || component.get('pattern');
      validators.push(Validators.pattern(pattern));
    }
    
    return validators;
  }

  private setComponentProperties(componentRef: ComponentRef<any>, component: any): void {
    const instance = componentRef.instance;
    
    // Set basic properties
    if (component.attributes) {
      Object.keys(component.attributes).forEach(key => {
        if (instance.hasOwnProperty(key)) {
          instance[key] = component.attributes[key];
        }
      });
    }

    // Set GrapesJS properties
    if (component.get) {
      const properties = ['placeholder', 'required', 'disabled', 'type', 'value', 'text'];
      properties.forEach(prop => {
        const value = component.get(prop);
        if (value !== undefined && instance.hasOwnProperty(prop)) {
          instance[prop] = value;
        }
      });
    }
  }

  private bindFormControl(componentRef: ComponentRef<any>, formControl: FormControl): void {
    const instance = componentRef.instance;
    
    // Bind value changes
    if (formControl && instance) {
      // Set initial value
      instance.value = formControl.value;
      
      // Listen for form control changes
      formControl.valueChanges.subscribe(value => {
        if (instance.value !== value) {
          instance.value = value;
          componentRef.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  private extractProperties(component: any): any {
    const properties: any = {};
    
    if (component.attributes) {
      Object.assign(properties, component.attributes);
    }
    
    if (component.get) {
      const propNames = ['label', 'placeholder', 'required', 'disabled', 'type', 'value'];
      propNames.forEach(prop => {
        const value = component.get(prop);
        if (value !== undefined) {
          properties[prop] = value;
        }
      });
    }
    
    return properties;
  }

  private extractStyling(component: any): any {
    return {
      classes: component.getClasses ? component.getClasses() : [],
      styles: component.getStyle ? component.getStyle() : {}
    };
  }

  private extractValidation(component: any): ValidationRule[] {
    const validation: ValidationRule[] = [];
    
    if (component.get?.('required')) {
      validation.push({
        type: 'required',
        message: 'This field is required'
      });
    }
    
    return validation;
  }

  /**
   * Update rendered component properties
   */
  updateComponent(componentId: string, properties: any): void {
    const renderedComponents = this.renderedComponents();
    const component = renderedComponents.get(componentId);
    
    if (component) {
      const instance = component.componentRef.instance;
      Object.keys(properties).forEach(key => {
        if (instance.hasOwnProperty(key)) {
          instance[key] = properties[key];
        }
      });
      
      component.componentRef.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Clear all rendered components
   */
  clearRenderedComponents(): void {
    const components = this.renderedComponents();
    components.forEach(component => {
      component.componentRef.destroy();
    });
    
    this.renderedComponents.set(new Map());
    this.currentFormGroup.set(null);
  }

  /**
   * Get current form group
   */
  getCurrentFormGroup(): FormGroup | null {
    return this.currentFormGroup();
  }

  /**
   * Get rendered component by ID
   */
  getRenderedComponent(componentId: string): RenderedComponent | null {
    return this.renderedComponents().get(componentId) || null;
  }

  /**
   * Get all rendered components
   */
  getAllRenderedComponents(): RenderedComponent[] {
    return Array.from(this.renderedComponents().values());
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    this.clearRenderedComponents();
  }
}