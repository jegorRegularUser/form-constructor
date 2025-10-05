import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormElementProperties } from '../models/element-properties.model';
import { FormProperties } from '../models/form-properties.model';
import { ElementStateService } from './element-state.service';

export interface FormSubmissionData {
  [key: string]: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
  warnings?: FormValidationWarning[];
}

export interface FormValidationError {
  elementId: string;
  propertyName: string;
  message: string;
  value?: any;
}

export interface FormValidationWarning {
  elementId: string;
  propertyName: string;
  message: string;
  value?: any;
}

export interface FormSubmitOptions {
  validateBeforeSubmit?: boolean;
  showValidationErrors?: boolean;
  resetOnSuccess?: boolean;
  customValidationFunction?: (data: FormSubmissionData) => FormValidationResult | Promise<FormValidationResult>;
}

export interface FormResetOptions {
  keepDefaultValues?: boolean;
  clearValidationErrors?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private formValidationResultSubject = new BehaviorSubject<FormValidationResult>({
    isValid: true,
    errors: []
  });
  
  private formSubmissionSubject = new BehaviorSubject<FormSubmissionData>({});
  private formSubmittingSubject = new BehaviorSubject<boolean>(false);
  private formSubmittedSubject = new BehaviorSubject<boolean>(false);
  
  formValidationResult$ = this.formValidationResultSubject.asObservable();
  formSubmission$ = this.formSubmissionSubject.asObservable();
  formSubmitting$ = this.formSubmittingSubject.asObservable();
  formSubmitted$ = this.formSubmittedSubject.asObservable();

  constructor(
    private elementStateService: ElementStateService
  ) {
    // Subscribe to element state changes to revalidate form when elements change
    this.elementStateService.getState$().subscribe(() => {
      this.validateForm();
    });
  }

  /**
   * Get the current form properties
   */
  getFormProperties(): FormProperties {
    // Return default form properties
    return {
      id: 'default-form',
      title: 'Form',
      description: '',
      titleConfig: {
        visible: true,
        text: 'Form Title',
        position: 'top',
        alignment: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        padding: '8px 16px',
        margin: '0 0 16px 0'
      },
      formStyle: {
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 4,
        padding: '16px',
        margin: '0 auto',
        width: '100%',
        height: 'auto'
      }
    };
  }

  /**
   * Get all form elements
   */
  getFormElements(): FormElementProperties[] {
    const state = this.elementStateService.getCurrentState();
    const elements: FormElementProperties[] = [];
    
    // Flatten the 2D array of elements
    state.elements.forEach(row => {
      row.forEach(element => {
        const elementProperties = state.elementProperties[element.id];
        if (elementProperties) {
          elements.push(elementProperties as FormElementProperties);
        }
      });
    });
    
    return elements;
  }

  /**
   * Get form data for submission
   */
  getFormData(): FormSubmissionData {
    const elements = this.getFormElements();
    const formData: FormSubmissionData = {};
    
    elements.forEach(element => {
      if (element.name) {
        // Use the element's name as the key in the form data
        // For elements with values (input, textarea, select, etc.)
        if ('value' in element) {
          formData[element.name] = (element as any).value;
        } 
        // For checkbox elements
        else if (element.type === 'checkbox' && 'checked' in element) {
          formData[element.name] = (element as any).checked;
        }
        // For radio group elements
        else if (element.type === 'radio-group' && 'value' in element) {
          formData[element.name] = (element as any).value;
        }
        // For other elements, use the entire element properties
        else {
          formData[element.name] = element;
        }
      }
    });
    
    return formData;
  }

  /**
   * Validate the entire form
   */
  validateForm(): FormValidationResult {
    const elements = this.getFormElements();
    const errors: FormValidationError[] = [];
    const warnings: FormValidationWarning[] = [];
    
    elements.forEach(element => {
      // Validate required fields
      if (element.required) {
        const isEmpty = this.isElementValueEmpty(element);
        if (isEmpty) {
          errors.push({
            elementId: element.id,
            propertyName: 'value',
            message: `${element.label || element.name || 'This field'} is required`,
            value: this.getElementValue(element)
          });
        }
      }
      
      // Validate based on element type
      const elementValidation = this.validateElement(element);
      errors.push(...elementValidation.errors);
      if (elementValidation.warnings) {
        warnings.push(...elementValidation.warnings);
      }
    });
    
    const validationResult: FormValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
    this.formValidationResultSubject.next(validationResult);
    return validationResult;
  }

