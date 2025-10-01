# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial library structure with modular architecture
- Core services for form state management
- Drag and drop functionality for form elements
- Property panel for element configuration
- Form validation system
- Event system for form interactions
- Theme support with customizable options
- Demo application showcasing library capabilities
- Comprehensive documentation

## [0.1.0] - 2025-09-30

### Added
- Initial release of the Form Constructor library
- Library structure with separate projects for library and demo
- Core components:
  - FormBuilderComponent: Main form builder interface
  - PropertyPanelComponent: Element property configuration
  - SidebarComponent: Element palette
- Form element types:
  - Input: Text input fields
  - Textarea: Multi-line text areas
  - Select: Dropdown selections
  - Button: Action buttons
- Core services:
  - ElementStateService: Form state management
  - DragStateService: Drag and drop operations
  - ElementSelectionService: Element selection management
  - PropertyPanelService: Property configuration
  - FormService: Form validation and submission
  - ElementRegistryService: Available form elements
  - IconRegistryService: Icon management
- Data models:
  - FormElementProperties: Element properties model
  - FormProperties: Form properties model
  - FormState: Form state model
  - PropertySchema: Property schema model
  - DragData: Drag and drop data model
- Event system:
  - Element events: create, delete, update, select, duplicate, drag
  - Form events: submit, reset, validate, state change, error
- Configuration system:
  - FormConstructorConfig: Main configuration interface
  - Theme configuration options
  - Behavior configuration options
  - Form configuration options
  - Callback functions for event handling
- Angular modules:
  - FormConstructorModule: Main library module
  - CoreModule: Core services and configurations
  - ComponentsModule: Library components
  - FormBuilderModule: Form builder functionality
- Demo application:
  - Basic demo showcasing library features
  - Configuration examples
  - Event handling examples
- Documentation:
  - Library README with installation and usage instructions
  - Demo README with setup and customization instructions
  - API reference with component and service documentation
  - Examples for common use cases

### Changed
- Refactored from monolithic application to library structure
- Improved code organization with modular architecture
- Enhanced type safety with comprehensive TypeScript interfaces
- Standardized configuration system
- Improved event handling with typed events

### Deprecated
- Original application structure (moved to library and demo)

### Removed
- Deprecated application code
- Unused dependencies

### Fixed
- Initial release with no known issues

### Security
- Initial release with no security vulnerabilities

## [0.0.0] - 2025-09-30

### Added
- Project initialization
- Basic Angular application structure
- Initial form builder concept
- Proof of concept implementation

[Unreleased]: https://github.com/coreesoft/form-constructor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/coreesoft/form-constructor/releases/tag/v0.1.0
[0.0.0]: https://github.com/coreesoft/form-constructor/releases/tag/v0.0.0