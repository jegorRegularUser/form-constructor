# Form Constructor

A powerful drag-and-drop form builder library for Angular applications, built with Angular 19 and Ng-Zorro UI components.

## Overview

The Form Constructor project consists of two main parts:

1. **Form Constructor Library**: A reusable Angular library for building dynamic forms through a drag-and-drop interface.
2. **Demo Application**: A demonstration application showcasing the library's capabilities.

## Features

### ✅ Library Features
- **Drag & Drop Interface**: Intuitive form building with visual drop indicators
- **Form Elements**: Input, Textarea, Select, Button components
- **Element Management**: Add, remove, duplicate, and move elements
- **Inline Label Editing**: Click on labels to edit them directly
- **Element Actions**: Delete, duplicate, toggle required, and settings buttons
- **Property Panel**: Configure element properties with real-time updates
- **Form State Management**: Automatic save/restore with localStorage
- **Responsive Layout**: Collapsible sidebar and property panel
- **Visual Feedback**: Element selection, hover states, and drag indicators
- **Theme Support**: Customizable themes to match your application
- **Event System**: Comprehensive event system for handling form interactions
- **Form Validation**: Built-in validation with customizable rules
- **Modular Architecture**: Well-structured, modular codebase for easy extension

### 🔧 Element Types
- **Input**: Text inputs with customizable properties
- **Textarea**: Multi-line text areas with row configuration
- **Select**: Dropdown selections with options
- **Button**: Action buttons with different types

### 💾 Data Persistence
- Automatic state saving to localStorage
- Form structure and element positions
- Element properties and configurations
- Form-level settings
- Export/Import functionality

## Quick Start

### Prerequisites
- Node.js (v18+)
- Angular CLI (v19.2.17)

### Installation
```bash
npm install
```

### Building the Library
```bash
npm run build:lib
```

### Running the Demo
```bash
npm run start:demo
```
Navigate to `http://localhost:4200/`

### Running Tests
```bash
# Run library tests
npm run test:lib

# Run demo tests
npm run test:demo
```

## Project Structure

```
form-constructor/
├── projects/
│   └── form-constructor-lib/    # The library source code
│       ├── src/
│       │   ├── lib/             # Library implementation
│       │   │   ├── api/         # Public API interfaces
│       │   │   ├── components/  # Library components
│       │   │   ├── core/        # Core services and models
│       │   │   ├── models/      # Data models
│       │   │   └── modules/     # Library modules
│       │   └── public_api.ts    # Public API exports
│       └── package.json         # Library package configuration
├── demo/                        # Demo application
│   ├── src/
│   │   └── app/                # Demo app components
│   └── package.json             # Demo dependencies
├── src/                         # Original application (deprecated)
├── README.md                    # This file
├── CHANGELOG.md                 # Project changelog
└── package.json                 # Root package configuration
```

## Using the Library

### Installation

Install the library using npm:

```bash
npm install form-constructor-lib
```

### Basic Usage

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

Add the form builder to your component template:

```html
<lib-form-builder [config]="formConfig"></lib-form-builder>
```

For detailed documentation, see the [library documentation](projects/form-constructor-lib/README.md).

## Demo Application

The demo application showcases the library's capabilities and provides examples of how to use it. For more information, see the [demo documentation](demo/README.md).

## Development

### Building the Library

To build the library for distribution:

```bash
npm run build:lib
```

The built library will be available in the `dist/form-constructor-lib` directory.

### Running the Demo

To run the demo application:

```bash
npm run start:demo
```

This will start the development server and open the demo application in your default browser.

### Testing

To run the library tests:

```bash
npm run test:lib
```

To run the demo tests:

```bash
npm run test:demo
```

## Architecture

### Library Architecture

The library follows a modular architecture with clear separation of concerns:

- **API Layer**: Public interfaces and configuration options
- **Core Layer**: Services, models, and core functionality
- **Component Layer**: Reusable UI components
- **Module Layer**: Angular modules for organizing the library

### Core Services

- **ElementStateService**: Manages form state and persistence
- **DragStateService**: Handles drag-and-drop operations
- **ElementSelectionService**: Manages element selection
- **PropertyPanelService**: Handles property configurations
- **FormService**: Form validation and submission
- **ElementRegistryService**: Registry of available form elements
- **IconRegistryService**: Registry of icons used in the form builder

### Key Features Implementation

#### Drag & Drop System
- Visual drop indicators (horizontal/vertical)
- Smart positioning logic
- Element reordering and row management
- Empty form state handling

#### Element Management
- Unique ID generation
- Property synchronization
- State persistence
- Real-time updates

#### Property Panel
- Dynamic property editors
- Type-specific configurations
- Form-level settings
- Validation rules

## Configuration

The library provides extensive configuration options through the `FormConstructorConfig` interface:

```typescript
const config: FormConstructorConfig = {
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

For a complete list of configuration options, see the [library documentation](projects/form-constructor-lib/README.md).

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for details about changes in each version.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

