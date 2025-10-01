import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormConstructorModule } from '../../../projects/form-constructor-lib/src/public_api';
import { FormConstructorConfig } from '../../../projects/form-constructor-lib/src/lib/api/form-constructor-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormConstructorModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Form Constructor Demo';
  currentYear = new Date().getFullYear();
  
  // Form configuration
  formConfig: FormConstructorConfig = {
    defaultFormProperties: {
      id: 'demo-form',
      title: 'Demo Form',
      description: 'This is a demo form created with the Form Constructor library',
      layout: 'vertical',
      labelAlign: 'left',
      size: 'default',
      validation: {
        validateOnSubmit: true,
        validateOnBlur: true,
        showErrorMessages: true
      },
      submitButton: {
        text: 'Submit',
        type: 'primary',
        size: 'default',
        visible: true,
        disabled: false
      },
      resetButton: {
        text: 'Reset',
        type: 'default',
        size: 'default',
        visible: true,
        disabled: false
      }
    }
  };

  // Handle form submission
  onFormSubmit(formData: any) {
    console.log('Form submitted:', formData);
    alert('Form submitted successfully! Check the console for details.');
  }

  // Handle form changes
  onFormChange(formData: any) {
    console.log('Form changed:', formData);
  }
}