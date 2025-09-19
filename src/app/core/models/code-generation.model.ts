/**
 * Code generation models for Angular component creation
 */

export interface GeneratedComponent {
  name: string;
  selector: string;
  typescript: string;
  template: string;
  styles: string;
  spec?: string;
  dependencies: ImportStatement[];
  metadata: ComponentMetadata;
}

export interface ImportStatement {
  module: string;
  imports: string[];
  from: string;
  isDefault?: boolean;
}

export interface ComponentMetadata {
  standalone: boolean;
  changeDetection?: 'Default' | 'OnPush';
  encapsulation?: 'Emulated' | 'None' | 'ShadowDom';
  providers?: string[];
  exports?: string[];
}

export interface CodeGenerationConfig {
  componentName: string;
  selector: string;
  standalone: boolean;
  generateTests: boolean;
  includeFormValidation: boolean;
  styleFormat: 'css' | 'scss' | 'less';
  outputFormat: 'separate' | 'inline';
  templateFormat: 'external' | 'inline';
  generateComments: boolean;
  includeAccessibility: boolean;
  responsive: boolean;
  angularVersion?: string;
}

export interface GenerationContext {
  config: CodeGenerationConfig;
  structure: any; // Will be ComponentStructure from component.model.ts
  name: string;
  selector: string;
  className: string;
  formControls: FormControlDefinition[];
  imports: Set<string>;
  dependencies: Set<string>;
}

export interface FormControlDefinition {
  name: string;
  type: 'FormControl' | 'FormGroup' | 'FormArray';
  validators: string[];
  defaultValue: any;
  nested?: FormControlDefinition[];
}

export interface TemplateContext {
  components: any[];
  formGroup: string;
  imports: string[];
  methods: string[];
  properties: string[];
}

export interface StyleContext {
  classes: string[];
  variables: string[];
  responsive: boolean;
  theme?: string;
}

export interface TestContext {
  componentName: string;
  selector: string;
  imports: string[];
  dependencies: string[];
  testCases: TestCase[];
}

export interface TestCase {
  name: string;
  description: string;
  setup?: string[];
  action: string;
  assertion: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'component' | 'service' | 'directive' | 'pipe';
  template: string;
  variables: TemplateVariable[];
  dependencies?: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: any;
  description?: string;
  required?: boolean;
}

export interface CodeGenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors?: CodeGenerationError[];
  warnings?: CodeGenerationWarning[];
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  type: 'typescript' | 'template' | 'style' | 'spec' | 'other';
  size: number;
}

export interface CodeGenerationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
  file?: string;
}

export interface CodeGenerationWarning {
  code: string;
  message: string;
  suggestion?: string;
  file?: string;
}

export interface ExportOptions {
  format: 'files' | 'zip' | 'project';
  includeTests: boolean;
  includeReadme: boolean;
  includePackageJson: boolean;
  projectName?: string;
  description?: string;
  author?: string;
  license?: string;
}

export interface ProjectStructure {
  name: string;
  structure: FileNode[];
  dependencies: ProjectDependency[];
  scripts?: { [key: string]: string };
  metadata: ProjectMetadata;
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  children?: FileNode[];
}

export interface ProjectDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
}

export interface ProjectMetadata {
  angular: string;
  typescript: string;
  created: Date;
  generator: string;
  version: string;
}

// Utility types for code generation
export type GenerationStep = 'analyze' | 'generate' | 'validate' | 'format' | 'export';
export type OutputType = 'component' | 'service' | 'module' | 'project';
export type ValidationLevel = 'strict' | 'moderate' | 'relaxed';

export interface GenerationPipeline {
  steps: GenerationStep[];
  validationLevel: ValidationLevel;
  outputType: OutputType;
  hooks?: {
    beforeGeneration?: () => void;
    afterGeneration?: (result: CodeGenerationResult) => void;
    onError?: (error: CodeGenerationError) => void;
  };
}