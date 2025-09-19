# Technical Specification: Angular 19 Form Constructor

## 📋 Overview

This document provides detailed technical specifications for implementing the drag-and-drop form constructor with Angular 19 and GrapesJS. It complements the architectural plan with specific implementation details, API specifications, and development guidelines.

## 🔧 Technology Stack

### Core Dependencies
```json
{
  "grapesjs": "^0.21.0",
  "@types/grapesjs": "^0.17.0",
  "grapesjs-blocks-basic": "^1.0.0",
  "grapesjs-plugin-forms": "^2.0.0",
  "codemirror": "^6.0.0",
  "highlight.js": "^11.9.0",
  "jszip": "^3.10.0"
}
```

### Angular 19 Features Utilized
- **Standalone Components**: All components use standalone: true
- **Signals**: Reactive state management with Angular signals
- **Control Flow**: @if, @for, @switch syntax in templates
- **Input/Output Functions**: input(), output(), model()
- **ViewChild/ViewChildren**: Query functions for DOM access
- **Injectable**: Service injection with providedIn: 'root'

## 🏗️ Core Interfaces and Type Definitions

### Component Models

```typescript
// core/models/component.model.ts
export interface BaseComponent {
  id: string;
  type: ComponentType;
  label: string;
  properties: ComponentProperties;
  validation?: ValidationRule[];
  styling: ComponentStyling;
  events?: ComponentEvent[];
}

export interface FormComponent extends BaseComponent {
  formControlName?: string;
  validators?: ValidatorConfig[];
  errorMessages?: { [key: string]: string };
}

export interface ContainerComponent extends BaseComponent {
  children: BaseComponent[];
  layout: LayoutType;
  gridConfig?: GridConfiguration;
  flexConfig?: FlexConfiguration;
}

export type ComponentType = 
  | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'button' | 'container' | 'grid' | 'flex' | 'card'
  | 'label' | 'divider' | 'spacer';

export interface ComponentProperties {
  [key: string]: any;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface ComponentStyling {
  classes?: string[];
  styles?: { [property: string]: string };
  responsive?: ResponsiveStyles;
}

export interface ResponsiveStyles {
  mobile?: { [property: string]: string };
  tablet?: { [property: string]: string };
  desktop?: { [property: string]: string };
}

export interface ValidationRule {
  type: 'required' | 'email' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max';
  value?: any;
  message: string;
}

export interface ComponentEvent {
  type: 'click' | 'change' | 'focus' | 'blur';
  handler: string;
  preventDefault?: boolean;
}
```

### GrapesJS Integration Types

```typescript
// core/models/grapesjs.model.ts
export interface GrapesJSConfig {
  container: string | HTMLElement;
  height: string;
  width: string;
  storageManager: StorageConfig;
  plugins: string[];
  pluginsOpts: PluginOptions;
  canvas: CanvasConfig;
}

export interface CustomBlock {
  id: string;
  label: string;
  category: string;
  media: string;
  content: BlockContent;
  attributes?: { [key: string]: any };
}

export interface BlockContent {
  type: string;
  tagName?: string;
  attributes?: { [key: string]: any };
  content?: string;
  components?: BlockContent[];
}

export interface PluginOptions {
  [pluginName: string]: any;
}

export interface StorageConfig {
  type: 'local' | 'remote' | null;
  autosave: boolean;
  autoload: boolean;
  stepsBeforeSave: number;
}

export interface CanvasConfig {
  styles: string[];
  scripts: string[];
}
```

### Code Generation Types

```typescript
// core/models/code-generation.model.ts
export interface GeneratedComponent {
  name: string;
  selector: string;
  typescript: string;
  template: string;
  styles: string;
  spec?: string;
  dependencies: ImportStatement[];
}

export interface ImportStatement {
  module: string;
  imports: string[];
  from: string;
}

export interface CodeGenerationConfig {
  componentName: string;
  selector: string;
  standalone: boolean;
  generateTests: boolean;
  includeFormValidation: boolean;
  styleFormat: 'css' | 'scss' | 'less';
  outputFormat: 'separate' | 'inline';
}

export interface TemplateVariable {
  name: string;
  type: string;
  value: any;
  description?: string;
}
```

