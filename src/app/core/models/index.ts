/**
 * Core models index - exports all model interfaces and types
 */

// Component models - base interfaces
export {
  type BaseComponent,
  type FormComponent,
  type ContainerComponent,
  type ComponentType,
  type ComponentProperties,
  type ValidationRule,
  type ComponentDefinition,
  type PropertyDefinition,
  type ComponentStyling,
  type ResponsiveStyles,
  type ComponentEvent,
  type GridConfiguration,
  type FlexConfiguration,
  type ValidatorConfig,
  type ComponentStructure,
  type ConditionalDisplay,
  type ComponentTemplate,
  type PreviewConfig,
  type LayoutType
} from './component.model';

// Form element models - specific form components
export {
  type FormElementType,
  type InputFieldComponent,
  type TextareaComponent,
  type SelectComponent,
  type CheckboxComponent,
  type RadioComponent,
  type ButtonComponent,
  type LabelComponent,
  type FormContainerComponent,
  type GridContainerComponent,
  type FlexContainerComponent,
  type FormStructure,
  type FormValidationConfig,
  type FormSubmissionConfig,
  type FormBuilderState,
  type FormExportOptions,
  type GeneratedFormFiles,
  type FormElementFactory,
  type FormValidator,
  type ValidationResult,
  type FormValidationResult
} from './form-element.model';

// Code generation models
export {
  type GeneratedComponent,
  type CodeGenerationConfig,
  type ImportStatement,
  type ComponentMetadata,
  type GenerationContext,
  type FormControlDefinition,
  type CodeGenerationResult,
  type GeneratedFile,
  type CodeGenerationError,
  type ProjectStructure,
  type GenerationPipeline
} from './code-generation.model';

// Export system models
export {
  type ExportConfiguration,
  type ExportResult,
  type ExportFormat,
  type ExportTarget,
  type ExportedFile,
  type ExportError,
  type DownloadPackage,
  type ExportPreset,
  type ExportHistory,
  type ExportAnalytics,
  type ExportJob,
  type ExportQueue
} from './export.model';