import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule, NzButtonType } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EditorElement } from '../../../../core/models/drag-data.model';
import { FormProperties } from '../../../../core/models/form-properties.model';

@Component({
  selector: 'app-form-preview',
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
  template: `
    <div class="form-preview" [ngStyle]="getPreviewContainerStyles()">
      <form 
        nz-form 
        [formGroup]="previewForm" 
        (ngSubmit)="onSubmit()" 
        class="preview-form"
        [ngStyle]="getFormStyles()"
        [ngClass]="formProperties.customClass || ''"
      >
        <!-- Form Title -->
        <div 
          *ngIf="formProperties.titleConfig?.visible !== false && formProperties.titleConfig?.text"
          class="form-title"
          [ngStyle]="getTitleStyles()"
        >
          {{ formProperties.titleConfig?.text }}
        </div>

        <!-- Form Description -->
        <div 
          *ngIf="formProperties.description"
          class="form-description"
          [ngStyle]="getDescriptionStyles()"
        >
          {{ formProperties.description }}
        </div>

        <!-- Form Elements -->
        <div *ngFor="let row of elements; let rowIndex = index" class="preview-row">
          <div *ngFor="let element of row" class="preview-element" [ngStyle]="getElementStyles(element)">
            <!-- Skip hidden elements -->
            <ng-container *ngIf="getProperty(element, 'visible') !== false">
              
              <!-- Input Field -->
              <div *ngIf="element.type === 'input'" class="form-field">
                <label 
                  class="field-label" 
                  [class.required]="element.required"
                  [ngStyle]="getLabelStyles(element)"
                >
                  {{ element.label || 'Input Field' }}
                </label>
                <input
                  nz-input
                  [id]="element.id"
                  [formControlName]="element.id"
                  [placeholder]="getPlaceholder(element, 'Enter text...')"
                  [type]="getProperty(element, 'inputType') || 'text'"
                  [required]="element.required"
                  [readOnly]="getProperty(element, 'readOnly')"
                  [disabled]="getProperty(element, 'disabled')"
                  [ngStyle]="getInputStyles(element)"
                  [ngClass]="getProperty(element, 'customClass') || ''"
                />
                <div 
                  *ngIf="getProperty(element, 'description')" 
                  class="field-description"
                  [ngStyle]="getDescriptionStyles(element)"
                >
                  {{ getProperty(element, 'description') }}
                </div>
              </div>

              <!-- Textarea Field -->
              <div *ngIf="element.type === 'textarea'" class="form-field">
                <label 
                  class="field-label" 
                  [class.required]="element.required"
                  [ngStyle]="getLabelStyles(element)"
                >
                  {{ element.label || 'Textarea' }}
                </label>
                <textarea
                  nz-input
                  [id]="element.id"
                  [formControlName]="element.id"
                  [placeholder]="getPlaceholder(element, 'Enter text here...')"
                  [rows]="getProperty(element, 'rows') || 3"
                  [required]="element.required"
                  [readOnly]="getProperty(element, 'readOnly')"
                  [disabled]="getProperty(element, 'disabled')"
                  [ngStyle]="getTextareaStyles(element)"
                  [ngClass]="getProperty(element, 'customClass') || ''"
                ></textarea>
                <div 
                  *ngIf="getProperty(element, 'description')" 
                  class="field-description"
                  [ngStyle]="getDescriptionStyles(element)"
                >
                  {{ getProperty(element, 'description') }}
                </div>
              </div>

              <!-- Select Field -->
              <div *ngIf="element.type === 'select'" class="form-field">
                <label 
                  class="field-label" 
                  [class.required]="element.required"
                  [ngStyle]="getLabelStyles(element)"
                >
                  {{ element.label || 'Select' }}
                </label>
                <nz-select
                  [id]="element.id"
                  [formControlName]="element.id"
                  [nzPlaceHolder]="getPlaceholder(element, 'Please select')"
                  [nzAllowClear]="getProperty(element, 'allowClear') !== false"
                  [nzShowSearch]="getProperty(element, 'showSearch')"
                  [nzDisabled]="getProperty(element, 'disabled')"
                  [nzSize]="getProperty(element, 'size') || 'default'"
                  [ngStyle]="getSelectStyles(element)"
                  [ngClass]="getProperty(element, 'customClass') || ''"
                >
                  <nz-option
                    *ngFor="let option of getSelectOptions(element)"
                    [nzLabel]="option.label"
                    [nzValue]="option.value"
                    [nzDisabled]="option.disabled"
                  ></nz-option>
                </nz-select>
                <div 
                  *ngIf="getProperty(element, 'description')" 
                  class="field-description"
                  [ngStyle]="getDescriptionStyles(element)"
                >
                  {{ getProperty(element, 'description') }}
                </div>
              </div>

              <!-- Button -->
              <div *ngIf="element.type === 'button'" class="button-preview">
                <button
                  nz-button
                  [nzType]="getButtonType(element)"
                  [nzSize]="getProperty(element, 'size') || 'default'"
                  [nzShape]="getProperty(element, 'shape')"
                  [nzLoading]="getProperty(element, 'loading')"
                  [nzBlock]="getProperty(element, 'block')"
                  [nzGhost]="getProperty(element, 'ghost')"
                  [nzDanger]="getProperty(element, 'danger')"
                  [disabled]="getProperty(element, 'disabled')"
                  [type]="getProperty(element, 'htmlButtonType') || 'button'"
                  [ngStyle]="getButtonStyles(element)"
                  [ngClass]="getProperty(element, 'customClass') || ''"
                  (click)="onButtonClick(element)"
                >
                  <span *ngIf="getProperty(element, 'icon')" nz-icon [nzType]="getProperty(element, 'icon')"></span>
                  {{ getProperty(element, 'text') || getProperty(element, 'label') || 'Button' }}
                </button>
                <div 
                  *ngIf="getProperty(element, 'description')" 
                  class="field-description"
                  [ngStyle]="getDescriptionStyles(element)"
                >
                  {{ getProperty(element, 'description') }}
                </div>
              </div>

            </ng-container>
          </div>
        </div>

        <!-- Submit Button (if form has inputs) -->
        <div class="form-actions" *ngIf="hasFormElements" [ngStyle]="getActionsStyles()">
          <button 
            nz-button 
            nzType="primary" 
            type="submit" 
            [disabled]="!previewForm.valid"
            [ngStyle]="getSubmitButtonStyles()"
          >
            {{ getSubmitButtonText() }}
          </button>
          <button 
            nz-button 
            nzType="default" 
            type="button" 
            (click)="resetForm()"
            [ngStyle]="getResetButtonStyles()"
          >
            {{ getResetButtonText() }}
          </button>
        </div>
      </form>

      <!-- Empty State -->
      <div *ngIf="!hasElements" class="empty-preview">
        <div class="empty-content">
          <span nz-icon nzType="form" class="empty-icon"></span>
          <p>No form elements added yet</p>
          <p class="empty-description">Switch to Editor mode to add form elements</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-preview {
      padding: 24px;
      background: #f5f5f5;
      min-height: 400px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    
    .preview-form {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
    }
    
    .form-title {
      margin-bottom: 16px;
      font-weight: bold;
      text-align: center;
    }
    
    .form-description {
      margin-bottom: 24px;
      color: #666;
      text-align: center;
    }
    
    .preview-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    
    .preview-element {
      flex: 1;
      min-width: 0;
    }
    
    .form-field {
      margin-bottom: 0;
      width: 100%;
    }
    
    .field-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #262626;
    }
    
    .field-label.required::after {
      content: '*';
      color: #ff4d4f;
      margin-left: 4px;
    }
    
    .field-description {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      line-height: 1.4;
    }
    
    .button-preview {
      padding-top: 0;
      width: 100%;
    }
    
    .button-preview button {
      width: auto;
      min-width: 80px;
    }
    
    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    
    .empty-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      background: white;
      border-radius: 8px;
      border: 2px dashed #d9d9d9;
      width: 100%;
    }
    
    .empty-content {
      text-align: center;
      color: #999;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .empty-description {
      font-size: 14px;
      margin-top: 8px;
    }

    /* Layout styles */
    .auto-expand {
      width: 100%;
    }
  `]
})
export class FormPreviewComponent implements OnChanges {
  @Input() elements: EditorElement[][] = [];
  @Input() formProperties: FormProperties = { id: 'default-form' };