## 🎯 Service Specifications

### GrapesJS Service

```typescript
// core/services/grapesjs.service.ts
import { Injectable, signal, computed } from '@angular/core';
import grapesjs from 'grapesjs';

@Injectable({ providedIn: 'root' })
export class GrapesJSService {
  private editor = signal<grapesjs.Editor | null>(null);
  private selectedComponent = signal<grapesjs.Component | null>(null);
  
  // Public readonly signals
  readonly isEditorReady = computed(() => this.editor() !== null);
  readonly currentComponent = computed(() => this.selectedComponent());
  readonly components = computed(() => {
    const editor = this.editor();
    return editor ? this.getComponentTree(editor.getWrapper()) : [];
  });

  initializeEditor(config: GrapesJSConfig): grapesjs.Editor {
    const editor = grapesjs.init({
      ...config,
      plugins: [
        ...config.plugins,
        this.customAngularPlugin
      ],
      pluginsOpts: {
        ...config.pluginsOpts,
        [this.customAngularPlugin]: {
          blocks: this.getAngularBlocks()
        }
      }
    });

    this.setupEventListeners(editor);
    this.editor.set(editor);
    return editor;
  }

  private customAngularPlugin = (editor: grapesjs.Editor) => {
    const blockManager = editor.Blocks;
    const domComponents = editor.DomComponents;

    // Register Angular-specific components
    this.registerAngularComponents(domComponents);
    
    // Add custom blocks
    this.addAngularBlocks(blockManager);
    
    // Setup custom traits (properties panel)
    this.setupCustomTraits(editor);
  };

  private registerAngularComponents(domComponents: any) {
    // Angular Input Component
    domComponents.addType('angular-input', {
      model: {
        defaults: {
          tagName: 'div',
          attributes: { class: 'form-group' },
          components: [
            {
              tagName: 'label',
              type: 'text',
              content: 'Label'
            },
            {
              tagName: 'input',
              attributes: {
                type: 'text',
                class: 'form-control',
                placeholder: 'Enter value'
              }
            }
          ],
          traits: [
            {
              type: 'text',
              name: 'label',
              label: 'Label'
            },
            {
              type: 'text',
              name: 'placeholder',
              label: 'Placeholder'
            },
            {
              type: 'select',
              name: 'inputType',
              label: 'Input Type',
              options: [
                { value: 'text', name: 'Text' },
                { value: 'email', name: 'Email' },
                { value: 'password', name: 'Password' },
                { value: 'number', name: 'Number' }
              ]
            },
            {
              type: 'checkbox',
              name: 'required',
              label: 'Required'
            }
          ]
        }
      },
      view: {
        events: {
          dblclick: 'onActive'
        },
        onActive() {
          // Custom behavior when component is activated
        }
      }
    });

    // Additional component types...
    this.registerSelectComponent(domComponents);
    this.registerCheckboxComponent(domComponents);
    this.registerContainerComponent(domComponents);
  }

  exportToJSON(): string {
    const editor = this.editor();
    if (!editor) throw new Error('Editor not initialized');
    
    return JSON.stringify({
      components: editor.getComponents(),
      styles: editor.getCss(),
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }

  importFromJSON(jsonData: string): void {
    const editor = this.editor();
    if (!editor) throw new Error('Editor not initialized');
    
    const data = JSON.parse(jsonData);
    editor.setComponents(data.components);
    editor.setStyle(data.styles);
  }

  private setupEventListeners(editor: grapesjs.Editor): void {
    editor.on('component:selected', (component) => {
      this.selectedComponent.set(component);
    });

    editor.on('component:deselected', () => {
      this.selectedComponent.set(null);
    });

    editor.on('storage:store', (data) => {
      // Auto-save functionality
      console.log('Project saved:', data);
    });
  }
}
```

### Code Generation Service

