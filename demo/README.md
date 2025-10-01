# Form Constructor Demo

This is a demo application showcasing the Form Constructor library, a dynamic form builder for Angular applications.

## Overview

The demo application demonstrates how to integrate and use the Form Constructor library in an Angular project. It provides a visual interface for building forms through drag-and-drop functionality, with real-time preview and customization options.

## Features Demonstrated

- **Form Builder Interface**: Interactive drag-and-drop form building
- **Element Customization**: Modify properties of form elements in real-time
- **Form Configuration**: Customize form layout, validation, and behavior
- **Theme Support**: Apply different themes to the form constructor
- **Event Handling**: Handle form events and element interactions
- **Form Submission**: Submit forms and process the data

## Getting Started

### Prerequisites

Before running the demo, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (v8 or higher)
- Angular CLI (v19 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/coreesoft/form-constructor.git
cd form-constructor
```

2. Install dependencies:

```bash
npm install
```

3. Build the library:

```bash
npm run build:lib
```

### Running the Demo

To run the demo application:

```bash
npm run start:demo
```

This will start the development server and open the demo application in your default browser at `http://localhost:4200/`.

## Project Structure

```
demo/
├── src/
│   ├── app/
│   │   ├── app.component.ts         # Main app component
│   │   ├── app.component.html       # Main app template
│   │   ├── app.component.css        # Main app styles
│   │   ├── app.config.ts            # App configuration
│   │   └── app.routes.ts            # App routing
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # App entry point
│   └── styles.css                   # Global styles
├── package.json                     # Demo dependencies
└── tsconfig.json                    # TypeScript configuration
```

## Configuration

The demo application is configured to showcase the Form Constructor library with a basic setup:

### App Configuration

The main app configuration in [`app.config.ts`](src/app/app.config.ts) imports and configures the FormConstructorModule:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { FormConstructorModule } from '../../../projects/form-constructor-lib/src/public_api';
import { importProvidersFrom } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(FormConstructorModule.forRoot())
  ]
};
```

### Form Configuration

The form configuration in [`app.component.ts`](src/app/app.component.ts) demonstrates how to set up the Form Constructor with basic options:

```typescript
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
```

## Usage Examples

### Basic Form Builder

The demo includes a basic form builder implementation in [`app.component.html`](src/app/app.component.html):

```html
<div class="container">
  <header class="header">
    <h1>{{ title }}</h1>
    <p>This is a demo of the Form Constructor library.</p>
  </header>

  <main class="main-content">
    <div class="form-container">
      <!-- Form Constructor will be rendered here -->
    </div>

    <div class="info-panel">
      <h2>Configuration</h2>
      <p>Current form configuration:</p>
      <div class="form-data-display">
        <pre>{{ formConfig | json }}</pre>
      </div>
    </div>
  </main>

  <footer class="footer">
    <p>Form Constructor Library Demo &copy; {{ currentYear }}</p>
  </footer>
</div>
```

### Handling Form Events

The demo shows how to handle form events in [`app.component.ts`](src/app/app.component.ts):

```typescript
// Handle form submission
onFormSubmit(formData: any) {
  console.log('Form submitted:', formData);
  alert('Form submitted successfully! Check the console for details.');
}

// Handle form changes
onFormChange(formData: any) {
  console.log('Form changed:', formData);
}
```

## Customization

The demo application can be customized in several ways:

### Changing the Form Configuration

Modify the `formConfig` object in [`app.component.ts`](src/app/app.component.ts) to change the form's behavior and appearance:

```typescript
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
```

### Adding Custom Elements

To add custom form elements to the demo:

1. Define the custom element type in the library
2. Register it with the ElementRegistryService
3. Update the form configuration to include the custom element

### Styling the Demo

The demo application uses CSS styles defined in [`app.component.css`](src/app/app.component.css). You can modify these styles to change the appearance of the demo:

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.form-container {
  flex: 2;
}

.info-panel {
  flex: 1;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
```

## Development

### Building the Demo

To build the demo application for production:

```bash
npm run build:demo
```

This will create a `dist/demo` directory with the built application.

### Running Tests

To run the tests for the demo application:

```bash
npm run test:demo
```

## Troubleshooting

### Common Issues

1. **Library Not Found**: If you get an error that the Form Constructor library cannot be found, make sure you have built the library first:

```bash
npm run build:lib
```

2. **Port Already in Use**: If port 4200 is already in use, you can specify a different port:

```bash
npm run start:demo -- --port 4201
```

3. **Styles Not Loading**: If the styles are not loading correctly, try restarting the development server.

### Getting Help

If you encounter any issues with the demo application:

1. Check the [library documentation](../projects/form-constructor-lib/README.md)
2. Search existing [issues](https://github.com/coreesoft/form-constructor/issues)
3. Create a new [issue](https://github.com/coreesoft/form-constructor/issues/new) with details about your problem

## Contributing

Contributions to the demo application are welcome! Please see the [contributing guidelines](../CONTRIBUTING.md) for details.

## License

This demo application is part of the Form Constructor library project and is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.