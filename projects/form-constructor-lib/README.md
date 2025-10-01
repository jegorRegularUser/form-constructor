# Form Constructor Library

A dynamic form constructor library for Angular applications that allows developers and users to build forms through a drag-and-drop interface.

## Features

- **Drag-and-Drop Interface**: Intuitive form building with drag-and-drop functionality
- **Dynamic Form Elements**: Support for various form elements (input, textarea, select, button, etc.)
- **Property Panel**: Comprehensive property editing for form elements and the form itself
- **Real-time Preview**: Live preview of the form as it's being built
- **Form Validation**: Built-in validation with customizable rules
- **Responsive Design**: Forms that work on all device sizes
- **Theme Support**: Customizable themes to match your application
- **Event System**: Comprehensive event system for handling form interactions
- **Modular Architecture**: Well-structured, modular codebase for easy extension

## Installation

Install the library using npm:

```bash
npm install form-constructor-lib
```

## Getting Started

### 1. Import the Module

Import the `FormConstructorModule` into your Angular application:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormConstructorModule } from 'form-constructor-lib';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormConstructorModule.forRoot({
      // Configuration options
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Use the Form Builder Component

Add the form builder to your component template:

```html
<lib-form-builder [config]="formConfig"></lib-form-builder>
```

### 3. Configure the Form Builder

Configure the form builder in your component:

```typescript
import { Component } from '@angular/core';
import { FormConstructorConfig } from 'form-constructor-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  formConfig: FormConstructorConfig = {
    theme: {
      primaryColor: '#1890ff',
      secondaryColor: '#52c41a',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#d9d9d9',
      borderRadius: 4,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14
    },
    behavior: {
      enableDragAndDrop: true,
      enableInlineLabelEditing: true,
      enableValidation: true,
      showValidationErrors: true,
      autoSave: true,
      autoSaveInterval: 30000,
      confirmBeforeRemove: true,
      enableKeyboardShortcuts: true,
      enableUndoRedo: true,
      maxUndoRedoSteps: 50
    },
    // More configuration options...
  };
}
```

## Configuration

The Form Constructor Library provides extensive configuration options through the `FormConstructorConfig` interface:

### Theme Configuration

```typescript
theme: {
  primaryColor?: string;      // Primary color for the form constructor
  secondaryColor?: string;    // Secondary color for the form constructor
  backgroundColor?: string;   // Background color for the form constructor
  textColor?: string;         // Text color for the form constructor
  borderColor?: string;       // Border color for the form constructor
  borderRadius?: string | number; // Border radius for form elements
  fontFamily?: string;        // Font family for the form constructor
  fontSize?: string | number; // Font size for the form constructor
}
```

### Behavior Configuration

```typescript
behavior: {
  enableDragAndDrop?: boolean;           // Whether to enable drag and drop functionality
  enableInlineLabelEditing?: boolean;     // Whether to enable inline editing of element labels
  enableValidation?: boolean;             // Whether to enable form validation
  showValidationErrors?: boolean;         // Whether to show validation errors
  autoSave?: boolean;                     // Whether to auto-save form state
  autoSaveInterval?: number;              // Auto-save interval in milliseconds
  confirmBeforeRemove?: boolean;          // Whether to confirm before removing elements
  enableKeyboardShortcuts?: boolean;      // Whether to enable keyboard shortcuts
  enableUndoRedo?: boolean;               // Whether to enable undo/redo functionality
  maxUndoRedoSteps?: number;              // Maximum number of undo/redo steps to keep in history
}
```

### Form Configuration

```typescript
form: {
  defaultLayout?: 'vertical' | 'horizontal' | 'inline'; // Default form layout
  defaultSize?: 'small' | 'default' | 'large';         // Default form size
  defaultLabelAlign?: 'left' | 'right';                 // Default label alignment
  defaultLabelWidth?: number | string;                   // Default label width
  showTitle?: boolean;                                  // Whether to show form title
  showDescription?: boolean;                             // Whether to show form description
  showBorders?: boolean;                                 // Whether to show form borders
  enableResponsiveness?: boolean;                       // Whether to enable form responsiveness
}
```

### Callback Functions

```typescript
callbacks: {
  onFormSubmit?: (data: any) => void | Promise<void>;           // Called when the form is submitted
  onValidationChange?: (isValid: boolean, errors: any[]) => void; // Called when the form validation state changes
  onElementAdd?: (element: any) => void;                       // Called when an element is added
  onElementRemove?: (elementId: string) => void;               // Called when an element is removed
  onElementUpdate?: (elementId: string, properties: any) => void; // Called when an element is updated
  onElementSelect?: (element: any) => void;                    // Called when an element is selected
  onStateChange?: (state: any) => void;                        // Called when the form state changes
  onError?: (error: Error) => void;                            // Called when an error occurs
}
```

## API Reference

### FormConstructorModule

The main module that provides all form constructor functionality.

#### Methods

- `forRoot(config?: FormConstructorConfig)`: Configures the module with the provided options.

### FormBuilderComponent

The main component that provides the form builder interface.

#### Inputs

- `config: FormConstructorConfig`: Configuration for the form builder.
- `sidebarCollapsed: boolean`: Whether the sidebar is collapsed.
- `propertyPanelCollapsed: boolean`: Whether the property panel is collapsed.

#### Outputs

- `elementEvent: EventEmitter<ElementEvent>`: Emits events related to form elements.
- `formEvent: EventEmitter<FormEvent>`: Emits events related to the form.

#### Methods

- `submitForm(): Promise<void>`: Submits the form.
- `resetForm(): void`: Resets the form to its initial state.
- `validateForm(): void`: Validates the form and displays any errors.

### FormService

Provides methods for managing form data and state.

#### Methods

- `submitForm(options?: SubmitFormOptions): Promise<SubmitFormResult>`: Submits the form.
- `resetForm(options?: ResetFormOptions): void`: Resets the form.
- `validateForm(): ValidationResult`: Validates the form.
- `getFormData(): any`: Gets the current form data.

### ElementSelectionService

Manages the selection of form elements.

#### Methods

- `selectElement(element: FormElementProperties | null): void`: Selects an element.
- `getSelectedElement(): FormElementProperties | null`: Gets the currently selected element.
- `isElementSelected(elementId: string): boolean`: Checks if an element is selected.
- `deselectElement(): void`: Deselects the current element.

### PropertyPanelService

Manages the properties of form elements and the form itself.

#### Methods

- `updateElementProperty(elementId: string, property: string, value: any): void`: Updates an element property.
- `updateFormProperty(property: string, value: any): void`: Updates a form property.
- `getElementProperties(elementId: string): FormElementProperties | null`: Gets the properties of an element.
- `getFormProperties(): FormProperties`: Gets the form properties.

## Events

The library provides a comprehensive event system for handling form interactions:

### Element Events

- `element:create`: Emitted when an element is created.
- `element:delete`: Emitted when an element is deleted.
- `element:update`: Emitted when an element is updated.
- `element:select`: Emitted when an element is selected.
- `element:duplicate`: Emitted when an element is duplicated.
- `element:drag`: Emitted when an element is dragged.

### Form Events

- `form:submit`: Emitted when the form is submitted.
- `form:reset`: Emitted when the form is reset.
- `form:validate`: Emitted when the form is validated.
- `form:stateChange`: Emitted when the form state changes.
- `form:error`: Emitted when an error occurs.

## Examples

### Basic Form Builder

```typescript
import { Component } from '@angular/core';
import { FormConstructorConfig, FormEvent, ElementEvent } from 'form-constructor-lib';

@Component({
  selector: 'app-basic-form',
  template: `
    <lib-form-builder 
      [config]="config"
      (formEvent)="onFormEvent($event)"
      (elementEvent)="onElementEvent($event)">
    </lib-form-builder>
  `
})
export class BasicFormComponent {
  config: FormConstructorConfig = {
    theme: {
      primaryColor: '#1890ff'
    },
    behavior: {
      enableDragAndDrop: true,
      enableValidation: true
    }
  };

  onFormEvent(event: FormEvent) {
    console.log('Form event:', event);
  }

  onElementEvent(event: ElementEvent) {
    console.log('Element event:', event);
  }
}
```

### Form with Custom Callbacks

```typescript
import { Component } from '@angular/core';
import { FormConstructorConfig } from 'form-constructor-lib';

@Component({
  selector: 'app-callback-form',
  template: `
    <lib-form-builder [config]="config"></lib-form-builder>
  `
})
export class CallbackFormComponent {
  config: FormConstructorConfig = {
    callbacks: {
      onFormSubmit: (data) => {
        console.log('Form submitted with data:', data);
        // Send data to server
      },
      onElementAdd: (element) => {
        console.log('Element added:', element);
      },
      onElementRemove: (elementId) => {
        console.log('Element removed:', elementId);
      },
      onValidationChange: (isValid, errors) => {
        if (!isValid) {
          console.log('Validation errors:', errors);
        }
      }
    }
  };
}
```

### Form with Custom Theme

```typescript
import { Component } from '@angular/core';
import { FormConstructorConfig } from 'form-constructor-lib';

@Component({
  selector: 'app-themed-form',
  template: `
    <lib-form-builder [config]="config"></lib-form-builder>
  `
})
export class ThemedFormComponent {
  config: FormConstructorConfig = {
    theme: {
      primaryColor: '#722ed1',
      secondaryColor: '#13c2c2',
      backgroundColor: '#f0f2f5',
      textColor: '#262626',
      borderColor: '#d9d9d9',
      borderRadius: 8,
      fontFamily: 'Roboto, sans-serif',
      fontSize: 16
    }
  };
}
```

## Contributing

Contributions are welcome! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.