  previewForm: FormGroup;
  hasFormElements = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.previewForm = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['elements'] || changes['formProperties']) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const formControls: any = {};
    this.hasFormElements = false;

    // Create form controls based on elements
    this.elements.forEach(row => {
      row.forEach(element => {
        if (this.isFormField(element) && this.getProperty(element, 'visible') !== false) {
          this.hasFormElements = true;
          const validators = [];
          
          if (element.required) {
            validators.push(Validators.required);
          }

          // Add minLength validation
          const minLength = this.getProperty(element, 'minLength');
          if (minLength) {
            validators.push(Validators.minLength(minLength));
          }

          // Add maxLength validation
          const maxLength = this.getProperty(element, 'maxLength');
          if (maxLength) {
            validators.push(Validators.maxLength(maxLength));
          }

          // Add pattern validation
          const pattern = this.getProperty(element, 'pattern');
          if (pattern) {
            validators.push(Validators.pattern(pattern));
          }

          formControls[element.id] = [
            this.getProperty(element, 'defaultValue') || '', 
            validators
          ];
        }
      });
    });

    this.previewForm = this.fb.group(formControls);
  }

  private isFormField(element: EditorElement): boolean {
    return ['input', 'textarea', 'select'].includes(element.type);
  }

  get hasElements(): boolean {
    return this.elements.some(row => row.length > 0);
  }

  getSelectOptions(element: EditorElement): any[] {
    return this.getProperty(element, 'options') || [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ];
  }

  getButtonType(element: EditorElement): NzButtonType {
    const buttonType = this.getProperty(element, 'buttonType') || 'default';
    const validTypes: NzButtonType[] = ['primary', 'default', 'dashed', 'text', 'link'];
    return validTypes.includes(buttonType) ? buttonType : 'default';
  }

  // Style getters
  getPreviewContainerStyles(): any {
    return {
      'background-color': '#f5f5f5',
      'padding': '24px',
      'min-height': '400px'
    };
  }

  getFormStyles(): any {
    const formStyle = this.formProperties.formStyle;
    if (!formStyle) return {};

    return {
      'background-color': formStyle.backgroundColor || '#ffffff',
      'border-color': formStyle.borderColor || '#cccccc',
      'border-width': formStyle.borderWidth ? `${formStyle.borderWidth}px` : '1px',
      'border-style': formStyle.borderStyle || 'solid',
      'border-radius': formStyle.borderRadius ? `${formStyle.borderRadius}px` : '8px',
      'padding': this.formatDimension(formStyle.padding, '24px'),
      'margin': formStyle.margin || '0 auto',
      'width': this.formatDimension(formStyle.width, '100%'),
      'max-width': this.formatDimension(formStyle.maxWidth, '800px'),
      'min-width': this.formatDimension(formStyle.minWidth, 'auto'),
      'box-shadow': formStyle.boxShadow || '0 2px 8px rgba(0, 0, 0, 0.1)',
      'font-family': formStyle.fontFamily || 'inherit',
      'font-size': formStyle.fontSize ? `${formStyle.fontSize}px` : '14px',
      'font-weight': this.formatFontWeight(formStyle.fontWeight),
      'color': formStyle.color || '#000000',
      'text-align': formStyle.textAlign || 'left',
      'line-height': formStyle.lineHeight ? `${formStyle.lineHeight}` : 'normal'
    };
  }

  getTitleStyles(): any {
    const titleConfig = this.formProperties.titleConfig;
    if (!titleConfig) return {};

    return {
      'display': titleConfig.visible !== false ? 'block' : 'none',
      'text-align': titleConfig.alignment || 'center',
      'font-size': titleConfig.fontSize ? `${titleConfig.fontSize}px` : '24px',
      'font-weight': this.formatFontWeight(titleConfig.fontWeight) || 'bold',
      'color': titleConfig.color || '#000000',
      'margin': titleConfig.margin || '0 0 16px 0',
      'padding': titleConfig.padding || '0',
      'font-family': (titleConfig as any).fontFamily || 'inherit',
      'line-height': (titleConfig as any).lineHeight ? `${(titleConfig as any).lineHeight}` : 'normal'
    };
  }

  getDescriptionStyles(element?: EditorElement): any {
    if (element) {
      // Element description
      return {
        'font-size': '12px',
        'color': '#666',
        'margin-top': '4px',
        'line-height': '1.4'
      };
    } else {
      // Form description
      const formStyle = this.formProperties.formStyle;
      return {
        'font-size': formStyle?.fontSize ? `${parseInt(String(formStyle.fontSize)) - 2}px` : '14px',
        'color': '#666',
        'margin': '0 0 24px 0',
        'text-align': formStyle?.textAlign || 'center',
        'line-height': '1.5'
      };
    }
  }

  getElementStyles(element: EditorElement): any {
    const layout = this.getProperty(element, 'layout') || {};
    const autoExpand = this.getProperty(element, 'autoExpand') !== false;

    return {
      'width': autoExpand ? '100%' : this.formatDimension(layout.width),
      'min-width': this.formatDimension(layout.minWidth),
      'max-width': this.formatDimension(layout.maxWidth),
      'height': this.formatDimension(layout.height),
      'min-height': this.formatDimension(layout.minHeight),
      'max-height': this.formatDimension(layout.maxHeight),
      'flex': autoExpand ? '1 1 auto' : '0 0 auto'
    };
  }

  getLabelStyles(element: EditorElement): any {
    const elementStyle = this.getProperty(element, 'style') || {};
    
    return {
      'color': elementStyle.color || '#262626',
      'font-size': elementStyle.fontSize ? `${elementStyle.fontSize}px` : '14px',
      'font-weight': this.formatFontWeight(elementStyle.fontWeight) || '500',
      'font-family': elementStyle.fontFamily || 'inherit',
      'margin-bottom': '8px',
      'display': 'block'
    };
  }

  getInputStyles(element: EditorElement): any {
    const elementStyle = this.getProperty(element, 'style') || {};

    return {
      'color': elementStyle.color || 'rgba(0, 0, 0, 0.85)',
      'font-size': elementStyle.fontSize ? `${elementStyle.fontSize}px` : '14px',
      'font-weight': this.formatFontWeight(elementStyle.fontWeight),
      'font-family': elementStyle.fontFamily || 'inherit',
      'background-color': elementStyle.backgroundColor || '#fff',
      'border-color': elementStyle.borderColor || '#d9d9d9',
      'border-width': elementStyle.borderWidth ? `${elementStyle.borderWidth}px` : '1px',
      'border-style': elementStyle.borderStyle || 'solid',
      'border-radius': elementStyle.borderRadius ? `${elementStyle.borderRadius}px` : '6px',
      'padding': this.formatDimension(elementStyle.padding, '4px 11px'),
      'width': '100%',
      'box-sizing': 'border-box'
    };
  }

  getTextareaStyles(element: EditorElement): any {
    const baseStyles = this.getInputStyles(element);
    const rows = this.getProperty(element, 'rows') || 3;
    
    // Calculate proper height based on rows
    const fontSize = parseInt(baseStyles['font-size']) || 14;
    const lineHeight = 1.5715; // Default Ant Design line height
    const paddingVertical = 8; // Vertical padding (4px top + 4px bottom)
    const borderWidth = 2; // Border width (1px top + 1px bottom)
    
    const calculatedHeight = Math.max(rows * fontSize * lineHeight + paddingVertical + borderWidth, 60);
    
    return {
      ...baseStyles,
      'height': `${calculatedHeight}px`,
      'min-height': `${calculatedHeight}px`,
      'resize': this.getProperty(element, 'autoSize') ? 'none' : 'vertical',
      'line-height': lineHeight.toString()
    };
  }

  getSelectStyles(element: EditorElement): any {
    return this.getInputStyles(element);
  }

  getButtonStyles(element: EditorElement): any {
    const elementStyle = this.getProperty(element, 'style') || {};
    
    return {
      'color': elementStyle.color,
      'font-size': elementStyle.fontSize ? `${elementStyle.fontSize}px` : '14px',
      'font-weight': this.formatFontWeight(elementStyle.fontWeight),
      'font-family': elementStyle.fontFamily || 'inherit',
      'background-color': elementStyle.backgroundColor,
      'border-color': elementStyle.borderColor,
      'border-width': elementStyle.borderWidth ? `${elementStyle.borderWidth}px` : '1px',
      'border-style': elementStyle.borderStyle || 'solid',
      'border-radius': elementStyle.borderRadius ? `${elementStyle.borderRadius}px` : '6px',
      'padding': this.formatDimension(elementStyle.padding, '4px 15px'),
      'margin': elementStyle.margin || '0'
    };
  }

  getActionsStyles(): any {
    return {
      'justify-content': 'flex-end',
      'margin-top': '24px',
      'padding-top': '16px',
      'border-top': '1px solid #f0f0f0'
    };
  }

  getSubmitButtonStyles(): any {
    const submitStyle = this.formProperties.submitButton;
    if (!submitStyle) return {};

    return {
      'background-color': (submitStyle as any).backgroundColor,
      'border-color': (submitStyle as any).borderColor,
      'color': (submitStyle as any).color,
      'font-size': (submitStyle as any).fontSize ? `${(submitStyle as any).fontSize}px` : '14px',
      'font-weight': this.formatFontWeight((submitStyle as any).fontWeight),
      'border-radius': (submitStyle as any).borderRadius ? `${(submitStyle as any).borderRadius}px` : '6px',
      'padding': this.formatDimension((submitStyle as any).padding, '4px 15px')
    };
  }

  getResetButtonStyles(): any {
    const resetStyle = this.formProperties.resetButton;
    if (!resetStyle) return {};

    return {
      'background-color': (resetStyle as any).backgroundColor,
      'border-color': (resetStyle as any).borderColor,
      'color': (resetStyle as any).color,
      'font-size': (resetStyle as any).fontSize ? `${(resetStyle as any).fontSize}px` : '14px',
      'font-weight': this.formatFontWeight((resetStyle as any).fontWeight),
      'border-radius': (resetStyle as any).borderRadius ? `${(resetStyle as any).borderRadius}px` : '6px',
      'padding': this.formatDimension((resetStyle as any).padding, '4px 15px')
    };
  }

  getSubmitButtonText(): string {
    return (this.formProperties.submitButton as any)?.text || 'Submit Form';
  }

  getResetButtonText(): string {
    return (this.formProperties.resetButton as any)?.text || 'Reset';
  }

  // Helper methods
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

  onSubmit(): void {
    if (this.previewForm.valid) {
      this.message.success('Form submitted successfully!');
      console.log('Form values:', this.previewForm.value);
      
      // Custom submit handler would be called here if available
    } else {
      this.message.error('Please fill all required fields correctly');
      this.markAllFieldsAsTouched();
    }
  }

  resetForm(): void {
    this.previewForm.reset();
    this.message.info('Form reset');
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.previewForm.controls).forEach(key => {
      const control = this.previewForm.get(key);
      if (control?.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  getProperty(element: EditorElement, property: string): any {
    return (element as any)[property];
  }

  getPlaceholder(element: EditorElement, defaultValue: string): string {
    return (element as any)['placeholder'] || defaultValue;
  }

  onButtonClick(element: EditorElement): void {
    const buttonProps = element as any;
    
    if (buttonProps['htmlButtonType'] === 'submit' && this.hasFormElements) {
      this.onSubmit();
    } else if (buttonProps['htmlButtonType'] === 'reset') {
      this.resetForm();
    } else {
      this.message.info(`Button "${buttonProps['text'] || element.label}" clicked`);
      
      // Handle link buttons
      if (buttonProps['href']) {
        if (buttonProps['target'] === '_blank') {
          window.open(buttonProps['href'], '_blank');
        } else {
          window.location.href = buttonProps['href'];
        }
      }
    }
  }
}