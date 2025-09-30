# Form Constructor

A powerful drag-and-drop form builder built with Angular 19 and Ng-Zorro UI components.

## Features

### ✅ Implemented
- **Drag & Drop Interface**: Intuitive form building with visual drop indicators
- **Form Elements**: Input, Textarea, Select, Button components
- **Element Management**: Add, remove, duplicate, and move elements
- **Inline Label Editing**: Click on labels to edit them directly
- **Element Actions**: Delete, duplicate, toggle required, and settings buttons
- **Property Panel**: Configure element properties with real-time updates
- **Form State Management**: Automatic save/restore with localStorage
- **Responsive Layout**: Collapsible sidebar and property panel
- **Visual Feedback**: Element selection, hover states, and drag indicators

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

## Development

### Prerequisites
- Node.js (v18+)
- Angular CLI (v19.2.17)

### Installation
```bash
npm install
```

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`

### Build
```bash
ng build
```

## Architecture

### Core Services
- **ElementStateService**: Manages form state and persistence
- **DragStateService**: Handles drag-and-drop operations
- **ElementSelectionService**: Manages element selection
- **PropertyPanelService**: Handles property configurations
- **FormService**: Form validation and submission

### Component Structure
```
src/app/
├── core/                    # Core services and models
│   ├── services/           # State management services
│   ├── models/            # Data models and interfaces
│   └── factories/         # Element creation factories
├── features/
│   └── form-builder/      # Main form builder feature
│       ├── components/
│       │   ├── editor/    # Form editor with drag-drop
│       │   ├── sidebar/   # Element palette
│       │   └── property-panel/ # Property configuration
├── shared/
│   └── components/
│       └── form-elements/ # Reusable form components
└── layouts/               # Application layouts
```

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

## Usage

1. **Add Elements**: Drag elements from the sidebar to the form editor
2. **Configure Properties**: Select elements to edit properties in the right panel
3. **Edit Labels**: Click on element labels to edit them inline
4. **Manage Elements**: Use action buttons (delete, duplicate, required, settings)
5. **Save/Load**: Forms are automatically saved and restored