  /**
   * Validate a single form element
   */
  validateElement(element: FormElementProperties): FormValidationResult {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationWarning[] = [];
    
    // Skip validation for disabled or read-only elements
    if (element.disabled || element.readOnly) {
      return { isValid: true, errors: [] };
    }
    
    // Type-specific validation
    switch (element.type) {
      case 'input':
        this.validateInputElement(element as any, errors, warnings);
        break;
      case 'textarea':
        this.validateTextareaElement(element as any, errors, warnings);
        break;
      case 'select':
        this.validateSelectElement(element as any, errors, warnings);
        break;
    }
    
    // Input type-specific validation
    if (element.type === 'input') {
      const inputElement = element as any;
      if (inputElement.inputType === 'email') {
        this.validateEmailElement(inputElement, errors, warnings);
      } else if (inputElement.inputType === 'number') {
        this.validateNumberElement(inputElement, errors, warnings);
      }
    }
    
    // Custom validation rules
    if (element.validation) {
      this.validateWithCustomRules(element, element.validation, errors, warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Submit the form
   */
  async submitForm(options: FormSubmitOptions = {}): Promise<FormValidationResult> {
    const {
      validateBeforeSubmit = true,
      showValidationErrors = true,
      resetOnSuccess = false,
      customValidationFunction
    } = options;
    
    this.formSubmittingSubject.next(true);
    
    try {
      let validationResult: FormValidationResult;
      
      // Validate the form if required
      if (validateBeforeSubmit) {
        validationResult = this.validateForm();
        
        // If custom validation function is provided, use it
        if (customValidationFunction) {
          const formData = this.getFormData();
          const customResult = await customValidationFunction(formData);
          
          // Merge custom validation results
          if (!customResult.isValid) {
            validationResult.isValid = false;
            validationResult.errors = [...validationResult.errors, ...customResult.errors];
            
            if (customResult.warnings) {
              validationResult.warnings = [
                ...(validationResult.warnings || []),
                ...customResult.warnings
              ];
            }
          }
        }
        
        // If validation fails and we should show errors, throw an error
        if (!validationResult.isValid && showValidationErrors) {
          this.formValidationResultSubject.next(validationResult);
          this.formSubmittingSubject.next(false);
          throw new Error('Form validation failed');
        }
      } else {
        validationResult = { isValid: true, errors: [] };
      }
      
      // Get form data
      const formData = this.getFormData();
      
      // Emit form submission data
      this.formSubmissionSubject.next(formData);
      
      // Mark form as submitted
      this.formSubmittedSubject.next(true);
      
      // Reset form if required
      if (resetOnSuccess) {
        this.resetForm();
      }
      
      return validationResult;
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      this.formSubmittingSubject.next(false);
    }
  }

  /**
   * Reset the form
   */
  resetForm(options: FormResetOptions = {}): void {
    const {
      keepDefaultValues = true,
      clearValidationErrors = true
    } = options;
    
    const elements = this.getFormElements();
    
    elements.forEach(element => {
      // Reset element value based on type
      switch (element.type) {
        case 'input':
        case 'textarea':
          // Reset to default value or empty string
          const defaultValue = (element as any).defaultValue || '';
          this.updateElementValue(element.id, defaultValue);
          break;
        case 'select':
          // Reset to default value or first option
          const selectElement = element as any;
          const defaultSelectValue = selectElement.defaultValue || 
            (selectElement.options && selectElement.options.length > 0 ? selectElement.options[0].value : '');
          this.updateElementValue(element.id, defaultSelectValue);
          break;
        case 'checkbox':
          // Reset to default checked state or false
          const defaultChecked = (element as any).defaultChecked || false;
          this.updateElementValue(element.id, defaultChecked);
          break;
        case 'radio-group':
          // Reset to default value or first option
          const radioElement = element as any;
          const defaultRadioValue = radioElement.defaultValue || 
            (radioElement.options && radioElement.options.length > 0 ? radioElement.options[0].value : '');
          this.updateElementValue(element.id, defaultRadioValue);
          break;
      }
    });
    
    // Clear validation errors if required
    if (clearValidationErrors) {
      this.formValidationResultSubject.next({
        isValid: true,
        errors: []
      });
    }
    
    // Mark form as not submitted
    this.formSubmittedSubject.next(false);
  }

  /**
   * Update an element's value
   */
  updateElementValue(elementId: string, value: any): void {
    // Update the element's value in the element state service
    this.elementStateService.updateElementProperties(elementId, { value });
    
    // Revalidate the form after updating the value
    this.validateForm();
  }

  /**
   * Get the current validation result
   */
  getValidationResult(): FormValidationResult {
    return this.formValidationResultSubject.value;
  }

  /**
   * Check if the form is currently submitting
   */
  isSubmitting(): boolean {
    return this.formSubmittingSubject.value;
  }

  /**
   * Check if the form has been submitted
   */
  isSubmitted(): boolean {
    return this.formSubmittedSubject.value;
  }

  /**
   * Check if an element's value is empty
   */
  private isElementValueEmpty(element: FormElementProperties): boolean {
    const value = this.getElementValue(element);
    
    if (value === null || value === undefined) {
      return true;
    }
    
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    
    return false;
  }

  /**
   * Get an element's value
   */
  private getElementValue(element: FormElementProperties): any {
    if ('value' in element) {
      return (element as any).value;
    }
    
    if (element.type === 'checkbox' && 'checked' in element) {
      return (element as any).checked;
    }
    
    return null;
  }

  /**
   * Validate input element
   */
  private validateInputElement(element: any, errors: FormValidationError[], warnings: FormValidationWarning[]): void {
    // Email validation
    if (element.inputType === 'email' && element.value) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(element.value)) {
        errors.push({
          elementId: element.id,
          propertyName: 'value',
          message: 'Please enter a valid email address',
          value: element.value
        });
      }
    }
    
    // Min/Max length validation
    if (element.minLength !== undefined && element.value && element.value.length < element.minLength) {
      errors.push({
        elementId: element.id,
        propertyName: 'value',
        message: `Minimum length is ${element.minLength} characters`,
        value: element.value
      });
    }
    
    if (element.maxLength !== undefined && element.value && element.value.length > element.maxLength) {
      errors.push({
        elementId: element.id,
        propertyName: 'value',
        message: `Maximum length is ${element.maxLength} characters`,
        value: element.value
      });
    }
    
    // Pattern validation
    if (element.pattern && element.value) {
      const regex = new RegExp(element.pattern);
      if (!regex.test(element.value)) {
        errors.push({
          elementId: element.id,
          propertyName: 'value',
          message: 'Please match the required format',
          value: element.value
        });
      }
    }
  }

  /**
   * Validate textarea element
   */
  private validateTextareaElement(element: any, errors: FormValidationError[], warnings: FormValidationWarning[]): void {
    // Min/Max length validation
    if (element.minLength !== undefined && element.value && element.value.length < element.minLength) {
      errors.push({
        elementId: element.id,
        propertyName: 'value',
        message: `Minimum length is ${element.minLength} characters`,
        value: element.value
      });
    }
    
    if (element.maxLength !== undefined && element.value && element.value.length > element.maxLength) {
      errors.push({
        elementId: element.id,
        propertyName: 'value',
        message: `Maximum length is ${element.maxLength} characters`,
        value: element.value
      });
    }
  }

  /**
   * Validate select element
   */
  private validateSelectElement(element: any, errors: FormValidationError[], warnings: FormValidationWarning[]): void {
    // For required select elements, ensure a value is selected
    if (element.required && (!element.value || element.value === '')) {
      errors.push({
        elementId: element.id,
        propertyName: 'value',
        message: `${element.label || element.name || 'This field'} is required`,
        value: element.value
      });
    }
  }

  /**
   * Validate email element
   */
  private validateEmailElement(element: any, errors: FormValidationError[], warnings: FormValidationWarning[]): void {
    if (element.value) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(element.value)) {
        errors.push({
          elementId: element.id,
          propertyName: 'value',
          message: 'Please enter a valid email address',
          value: element.value
        });
      }
    }
  }

  /**
   * Validate number element
   */
  private validateNumberElement(element: any, errors: FormValidationError[], warnings: FormValidationWarning[]): void {
    if (element.value !== null && element.value !== undefined && element.value !== '') {
      const numValue = Number(element.value);
      
      if (isNaN(numValue)) {
        errors.push({
          elementId: element.id,
          propertyName: 'value',
          message: 'Please enter a valid number',
          value: element.value
        });
      } else {
        if (element.min !== undefined && numValue < element.min) {
          errors.push({
            elementId: element.id,
            propertyName: 'value',
            message: `Value must be at least ${element.min}`,
            value: element.value
          });
        }
        
        if (element.max !== undefined && numValue > element.max) {
          errors.push({
            elementId: element.id,
            propertyName: 'value',
            message: `Value must be at most ${element.max}`,
            value: element.value
          });
        }
      }
    }
  }

  /**
   * Validate with custom rules
   */
  private validateWithCustomRules(
    element: FormElementProperties,
    validation: any,
    errors: FormValidationError[],
    warnings: FormValidationWarning[]
  ): void {
    // Custom validation functions
    if (validation.custom && Array.isArray(validation.custom)) {
      validation.custom.forEach((rule: any) => {
        try {
          // This is a simplified approach - in a real implementation,
          // you would need a more sophisticated way to execute custom validators
          const isValid = this.executeCustomValidator(rule.validator, element);
          
          if (!isValid) {
            errors.push({
              elementId: element.id,
              propertyName: rule.property || 'value',
              message: rule.message || 'Validation failed',
              value: this.getElementValue(element)
            });
          }
        } catch (error) {
          console.error(`Error executing custom validator for element ${element.id}:`, error);
          
          warnings.push({
            elementId: element.id,
            propertyName: rule.property || 'value',
            message: 'Custom validation could not be executed',
            value: this.getElementValue(element)
          });
        }
      });
    }
  }

  /**
   * Execute a custom validator function
   */
  private executeCustomValidator(validator: string, element: FormElementProperties): boolean {
    // This is a simplified approach - in a real implementation,
    // you would need a more sophisticated way to execute custom validators
    
    // For now, we'll just return true as a placeholder
    // In a real implementation, you would parse and execute the validator function
    return true;
  }
}