# Property Panel Architecture

## Overview

The Property Panel is a key component of the Form Constructor that allows users to configure properties of selected form elements and form-level settings. This document describes the current implementation and architecture.

## Current Implementation

### Component Structure

```
src/app/features/form-builder/components/property-panel/
├── property-panel.component.ts          # Main property panel container
├── property-editor.component.ts         # Generic property editor
├── text-property-editor.component.ts    # Text input editor
├── number-property-editor.component.ts  # Number input editor
├── boolean-property-editor.component.ts # Checkbox editor
├── select-property-editor.component.ts  # Dropdown editor
├── color-property-editor.component.ts   # Color picker editor
├── array-property-editor.component.ts   # Array/list editor
├── object-property-editor.component.ts  # Object editor
└── multi-select-property-editor.component.ts # Multi-select editor
```

### Data Models

#### Element Properties
```typescript
// src/app/core/models/element-properties.model.ts
export interface FormElementProperties {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  visible?: boolean;
  customProperties?: Record<string, any>;
  layout?: LayoutProperties;
  validation?: ValidationProperties;
  style?: StyleProperties;
}

export interface LayoutProperties {
  width?: DimensionValue;
  height?: DimensionValue;
  minWidth?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxHeight?: DimensionValue;
  autoExpand?: boolean;
}

export interface ValidationProperties {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidators?: ValidationRule[];
}
```

#### Form Properties
```typescript
// src/app/core/models/form-properties.model.ts
export interface FormProperties {
  id: string;
  title?: string;
  description?: string;
  titleConfig?: TitleConfig;
  formStyle?: FormStyle;
  layout?: FormLayout;
  validation?: FormValidation;
  style?: Record<string, string>;
}

export interface TitleConfig {
  visible?: boolean;
  text?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  margin?: string;
  padding?: string;
  style?: Record<string, string>;
}
```

### Core Services

#### PropertyPanelService
```typescript
// src/app/core/services/property-panel.service.ts
@Injectable({ providedIn: 'root' })
export class PropertyPanelService {
  // Element properties management
  updateElementProperty(elementId: string, propertyName: string, value: any): void
  getElementProperties(elementId: string): FormElementProperties | null
  
  // Form properties management
  updateFormProperty(propertyName: string, value: any): void
  getFormProperties(): FormProperties
  
  // Property definitions and schemas
  getPropertyDefinitions(elementType: string): PropertyDefinition[]
  getFormPropertyDefinitions(): PropertyDefinition[]
}
```

#### ElementSelectionService
```typescript
// src/app/core/services/element-selection.service.ts
@Injectable({ providedIn: 'root' })
export class ElementSelectionService {
  selectElement(element: FormElementProperties | null): void
  getSelectedElement(): FormElementProperties | null
  isElementSelected(elementId: string): boolean
  deselectElement(): void
}
```

### Property Configuration System

#### Property Definitions
```typescript
// src/app/core/configs/element-property-definitions.ts
export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropertyType;
  group: string;
  defaultValue?: any;
  options?: PropertyOption[];
  validation?: PropertyValidation;
  conditional?: PropertyCondition;
}

export enum PropertyType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  COLOR = 'color',
  ARRAY = 'array',
  OBJECT = 'object'
}
```

#### Dynamic Property Editors
The system uses a factory pattern to create appropriate property editors based on property type:

```typescript
// src/app/core/factories/property-editor.factory.ts
@Injectable({ providedIn: 'root' })
export class PropertyEditorFactory {
  createEditor(propertyDefinition: PropertyDefinition): ComponentRef<any>
}
```

## Features

### ✅ Implemented Features

1. **Element Property Editing**
   - Text properties (label, placeholder)
   - Boolean properties (required, disabled, visible)
   - Number properties (dimensions, validation)
   - Select properties (options, values)
   - Color properties (styling)

2. **Form-Level Configuration**
   - Form title and description
   - Title positioning and styling
   - Form layout and styling
   - Global form properties

3. **Dynamic Property Panels**
   - Type-specific property groups
   - Conditional property display
   - Real-time property updates
   - Property validation

4. **Layout Properties**
   - Element dimensions (width, height)
   - Min/max constraints
   - Auto-expand behavior
   - Responsive settings

5. **Style Properties**
   - Custom CSS properties
   - Color configurations
   - Typography settings
   - Spacing and positioning

### Property Groups

Properties are organized into logical groups:

1. **Basic Properties**
   - Label, placeholder, default value
   - Required, disabled, visible states

2. **Layout Properties**
   - Dimensions and positioning
   - Auto-expand behavior
   - Responsive settings

3. **Validation Properties**
   - Required validation
   - Length constraints
   - Pattern matching
   - Custom validators

4. **Style Properties**
   - Colors and typography
   - Spacing and borders
   - Custom CSS classes

5. **Advanced Properties**
   - Custom properties
   - Element-specific configurations
   - Conditional logic

## Integration with Form Builder

### Element Selection Flow
1. User clicks on form element
2. ElementSelectionService updates selected element
3. PropertyPanelService loads property definitions
4. Property panel renders appropriate editors
5. Changes are synchronized with ElementStateService

### Property Update Flow
1. User modifies property in panel
2. PropertyPanelService validates and updates property
3. ElementStateService persists changes
4. Form editor reflects changes immediately
5. Changes are saved to localStorage

### State Management
- **ElementStateService**: Manages form state and persistence
- **PropertyPanelService**: Handles property configurations
- **ElementSelectionService**: Manages element selection state

## Extensibility

### Adding New Property Types
1. Define property type in PropertyType enum
2. Create property editor component
3. Register in PropertyEditorFactory
4. Add to element property definitions

### Adding New Element Types
1. Create element component
2. Define property schema
3. Add to element factory
4. Configure property definitions

### Custom Property Editors
The system supports custom property editors for specialized use cases:

```typescript
@Component({
  selector: 'app-custom-property-editor',
  template: `<!-- Custom editor template -->`
})
export class CustomPropertyEditorComponent implements PropertyEditor {
  @Input() value: any;
  @Input() definition: PropertyDefinition;
  @Output() valueChange = new EventEmitter<any>();
}
```

## Future Enhancements

### Planned Features
- [ ] Property validation with error messages
- [ ] Property dependencies and conditional display
- [ ] Bulk property editing for multiple elements
- [ ] Property templates and presets
- [ ] Advanced styling with CSS builder
- [ ] Property search and filtering
- [ ] Undo/redo for property changes
- [ ] Property import/export

### Technical Improvements
- [ ] Performance optimization for large forms
- [ ] Better TypeScript typing for properties
- [ ] Property change batching
- [ ] Enhanced property validation
- [ ] Property editor caching