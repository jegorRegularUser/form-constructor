import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { EditorElement } from '../../../../core/models/drag-data.model';
import { FormProperties } from '../../../../core/models/form-properties.model';

// Improved syntax highlighter for TypeScript/HTML
function highlightCode(code: string, language: string): string {
  if (!code) return '';

  // First escape HTML entities to prevent XSS and broken rendering
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '\'');
  };

  let escapedCode = escapeHtml(code);

  if (language === 'typescript') {
    return escapedCode
      .replace(
        /\b(import|from|export|class|extends|implements|constructor|public|private|protected|readonly|static|async|await|function|return|const|let|var|if|else|for|while|switch|case|break|continue|default|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of)\b/g,
        '<span class="keyword">$1</span>'
      )
      .replace(
        /\b(@Component|@Input|@Output|@ViewChild|@ViewChildren|Injectable|OnInit|OnChanges|OnDestroy)\b/g,
        '<span class="decorator">$1</span>'
      )
      .replace(
        /\b(string|number|boolean|any|void|undefined|null|unknown|never|object)\b/g,
        '<span class="type">$1</span>'
      )
      .replace(
        /\b(true|false|null|undefined)\b/g,
        '<span class="literal">$1</span>'
      )
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
      .replace(/(&#39;.*?&#39;|&quot;.*?&quot;|`.*?`)/g, '<span class="string">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="number">$1</span>');
  } else if (language === 'html') {
    // Process HTML with proper tag recognition
    return escapedCode
      .replace(
        /(&lt;\/?)([a-zA-Z][a-zA-Z0-9:-]*)/g,
        '$1<span class="tag">$2</span>'
      )
      .replace(/([a-zA-Z-]+)=/g, '<span class="attribute">$1</span>=')
      .replace(
        /(&quot;[^&quot;]*&quot;|&#39;[^&#39;]*&#39;)/g,
        '<span class="string">$1</span>'
      )
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comment">$1</span>')
      .replace(/({{[\s\S]*?}})/g, '<span class="interpolation">$1</span>')
      .replace(/(\[[^\]]*\])/g, '<span class="binding">$1</span>')
      .replace(/(\([^)]*\))/g, '<span class="event">$1</span>');
  }
  return escapedCode;
}

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="code-viewer">
      <div class="code-header">

      </div>

      <div class="code-tabs">
        <div class="tab-buttons">
          <button
            *ngFor="let tab of tabs"
            (click)="activeTab = tab.id"
            [class.active]="activeTab === tab.id"
            class="tab-button"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- TypeScript Tab -->
          <div *ngIf="activeTab === 'typescript'" class="code-content">
            <div
              #typescriptCode
              class="code-display typescript"
              [innerHTML]="highlightedTypescriptCode"
            ></div>
          </div>



          <!-- Usage Tab -->
          <div *ngIf="activeTab === 'usage'" class="code-content">
            <div
              #usageCode
              class="code-display typescript"
              [innerHTML]="highlightedUsageCode"
            ></div>
          </div>
        </div>
      </div>

      <div class="code-actions">
        <button nz-button nzType="primary" (click)="copyActiveTabCode()">
          <span nz-icon nzType="copy"></span>
          Copy {{ getActiveTabLabel() }}
        </button>
        <button nz-button nzType="default" (click)="copyAllCode()">
          <span nz-icon nzType="file-zip"></span>
          Copy All Files
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .code-viewer {
        padding: 0;
        background: #f5f5f5;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }

      .code-header {
        text-align: center;
        margin-bottom: 8px;
        padding: 16px 24px 0;
        flex-shrink: 0;
      }

      .code-header h3 {
        margin: 0 0 8px 0;
        color: #262626;
      }

      .code-header p {
        margin: 0;
        color: #666;
      }

      .code-tabs {
        background: white;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin: 0 16px 16px;
      }

      .tab-buttons {
        display: flex;
        border-bottom: 1px solid #d9d9d9;
        padding: 0 16px;
        flex-shrink: 0;
        background: #fafafa;
      }

      .tab-button {
        padding: 12px 24px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 14px;
        color: #666;
        transition: all 0.2s;
      }

      .tab-button:hover {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.05);
      }

      .tab-button.active {
        color: #1890ff;
        border-bottom-color: #1890ff;
        background: white;
      }

      .tab-content {
        padding: 0;
        flex: 1;
        overflow: hidden;
        background: white;
      }

      .code-content {
        background: #1e1e1e;
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      .code-display {
        width: 100%;
        height: 100%;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        padding: 16px;
        color: #d4d4d4;
        overflow: auto;
        box-sizing: border-box;
        white-space: pre;
        tab-size: 2;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }



      /* Syntax highlighting for TypeScript */
      .typescript .keyword {
        color: #569cd6;
      }

      .typescript .decorator {
        color: #4ec9b0;
      }

      .typescript .type {
        color: #4ec9b0;
      }

      .typescript .string {
        color: #ce9178;
      }

      .typescript .number {
        color: #b5cea8;
      }

      .typescript .comment {
        color: #6a9955;
        font-style: italic;
      }

      .typescript .literal {
        color: #569cd6;
      }

      /* Syntax highlighting for HTML */
      .html .tag {
        color: #569cd6;
      }

      .html .attribute {
        color: #9cdcfe;
      }

      .html .string {
        color: #ce9178;
      }

      .html .comment {
        color: #6a9955;
        font-style: italic;
      }

      .html .interpolation {
        color: #d7ba7d;
      }

      .html .binding {
        color: #ffd700;
      }

      .html .event {
        color: #d7ba7d;
      }

      /* Scrollbar styling */
      .code-display::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      .code-display::-webkit-scrollbar-track {
        background: #1e1e1e;
      }

      .code-display::-webkit-scrollbar-thumb {
        background: #424242;
        border-radius: 6px;
      }

      .code-display::-webkit-scrollbar-thumb:hover {
        background: #4f4f4f;
      }

      .code-display::-webkit-scrollbar-corner {
        background: #1e1e1e;
      }

      .code-actions {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        background: white;
        border-top: 1px solid #d9d9d9;
        flex-shrink: 0;
        margin: 0 16px;
        border-radius: 0 0 8px 8px;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .code-tabs {
          margin: 0 16px 16px;
        }

        .code-header {
          padding: 16px 16px 0;
        }

        .tab-button {
          padding: 10px 16px;
          font-size: 13px;
        }

        .code-display {
          font-size: 12px;
          padding: 12px;
        }
      }
    `,
  ],
})
export class CodeViewerComponent implements OnChanges, AfterViewInit {
  @Input() elements: EditorElement[][] = [];
  @Input() formProperties: FormProperties = { id: 'default-form' };

  @ViewChild('typescriptCode') typescriptCodeRef!: ElementRef;

  @ViewChild('usageCode') usageCodeRef!: ElementRef;

  tabs = [
    { id: 'typescript', label: 'Component' },
    { id: 'usage', label: 'Usage' },
  ];
  activeTab = 'typescript';

  generatedComponentCode = '';
  generatedTemplateCode = '';
  generatedUsageCode = '';

  highlightedTypescriptCode = '';
  highlightedTemplateCode = '';
  highlightedUsageCode = '';

  ngOnChanges(): void {
    this.generateAllCode();
    this.highlightAllCode();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.adjustCodeContainers();
    });
  }

  private adjustCodeContainers(): void {
    const containers = [
      this.typescriptCodeRef,
      this.usageCodeRef,
    ].filter((ref) => ref);

    containers.forEach((ref) => {
      if (ref && ref.nativeElement) {
        const container = ref.nativeElement;
        container.style.height = '100%';
        container.style.overflow = 'auto';
      }
    });
  }

  generateAllCode(): void {
    this.generateComponentCode();
    this.generateTemplateCode();
    this.generateUsageCode();
  }

  highlightAllCode(): void {
    this.highlightedTypescriptCode = highlightCode(
      this.generatedComponentCode,
      'typescript'
    ).replace(/&amp;#39;/g, '\'');

    this.highlightedUsageCode = highlightCode(
      this.generatedUsageCode,
      'typescript'
    ).replace(/&amp;#39;/g, '\'');
  }

  private generateComponentCode(): void {
    const formName = this.getFormName();
    const className = this.getClassName();
    const templateCode = this.buildFormTemplate();
    const stylesCode = this.buildStyles();

    // Escape backticks and dollars for template literal
    const escapedTemplateCode = templateCode
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    const escapedStylesCode = stylesCode
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');

    this.generatedComponentCode = `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-${this.getSelectorName()}',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzIconModule
  ],
  template: \`${escapedTemplateCode}\`,
  styles: [\`${escapedStylesCode}\`]
})
export class ${className} implements OnInit {
  ${this.getFormVariableName()}: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.${this.getFormVariableName()} = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.${this.getFormVariableName()} = this.fb.group({
${this.buildFormControls()}
    });
  }

  onSubmit(): void {
    if (this.${this.getFormVariableName()}.valid) {
      this.message.success('Form submitted successfully!');
      console.log('Form values:', this.${this.getFormVariableName()}.value);
      // Handle form submission here
      ${this.getSubmitHandler()}
    } else {
      this.message.error('Please fill all required fields correctly');
      this.markAllFieldsAsTouched();
    }
  }

  onReset(): void {
    this.${this.getFormVariableName()}.reset();
    this.message.info('Form reset');
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.${this.getFormVariableName()}.controls).forEach(key => {
      const control = this.${this.getFormVariableName()}.get(key);
      if (control?.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  // Helper method to get form data
  getFormData(): any {
    return this.${this.getFormVariableName()}.value;
  }

  // Helper method to check if form is valid
  isFormValid(): boolean {
    return this.${this.getFormVariableName()}.valid;
  }
}`;
  }

  private generateTemplateCode(): void {
    this.generatedTemplateCode = this.buildFormTemplate();
  }

  private generateUsageCode(): void {
    const className = this.getClassName();

    this.generatedUsageCode = `// 1. Save the component code above as ${this.getSelectorName()}.component.ts

// 2. Use in your template:
<app-${this.getSelectorName()}></app-${this.getSelectorName()}>

// 3. Or use in another component:
@Component({
  template: \`
    <app-${this.getSelectorName()}></app-${this.getSelectorName()}>
  \`
})
export class ParentComponent {
  // You can use @ViewChild to access form component
  @ViewChild(${className}) formComponent!: ${className};

  onFormAction(): void {
    const formData = this.formComponent.getFormData();
    const isValid = this.formComponent.isFormValid();
    console.log('Form Data:', formData, 'Valid:', isValid);
  }
}

// 4. Installation requirements:
// Make sure you have these dependencies:
// npm install @angular/forms
// npm install ng-zorro-antd

// 5. Import necessary modules in your main.ts or app.config.ts:
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { importProvidersFrom } from '@angular/core';
// import { NzFormModule, NzInputModule, NzButtonModule, NzSelectModule, NzIconModule } from 'ng-zorro-antd';`;
  }

  // Остальные методы остаются без изменений...
  // [Все остальные методы из предыдущей версии остаются такими же]

  // Helper methods for code generation
  private getFormName(): string {
    return (this.formProperties as any).name || 'generated-form';
  }

  private getClassName(): string {
    const name = this.getFormName();
    return (
      name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Component'
    );
  }

  private getSelectorName(): string {
    return this.getKebabCase(this.getFormName());
  }

  private getFormVariableName(): string {
    return this.getFormName().replace(/-/g, '') + 'Form';
  }

  private getKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private buildFormControls(): string {
    const controls: string[] = [];

    this.elements.forEach((row) => {
      row.forEach((element) => {
        if (
          this.isFormField(element) &&
          this.getProperty(element, 'visible') !== false
        ) {
          const validators = this.buildValidators(element);
          const defaultValue = this.getProperty(element, 'defaultValue') || '';
          const defaultValueStr =
            typeof defaultValue === 'string'
              ? `'${defaultValue}'`
              : defaultValue;
          controls.push(
            `      ${element.id}: [${defaultValueStr}, ${validators}]`
          );
        }
      });
    });

    return controls.join(',\n');
  }

  private buildValidators(element: EditorElement): string {
    const validators: string[] = [];

    if (element.required) {
      validators.push('Validators.required');
    }

    const minLength = this.getProperty(element, 'minLength');
    if (minLength) {
      validators.push(`Validators.minLength(${minLength})`);
    }

    const maxLength = this.getProperty(element, 'maxLength');
    if (maxLength) {
      validators.push(`Validators.maxLength(${maxLength})`);
    }

    const pattern = this.getProperty(element, 'pattern');
    if (pattern) {
      validators.push(`Validators.pattern('${pattern.replace(/'/g, "\\'")}')`);
    }

    if (validators.length === 0) {
      return '[]';
    } else if (validators.length === 1) {
      return validators[0];
    } else {
      return `[${validators.join(', ')}]`;
    }
  }

  private buildFormTemplate(): string {
    if (!this.elements.length) {
      return '<!-- No form elements -->';
    }

    let template = `<form nz-form [formGroup]="${this.getFormVariableName()}" (ngSubmit)="onSubmit()" class="${
      this.formProperties.customClass || ''
    }">\n`;

    // Add form title
    if (
      this.formProperties.titleConfig?.visible !== false &&
      this.formProperties.titleConfig?.text
    ) {
      template += `  <div class="form-title">${this.formProperties.titleConfig.text}</div>\n`;
    }

    // Add form description
    if (this.formProperties.description) {
      template += `  <div class="form-description">${this.formProperties.description}</div>\n`;
    }

    // Add form elements
    this.elements.forEach((row) => {
      template += '  <div nz-row nzGutter="16">\n';

      row.forEach((element) => {
        if (this.getProperty(element, 'visible') === false) {
          return;
        }

        const colSpan = Math.floor(24 / Math.max(row.length, 1));
        template += `    <div nz-col nzSpan="${colSpan}">\n`;
        template += this.generateElementTemplate(element);
        template += '    </div>\n';
      });

      template += '  </div>\n';
    });

    // Add form actions
    template += this.buildFormActions();

    template += '</form>';

    return template;
  }

  private generateElementTemplate(element: EditorElement): string {
    switch (element.type) {
      case 'input':
        return this.generateInputTemplate(element);
      case 'textarea':
        return this.generateTextareaTemplate(element);
      case 'select':
        return this.generateSelectTemplate(element);
      case 'button':
        return this.generateButtonTemplate(element);
      default:
        return `      <!-- ${element.type} element -->\n`;
    }
  }

  private generateInputTemplate(element: EditorElement): string {
    const props = element as any;

    return `      <nz-form-item>
        <nz-form-label ${element.required ? 'nzRequired' : ''}>${
      element.label || 'Input'
    }</nz-form-label>
        <nz-form-control>
          <input 
            nz-input 
            formControlName="${element.id}"
            type="${props.inputType || 'text'}"
            placeholder="${props.placeholder || 'Enter text...'}"
            ${props.readOnly ? '[readOnly]="true"' : ''}
            ${props.disabled ? '[disabled]="true"' : ''}
            class="${props.customClass || ''}"
          >
        </nz-form-control>
      </nz-form-item>\n`;
  }

  private generateTextareaTemplate(element: EditorElement): string {
    const props = element as any;
    const rows = props.rows || 3;

    return `      <nz-form-item>
        <nz-form-label ${element.required ? 'nzRequired' : ''}>${
      element.label || 'Textarea'
    }</nz-form-label>
        <nz-form-control>
          <textarea 
            nz-input 
            formControlName="${element.id}"
            placeholder="${props.placeholder || 'Enter text...'}"
            [nzAutosize]="{ minRows: ${rows}, maxRows: ${
      props.maxRows || Math.max(rows + 3, 6)
    } }"
            ${props.readOnly ? '[readOnly]="true"' : ''}
            ${props.disabled ? '[disabled]="true"' : ''}
            class="${props.customClass || ''}"
          ></textarea>
        </nz-form-control>
      </nz-form-item>\n`;
  }

  private generateSelectTemplate(element: EditorElement): string {
    const props = element as any;
    const options = props.options || [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
    ];

    let optionsCode = options
      .map(
        (opt: any) =>
          `            <nz-option nzLabel="${opt.label}" nzValue="${
            opt.value
          }" ${opt.disabled ? 'nzDisabled' : ''}></nz-option>`
      )
      .join('\n');

    return `      <nz-form-item>
        <nz-form-label ${element.required ? 'nzRequired' : ''}>${
      element.label || 'Select'
    }</nz-form-label>
        <nz-form-control>
          <nz-select 
            formControlName="${element.id}"
            nzPlaceHolder="${props.placeholder || 'Please select'}"
            ${props.allowClear !== false ? 'nzAllowClear' : ''}
            ${props.showSearch ? 'nzShowSearch' : ''}
            ${props.disabled ? 'nzDisabled' : ''}
            class="${props.customClass || ''}"
          >
${optionsCode}
          </nz-select>
        </nz-form-control>
      </nz-form-item>\n`;
  }

  private generateButtonTemplate(element: EditorElement): string {
    const props = element as any;

    return `      <button
        nz-button
        nzType="${props.buttonType || 'default'}"
        nzSize="${props.size || 'default'}"
        ${props.shape ? `nzShape="${props.shape}"` : ''}
        ${props.block ? 'nzBlock' : ''}
        ${props.ghost ? 'nzGhost' : ''}
        ${props.danger ? 'nzDanger' : ''}
        ${props.disabled ? '[disabled]="true"' : ''}
        ${props.loading ? '[nzLoading]="true"' : ''}
        type="${props.htmlButtonType || 'button'}"
        class="${props.customClass || ''}"
        (click)="${
          props.htmlButtonType === 'submit'
            ? 'onSubmit()'
            : props.htmlButtonType === 'reset'
            ? 'onReset()'
            : '// Handle button click'
        }"
      >
        ${props.icon ? `<span nz-icon nzType="${props.icon}"></span>` : ''}
        ${props.text || element.label || 'Button'}
      </button>\n`;
  }

  private buildFormActions(): string {
    return `  <div nz-row nzJustify="end" style="margin-top: 24px;">
    <button nz-button nzType="primary" type="submit">${
      (this.formProperties.submitButton as any)?.text || 'Submit'
    }</button>
    <button nz-button nzType="default" type="button" style="margin-left: 8px;" (click)="onReset()">${
      (this.formProperties.resetButton as any)?.text || 'Reset'
    }</button>
  </div>\n`;
  }

  private buildStyles(): string {
    const formStyle = this.formProperties.formStyle;

    let styles = `/* Form Styles */
.form-title {
  font-size: ${
    formStyle?.fontSize ? `calc(${formStyle.fontSize}px + 10px)` : '24px'
  };
  font-weight: ${this.formatFontWeight(formStyle?.fontWeight) || 'bold'};
  color: ${formStyle?.color || '#000000'};
  text-align: ${formStyle?.textAlign || 'center'};
  margin-bottom: 16px;
}

.form-description {
  font-size: ${formStyle?.fontSize ? `${formStyle.fontSize}px` : '14px'};
  color: #666;
  text-align: ${formStyle?.textAlign || 'center'};
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Form container */
form {
  background-color: ${formStyle?.backgroundColor || '#ffffff'};
  border: ${formStyle?.borderWidth || '1'}px solid ${
      formStyle?.borderColor || '#cccccc'
    };
  border-radius: ${formStyle?.borderRadius || '8'}px;
  padding: ${this.formatDimension(formStyle?.padding, '24px')};
  ${formStyle?.boxShadow ? `box-shadow: ${formStyle.boxShadow};` : ''}
  font-family: ${formStyle?.fontFamily || 'inherit'};
}

/* Form rows and elements */
[nz-row] {
  margin-bottom: 16px;
}

[nz-row]:last-child {
  margin-bottom: 0;
}

/* Form fields */
nz-form-item {
  margin-bottom: 0;
}

/* Textarea specific styles */
textarea[nz-input] {
  min-height: 80px;
  resize: vertical;
}

/* Button spacing */
button + button {
  margin-left: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  form {
    padding: 16px;
    margin: 0 8px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  [nz-col] {
    margin-bottom: 16px;
  }
}`;

    return styles;
  }

  private getSubmitHandler(): string {
    return '// Add your form submission logic here';
  }

  private formatDimension(value: any, defaultValue: string = ''): string {
    if (!value) return defaultValue;

    if (typeof value === 'object' && 'value' in value && 'unit' in value) {
      return `${value.value}${value.unit}`;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return `${value}px`;
    }

    return defaultValue;
  }

  private formatFontWeight(value: any): string {
    if (!value) return '';

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value;
    }

    return '';
  }

  private isFormField(element: EditorElement): boolean {
    return ['input', 'textarea', 'select'].includes(element.type);
  }

  private getProperty(element: EditorElement, property: string): any {
    return (element as any)[property];
  }

  // Copy methods
  copyActiveTabCode(): void {
    let code = '';
    switch (this.activeTab) {
      case 'typescript':
        code = this.generatedComponentCode;
        break;

      case 'usage':
        code = this.generatedUsageCode;
        break;
    }

    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copied to clipboard');
    });
  }

  copyAllCode(): void {
    const allCode = `// ${this.getClassName()}.component.ts\n\n${
      this.generatedComponentCode
    }\n\n// ${this.getSelectorName()}.component.html\n\n${
      this.generatedTemplateCode
    }\n\n// Usage Instructions\n\n${this.generatedUsageCode}`;
    navigator.clipboard.writeText(allCode).then(() => {
      console.log('All code copied to clipboard');
    });
  }

  getActiveTabLabel(): string {
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    return tab ? tab.label : 'Code';
  }
}