```typescript
// core/services/code-generator.service.ts
@Injectable({ providedIn: 'root' })
export class CodeGeneratorService {
  private templates = new Map<string, ComponentTemplate>();

  constructor() {
    this.initializeTemplates();
  }

  generateComponent(
    structure: ComponentStructure,
    config: CodeGenerationConfig
  ): GeneratedComponent {
    const context = this.createGenerationContext(structure, config);
    
    return {
      name: config.componentName,
      selector: config.selector,
      typescript: this.generateTypeScript(context),
      template: this.generateTemplate(context),
      styles: this.generateStyles(context),
      spec: config.generateTests ? this.generateTests(context) : undefined,
      dependencies: this.resolveDependencies(context)
    };
  }

  private generateTypeScript(context: GenerationContext): string {
    const template = `import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
${this.generateAdditionalImports(context)}

@Component({
  selector: '${context.selector}',
  standalone: true,
  imports: [ReactiveFormsModule${this.generateComponentImports(context)}],
  templateUrl: './${context.name}.component.html',
  styleUrl: './${context.name}.component.css'
})
export class ${this.pascalCase(context.name)}Component {
  ${this.generateSignals(context)}
  
  ${this.generateFormGroup(context)}

  constructor(private fb: FormBuilder) {
    ${this.generateFormInitialization(context)}
  }

  ${this.generateEventHandlers(context)}

  ${this.generateValidationMethods(context)}

  ${this.generateSubmitMethod(context)}
}`;

    return this.formatCode(template);
  }

  private generateTemplate(context: GenerationContext): string {
    const components = context.structure.components || [];
    return `<form [formGroup]="form" (ngSubmit)="onSubmit()">
${this.generateComponentsHTML(components, 1)}
</form>`;
  }

  private generateComponentsHTML(components: BaseComponent[], depth: number): string {
    const indent = '  '.repeat(depth);
    
    return components.map(component => {
      switch (component.type) {
        case 'input':
          return `${indent}<div class="form-group">
${indent}  <label for="${component.id}">${component.properties.label || 'Label'}</label>
${indent}  <input 
${indent}    id="${component.id}"
${indent}    formControlName="${component.formControlName || component.id}"
${indent}    type="${component.properties.inputType || 'text'}"
${indent}    placeholder="${component.properties.placeholder || ''}"
${indent}    class="form-control"
${indent}    ${component.properties.required ? 'required' : ''}
${indent}  />
${this.generateValidationErrors(component, depth + 1)}
${indent}</div>`;

        case 'select':
          return `${indent}<div class="form-group">
${indent}  <label for="${component.id}">${component.properties.label || 'Label'}</label>
${indent}  <select 
${indent}    id="${component.id}"
${indent}    formControlName="${component.formControlName || component.id}"
${indent}    class="form-control"
${indent}  >
${this.generateSelectOptions(component.properties.options || [], depth + 2)}
${indent}  </select>
${this.generateValidationErrors(component, depth + 1)}
${indent}</div>`;

        case 'container':
          const containerComponent = component as ContainerComponent;
          return `${indent}<div class="${this.generateContainerClasses(containerComponent)}">
${this.generateComponentsHTML(containerComponent.children, depth + 1)}
${indent}</div>`;

        default:
          return `${indent}<!-- Unknown component type: ${component.type} -->`;
      }
    }).join('\n');
  }

  private generateValidationErrors(component: BaseComponent, depth: number): string {
    const indent = '  '.repeat(depth);
    const controlName = (component as FormComponent).formControlName || component.id;
    
    if (!component.validation?.length) return '';

    return `\n${indent}<div class="error-messages" *ngIf="form.get('${controlName}')?.invalid && form.get('${controlName}')?.touched">
