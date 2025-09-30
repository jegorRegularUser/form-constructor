# Form Constructor Architecture

## Overview

Form Constructor is a drag-and-drop form builder application built with Angular 19 and Ng-Zorro UI components. This document describes the overall architecture, design patterns, and implementation details.

## Project Structure

```
src/app/
├── core/                           # Core functionality and shared services
│   ├── configs/                   # Configuration files
│   │   ├── element-property-definitions.ts
│   │   └── property-configs.ts
│   ├── enums/                     # Enumerations
│   │   └── property-type.enum.ts
│   ├── factories/                 # Factory services
│   │   ├── element-factory.service.ts
│   │   └── property-editor.factory.ts
│   ├── models/                    # Data models and interfaces
│   │   ├── drag-data.model.ts
│   │   ├── element-properties.model.ts
│   │   ├── form-properties.model.ts
│   │   └── property-schema.model.ts
│   └── services/                  # Core services
│       ├── drag-state.service.ts
│       ├── element-registry.service.ts
│       ├── element-selection.service.ts
│       ├── element-state.service.ts
│       ├── form.service.ts
│       ├── icon-registry.service.ts
│       └── property-panel.service.ts
├── features/                      # Feature modules
│   └── form-builder/             # Main form builder feature
│       └── components/
│           ├── editor/           # Form editor component
│           ├── property-panel/   # Property configuration panel
│           └── sidebar/          # Element palette
├── layouts/                      # Application layouts
│   └── main-layout.component.ts
└── shared/                       # Shared components and utilities
    └── components/
        └── form-elements/        # Reusable form element components
            ├── base-form-block.component.ts
            ├── drag-handle.component.ts
            ├── input.component.ts
            ├── textarea.component.ts
            ├── button-element/
            └── select-element/
```

## Core Architecture Patterns

### 1. Service-Oriented Architecture
The application uses a service-oriented approach with specialized services for different concerns:

- **State Management**: ElementStateService manages form state
- **UI Interactions**: DragStateService handles drag-and-drop
- **Element Management**: ElementSelectionService manages selection
- **Configuration**: PropertyPanelService handles property management

### 2. Component Composition
Form elements are built using composition with a base component pattern:

```typescript
BaseFormBlockComponent
├── DragHandleComponent
├── Element-specific content (Input, Textarea, etc.)
└── Action buttons (delete, duplicate, settings)
```

### 3. Factory Pattern
Element creation uses the factory pattern for extensibility:

```typescript
ElementFactory.createElement(type: string): EditorElement
PropertyEditorFactory.createEditor(definition: PropertyDefinition): ComponentRef
```

### 4. Observer Pattern
Services use RxJS observables for reactive state management:

```typescript
ElementStateService.formState$: Observable<FormState>
ElementSelectionService.selectedElement$: Observable<FormElementProperties>
PropertyPanelService.elementProperties$: Observable<Record<string, FormElementProperties>>
```

## Data Flow Architecture

### State Management Flow
```
User Action → Service → State Update → Component Update → UI Render
```

1. **User Interaction**: User performs action (drag, click, edit)
2. **Service Processing**: Appropriate service processes the action
3. **State Update**: Service updates application state
4. **Component Reaction**: Components react to state changes via observables
5. **UI Update**: UI reflects the new state

### Drag & Drop Flow
```
Sidebar Element → Drag Start → Drop Position Calculation → Element Creation → State Update
```

1. **Drag Initiation**: User starts dragging from sidebar
2. **Position Tracking**: DragStateService tracks mouse position
3. **Drop Indicators**: Visual indicators show valid drop zones
4. **Element Creation**: ElementFactory creates new element
5. **State Persistence**: ElementStateService saves changes

### Property Management Flow
```
Element Selection → Property Loading → Editor Rendering → Value Changes → State Update
```

