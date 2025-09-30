# Icon Usage Documentation for Form Constructor

This document lists all icons used in the Form Constructor application, their locations, and guidelines for using icons in future development.

## Icons Used in the Application

### 1. `delete`
- **Location**: [`base-form-block.component.html`](src/app/shared/components/form-elements/base-form-block.component.html:14)
- **Usage**: Delete button for form elements
- **Theme**: outline
- **Purpose**: Remove a form element from the form

### 2. `copy`
- **Location**: [`base-form-block.component.html`](src/app/shared/components/form-elements/base-form-block.component.html:24)
- **Usage**: Duplicate button for form elements
- **Theme**: outline
- **Purpose**: Create a copy of an existing form element

### 3. `check-circle`
- **Location**: [`base-form-block.component.html`](src/app/shared/components/form-elements/base-form-block.component.html:36)
- **Usage**: Required field toggle button
- **Theme**: outline/fill (changes based on state)
- **Purpose**: Toggle whether a form element is required

### 4. `right`
- **Location**: [`main-layout.component.html`](src/app/layouts/main-layout.component.html:6), [`sidebar.component.html`](src/app/features/form-builder/components/sidebar/sidebar.component.html:5), [`property-panel.component.html`](src/app/features/form-builder/components/property-panel/property-panel.component.html:5)
- **Usage**: Collapse/expand toggle for panels
- **Theme**: outline
- **Purpose**: Indicate collapsed state or direction to collapse

### 5. `left`
- **Location**: [`main-layout.component.html`](src/app/layouts/main-layout.component.html:15), [`sidebar.component.html`](src/app/features/form-builder/components/sidebar/sidebar.component.html:5), [`property-panel.component.html`](src/app/features/form-builder/components/property-panel/property-panel.component.html:5)
- **Usage**: Collapse/expand toggle for panels
- **Theme**: outline
- **Purpose**: Indicate expanded state or direction to expand

### 6. `down`
- **Location**: [`property-panel.component.ts`](src/app/features/form-builder/components/property-panel/property-panel.component.ts:65)
- **Usage**: Expand/collapse property groups
- **Theme**: outline
- **Purpose**: Indicate expanded state of property groups

### 7. `info-circle`
- **Location**: [`property-panel.component.ts`](src/app/features/form-builder/components/property-panel/property-panel.component.ts:67), [`object-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/object-property-editor.component.ts:42), [`base-generic-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/base-generic-property-editor.component.ts:19)
- **Usage**: Information tooltip for properties
- **Theme**: outline
- **Purpose**: Provide additional information about a property

### 8. `plus`
- **Location**: [`object-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/object-property-editor.component.ts:101), [`array-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/array-property-editor.component.ts:130)
- **Usage**: Add new items to arrays
- **Theme**: outline
- **Purpose**: Add new items to array properties

### 9. `undo`
- **Location**: [`object-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/object-property-editor.component.ts:174)
- **Usage**: Reset to default button
- **Theme**: outline
- **Purpose**: Reset object properties to default values

### 10. `exclamation-circle`
- **Location**: [`multi-select-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/multi-select-property-editor.component.ts:59)
- **Usage**: Error indicator for validation
- **Theme**: fill
- **Purpose**: Indicate validation errors

### 11. `up`
- **Location**: [`array-property-editor.component.ts`](src/app/features/form-builder/components/property-panel/array-property-editor.component.ts:102)
- **Usage**: Move item up in array
- **Theme**: outline
- **Purpose**: Move array item up in the order

### 12. `form`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:398)
- **Usage**: Basic elements category
- **Theme**: outline
- **Purpose**: Represent basic form elements category

### 13. `setting`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:406) (replaces `widgets`)
- **Usage**: Advanced elements category
- **Theme**: outline
- **Purpose**: Represent advanced form elements category

### 14. `appstore`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:414) (replaces `grid_view`)
- **Usage**: Layout elements category
- **Theme**: outline
- **Purpose**: Represent layout elements category

### 15. `tool`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:422) (replaces `extension`)
- **Usage**: Custom elements category
- **Theme**: outline
- **Purpose**: Represent custom elements category

### 16. `edit`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:441)
- **Usage**: Input and textarea elements
- **Theme**: outline
- **Purpose**: Represent text input elements

### 17. `check`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:490)
- **Usage**: Select element
- **Theme**: outline
- **Purpose**: Represent selection elements

### 18. `plus-square`
- **Location**: [`element-registry.service.ts`](src/app/core/services/element-registry.service.ts:515)
- **Usage**: Button element
- **Theme**: outline
- **Purpose**: Represent button elements

## Icon Implementation

### Icon Registration
All icons are registered in the [`IconRegistryService`](src/app/core/services/icon-registry.service.ts) which is initialized in the [`AppComponent`](src/app/app.component.ts). This ensures all icons are available throughout the application.

### Icon Usage
Icons are used in the application with the NG-ZORRO icon component:
```html
<span nz-icon nzType="delete" nzTheme="outline"></span>
```

### Icon Themes
- **outline**: Used for most icons, provides a clean, minimal look
- **fill**: Used for icons that need to stand out, such as error indicators

## Guidelines for Using Icons in Future Development

### 1. Icon Selection
- Choose icons that clearly represent their purpose
- Use consistent icon styles (outline for most cases, fill for emphasis)
- Consider accessibility and ensure icons are understandable

### 2. Adding New Icons
1. Check if the icon is available in NG-ZORRO
2. Import the icon in [`IconRegistryService`](src/app/core/services/icon-registry.service.ts)
3. Register the icon in the `registerIcons()` method
4. Add the icon to the `getRegisteredIconNames()` method
5. Update this documentation

### 3. Icon Themes
- Use `outline` theme for standard icons
- Use `fill` theme for icons that need emphasis (e.g., error states, active states)
- Be consistent with theme usage across the application

### 4. Accessibility
- Always provide alternative text or context for icon-only buttons
- Use tooltips to explain icon purpose when necessary
- Ensure icons have sufficient contrast and size

### 5. Icon Sizes
- Use default size for most cases
- Consider larger sizes for important actions
- Use smaller sizes for secondary actions

## Summary

All icons used in the Form Constructor application are properly registered and available in NG-ZORRO 19.0.0. Three icons were replaced with alternatives:
- `widgets` → `setting`
- `grid_view` → `appstore`
- `extension` → `tool`

The application now has a centralized icon registration system that makes it easy to manage and extend icon usage.