${component.validation.map(rule => 
  `${indent}  <div *ngIf="form.get('${controlName}')?.errors?.['${rule.type}']" class="error-message">
${indent}    ${rule.message}
${indent}  </div>`
).join('\n')}
${indent}</div>`;
  }

  private generateFormGroup(context: GenerationContext): string {
    const formControls = this.extractFormControls(context.structure.components || []);
    
    const controls = formControls.map(control => {
      const validators = this.generateValidators(control.validation || []);
      const defaultValue = control.properties.defaultValue || '';
      
      return `    ${control.formControlName || control.id}: ['${defaultValue}'${validators ? `, ${validators}` : ''}]`;
    }).join(',\n');

    return `form = this.fb.group({
${controls}
  });`;
  }

  private generateValidators(rules: ValidationRule[]): string {
    if (!rules.length) return '';
    
    const validators = rules.map(rule => {
      switch (rule.type) {
        case 'required':
          return 'Validators.required';
        case 'email':
          return 'Validators.email';
        case 'minLength':
          return `Validators.minLength(${rule.value})`;
        case 'maxLength':
          return `Validators.maxLength(${rule.value})`;
        case 'pattern':
          return `Validators.pattern('${rule.value}')`;
        default:
          return '';
      }
    }).filter(v => v);

    return validators.length === 1 ? validators[0] : `[${validators.join(', ')}]`;
  }

  private formatCode(code: string): string {
    // Basic code formatting - could integrate with Prettier
    return code
      .split('\n')
      .map(line => line.trimRight())
      .join('\n');
  }

  exportToFiles(component: GeneratedComponent): { [filename: string]: string } {
    const files: { [filename: string]: string } = {};
    
    files[`${component.name}.component.ts`] = component.typescript;
    files[`${component.name}.component.html`] = component.template;
    files[`${component.name}.component.css`] = component.styles;
    
    if (component.spec) {
      files[`${component.name}.component.spec.ts`] = component.spec;
    }

    return files;
  }

  generateZipArchive(component: GeneratedComponent): Promise<Blob> {
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    const files = this.exportToFiles(component);
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });

    return zip.generateAsync({ type: 'blob' });
  }
}
```

### Dynamic Renderer Service

```typescript
// core/services/dynamic-renderer.service.ts
@Injectable({ providedIn: 'root' })
export class DynamicRendererService {
  private componentCache = new Map<string, ComponentRef<any>>();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  renderComponent(
    definition: ComponentDefinition,
    container: ViewContainerRef
  ): ComponentRef<any> {
    const cacheKey = this.generateCacheKey(definition);
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey)!;
    }

    const component = this.createComponent(definition, container);
    this.componentCache.set(cacheKey, component);
    
    return component;
  }

  private createComponent(
    definition: ComponentDefinition,
    container: ViewContainerRef
  ): ComponentRef<any> {
    // Create dynamic component based on definition
    const componentType = this.getComponentType(definition.type);
    const componentRef = container.createComponent(componentType);
    
    // Set component properties
    this.setComponentProperties(componentRef, definition.properties);
    
    // Setup event handlers
    this.setupEventHandlers(componentRef, definition.events || []);
    
    return componentRef;
  }

  private getComponentType(type: ComponentType): any {
    const componentMap = {
      'input': DynamicInputComponent,
      'select': DynamicSelectComponent,
      'checkbox': DynamicCheckboxComponent,
      'container': DynamicContainerComponent
      // Add more mappings
    };
    
    return componentMap[type] || DynamicInputComponent;
  }

  clearCache(): void {
    this.componentCache.forEach(ref => ref.destroy());
    this.componentCache.clear();
  }
}
```

## 🎨 Custom CSS Design System

### CSS Variables and Tokens