1. **Selection**: User selects form element
2. **Property Loading**: PropertyPanelService loads element properties
3. **Editor Creation**: Dynamic property editors are created
4. **Value Updates**: Property changes trigger state updates
5. **Synchronization**: Changes sync across all components

## Key Services

### ElementStateService
Central state management service that handles:
- Form structure (elements array)
- Element properties and positions
- Form-level configuration
- Persistence to localStorage
- State synchronization

```typescript
interface FormState {
  elements: EditorElement[][];
  elementProperties: Record<string, any>;
  elementPositions: Record<string, ElementPosition>;
  formProperties: any;
  lastSaved: Date | null;
}
```

### DragStateService
Manages drag-and-drop operations:
- Drag state tracking
- Drop position calculation
- Visual feedback coordination
- Element movement logic

### PropertyPanelService
Handles property configuration:
- Dynamic property definitions
- Property validation
- Real-time updates
- Form-level properties

### ElementSelectionService
Manages element selection state:
- Single element selection
- Selection state tracking
- Selection change notifications

## Component Architecture

### Editor Component
Main form editor that orchestrates:
- Element rendering and layout
- Drag-and-drop handling
- Drop indicator display
- Element interaction management

### Property Panel Component
Dynamic property configuration interface:
- Type-specific property editors
- Property grouping and organization
- Real-time property updates
- Form-level settings

### Form Element Components
Reusable form element components:
- Base functionality through BaseFormBlockComponent
- Element-specific rendering and behavior
- Property binding and updates
- Action button integration

## Data Models

### Core Models

#### EditorElement
```typescript
interface EditorElement {
  id: string;
  type: string;
  label?: string;
  [key: string]: any;
}
```

#### FormElementProperties
```typescript
interface FormElementProperties {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
  layout?: LayoutProperties;
  validation?: ValidationProperties;
  style?: StyleProperties;
}
```

#### FormProperties
```typescript
interface FormProperties {
  id: string;
  title?: string;
  description?: string;
  titleConfig?: TitleConfig;
  formStyle?: FormStyle;
  layout?: FormLayout;
}
```

## Persistence Strategy

### Local Storage
- Automatic state saving on every change
- Complete form state serialization
- State restoration on application load
- Export/import functionality

### State Structure
```typescript
{
  elements: EditorElement[][];           // 2D array for layout
  elementProperties: Record<string, any>; // Element configurations
  elementPositions: Record<string, ElementPosition>; // Position tracking
  formProperties: FormProperties;        // Form-level settings
  lastSaved: Date;                      // Timestamp
}
```

## Extensibility Points

### Adding New Element Types
1. Create element component extending BaseFormBlockComponent
2. Define element properties interface
3. Add to ElementFactory
4. Configure property definitions
5. Register in element registry

### Adding New Property Types
1. Define property type enum
2. Create property editor component
3. Register in PropertyEditorFactory
4. Add validation logic
5. Update property definitions

### Custom Styling
1. Define style properties in models
2. Create style property editors
3. Implement CSS generation
4. Add to property panel configuration

## Performance Considerations

### Optimization Strategies
- **Change Detection**: OnPush strategy for components
- **State Comparison**: Deep equality checks before updates
- **Lazy Loading**: Dynamic component creation for property editors
- **Debouncing**: Property update debouncing
- **Memory Management**: Proper subscription cleanup

### Scalability
- **Modular Architecture**: Feature-based organization
- **Service Separation**: Single responsibility principle
- **Component Reusability**: Shared component library
- **State Normalization**: Efficient state structure

## Testing Strategy

### Unit Testing
- Service logic testing
- Component behavior testing
- Model validation testing
- Utility function testing

### Integration Testing
- Service interaction testing
- Component integration testing
- State management testing
- Drag-and-drop testing

### E2E Testing
- User workflow testing
- Form building scenarios
- Property configuration testing
- Persistence testing

## Security Considerations

### Data Validation
- Input sanitization
- Property validation
- Type checking
- XSS prevention