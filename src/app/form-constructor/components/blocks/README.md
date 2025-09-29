# Form Block Components

This directory contains reusable base classes and components for creating form components with drag-and-drop functionality.

## Components

### BaseFormBlockComponent

The `BaseFormBlockComponent` is an abstract base class that provides common functionality for all form blocks, including:

- Drag state management
- Host binding for CSS classes
- Event emission for drag interactions

### DragHandleComponent

The `DragHandleComponent` is a reusable component that provides the six dots drag handle functionality. It encapsulates all the HTML and CSS for the drag handle, eliminating code duplication.

## Usage

To create a new form component, extend the `BaseFormBlockComponent` and use the `DragHandleComponent`:

```typescript
import { Component, Input } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block/base-form-block.component';
import { DragHandleComponent } from './drag-handle/drag-handle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, DragHandleComponent],
  template: `
    <div class="form-block-content">
      <!-- Use the reusable drag handle component -->
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      
      <!-- Your component-specific content -->
      <div class="your-component-content">
        {{ yourValue }}
      </div>
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .your-component-content {
      /* Your component-specific styles */
    }
  `]
})
export class YourComponent extends BaseFormBlockComponent {
  @Input() yourValue: string = '';
}
```

## Files

### base-form-block/base-form-block.component.ts

Contains the abstract base class with common functionality for all form blocks.

### drag-handle/drag-handle.component.ts

Contains the reusable drag handle component with six dots and all related functionality.

### drag-styles.css

Contains the base CSS styles needed for form blocks, including:
- Base styles for form blocks
- Content container styles
- Drag state styles (dragged, drop-preview)

### base-form-block/base-form-block.template.html

Contains the base HTML template that can be used as a starting point for new form components.

### drag-handle/drag-handle.template.html

Contains a simple template that uses the DragHandleComponent.

## Creating New Form Components

1. Create a new component that extends `BaseFormBlockComponent`
2. Import `DragHandleComponent` in your component's imports array
3. Use `<app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>` in your template
4. Import the `drag-styles.css` file in your component's styles
5. Add your component-specific content and styles
6. Implement any additional inputs, outputs, or methods needed

### Example: Button Component

```typescript
import { Component, Input } from '@angular/core';
import { BaseFormBlockComponent } from './base-form-block/base-form-block.component';
import { DragHandleComponent } from './drag-handle/drag-handle.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, DragHandleComponent],
  template: `
    <div class="form-block-content">
      <app-drag-handle (mouseDown)="onDragHandleMouseDown($event)"></app-drag-handle>
      <button class="button-component">{{ text }}</button>
    </div>
  `,
  styles: [`
    @import './drag-styles.css';
    
    .button-component {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ButtonComponent extends BaseFormBlockComponent {
  @Input() text: string = 'Button';
}
```

## Integration with Editor

All form components that extend `BaseFormBlockComponent` will automatically work with the editor's drag-and-drop system. The editor component already implements the `BaseEditorComponent` interface, which expects the following methods on all form components:

- `id: string` - Unique identifier for the component
- `getNativeElement(): HTMLElement` - Returns the native DOM element
- `isDragged: boolean` - Indicates if the component is currently being dragged

These are all provided by the `BaseFormBlockComponent`.