```css
/* assets/styles/design-system.css */
:root {
  /* Color Palette */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Spacing Scale */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  
  /* Layout */
  --header-height: 3.5rem;
  --sidebar-width: 16rem;
  --panel-min-width: 20rem;
  --toolbar-height: 2.5rem;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  
  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Layout Grid System */
.layout-grid {
  display: grid;
  grid-template-areas: 
    "header header header header"
    "toolbar editor preview properties";
  grid-template-columns: auto 1fr 1fr auto;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
  overflow: hidden;
  background-color: var(--gray-50);
}

.header { 
  grid-area: header;
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.toolbar { 
  grid-area: toolbar;
  background-color: white;
  border-right: 1px solid var(--gray-200);
  width: var(--sidebar-width);
}

.editor { 
  grid-area: editor;
  background-color: white;
  border-right: 1px solid var(--gray-200);
  overflow: hidden;
}

.preview { 
  grid-area: preview;
  background-color: var(--gray-50);
  border-right: 1px solid var(--gray-200);
}

.properties { 
  grid-area: properties;
  background-color: white;
  width: var(--panel-min-width);
  overflow-y: auto;
}

/* Component Styles */
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.form-control {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--gray-900);
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: var(--line-height-tight);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-primary {
  color: white;
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.btn-primary:hover {
  background-color: var(--primary-700);
  border-color: var(--primary-700);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-areas: 
      "header header"
      "editor preview";
    grid-template-columns: 1fr 1fr;
  }
  
  .toolbar,
  .properties {
    display: none;
  }
}

@media (max-width: 768px) {
  .layout-grid {
    grid-template-areas: 
      "header"
      "editor";
    grid-template-columns: 1fr;
  }
  
  .preview {
    display: none;
  }
}
```

## ⚡ Performance Optimization Strategies

### Code Splitting and Lazy Loading

```typescript
// Lazy load GrapesJS only when needed
const loadGrapesJS = () => import('grapesjs');

// Lazy load heavy components
const CodeEditorComponent = lazy(() => import('./code-editor/code-editor.component'));
const PreviewIframeComponent = lazy(() => import('./preview-iframe/preview-iframe.component'));
```

### Change Detection Optimization

```typescript
// Use OnPush change detection strategy
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class EditorPanelComponent {
  // Use signals for reactive state
  private selectedComponent = signal<Component | null>(null);
  
  // Use computed for derived state
  readonly hasSelection = computed(() => this.selectedComponent() !== null);
  
  // Use trackBy functions for ngFor
  trackByComponentId = (index: number, component: Component) => component.id;
}
```

### Memory Management

```typescript
// Clean up subscriptions and resources
@Component({
  // ...
})
export class EditorComponent implements OnDestroy {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    // Auto-cleanup with takeUntilDestroyed
    this.grapesService.selectedComponent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(component => {
        // Handle selection changes
      });
  }
}
```

## 🧪 Testing Strategy

### Unit Testing Templates

```typescript
// component.spec.ts template
describe('EditorPanelComponent', () => {
  let component: EditorPanelComponent;
  let fixture: ComponentFixture<EditorPanelComponent>;
  let grapesService: jasmine.SpyObj<GrapesJSService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GrapesJSService', ['initializeEditor', 'exportToJSON']);

    await TestBed.configureTestingModule({
      imports: [EditorPanelComponent],
      providers: [
        { provide: GrapesJSService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorPanelComponent);
    component = fixture.componentInstance;
    grapesService = TestBed.inject(GrapesJSService) as jasmine.SpyObj<GrapesJSService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize editor on init', () => {
    component.ngOnInit();
    expect(grapesService.initializeEditor).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// integration.spec.ts
describe('Form Constructor Integration', () => {
  let app: ComponentFixture<AppComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        // Mock external dependencies
      ]
    }).compileComponents();
    
    app = TestBed.createComponent(AppComponent);
  });

  it('should create a complete form workflow', async () => {
    // Test drag and drop
    // Test property editing
    // Test code generation
    // Test export functionality
  });
});
```

## 📦 Build and Deployment

### Angular Build Configuration

```json
// angular.json optimizations
{
  "build": {
    "options": {
      "optimization": {
        "scripts": true,
        "styles": true,
        "fonts": true
      },
      "outputHashing": "all",
      "sourceMap": false,
      "namedChunks": false,
      "aot": true,
      "extractLicenses": true,
      "vendorChunk": false,
      "buildOptimizer": true
    }
  }
}
```

### Bundle Analyzer Setup

```bash
npm install --save-dev webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/form-constructor/stats.json
```

This technical specification provides the detailed implementation roadmap needed to build the comprehensive Angular 19 form constructor. Each section can be referenced during development to ensure consistency and quality throughout the implementation process.