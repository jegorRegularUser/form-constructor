/**
 * Export system models for form constructor
 */

export interface ExportConfiguration {
  format: ExportFormat;
  options: ExportOptions;
  target: ExportTarget;
  metadata: ExportMetadata;
}

export type ExportFormat = 
  | 'angular-component' 
  | 'angular-project' 
  | 'json-structure' 
  | 'html-template' 
  | 'standalone-files';

export type ExportTarget = 'download' | 'clipboard' | 'preview' | 'email' | 'api';

export interface ExportOptions {
  includeTests?: boolean;
  includeDocumentation?: boolean;
  includeStyles?: boolean;
  includeValidation?: boolean;
  generateReadme?: boolean;
  compressionLevel?: 'none' | 'fast' | 'best';
  fileNaming?: FileNamingStrategy;
  codeStyle?: CodeStyleOptions;
}

export interface FileNamingStrategy {
  convention: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case';
  prefix?: string;
  suffix?: string;
  includeTimestamp?: boolean;
}

export interface CodeStyleOptions {
  indentation: 'spaces' | 'tabs';
  indentSize: number;
  semicolons: boolean;
  quotes: 'single' | 'double';
  trailingComma: boolean;
  bracketSpacing: boolean;
  arrowFunctionParens: 'avoid' | 'always';
}

export interface ExportMetadata {
  timestamp: Date;
  version: string;
  generator: string;
  author?: string;
  description?: string;
  tags?: string[];
  formName?: string;
  componentCount?: number;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  files: ExportedFile[];
  downloadUrl?: string;
  errors?: ExportError[];
  warnings?: ExportWarning[];
  metadata: ExportResultMetadata;
}

export interface ExportedFile {
  name: string;
  path: string;
  content: string | Blob;
  mimeType: string;
  size: number;
  checksum?: string;
}

export interface ExportError {
  code: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ExportWarning {
  code: string;
  message: string;
  file?: string;
  suggestion?: string;
}

export interface ExportResultMetadata {
  totalFiles: number;
  totalSize: number;
  duration: number;
  timestamp: Date;
  checksum?: string;
}

export interface FileTemplate {
  name: string;
  extension: string;
  template: string;
  requiredVariables: string[];
  optionalVariables: string[];
  dependencies?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  files: FileTemplate[];
  structure: DirectoryStructure;
  dependencies: ProjectDependency[];
  scripts: ProjectScripts;
}

export interface DirectoryStructure {
  [key: string]: DirectoryStructure | null;
}

export interface ProjectDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency';
  required: boolean;
}

export interface ProjectScripts {
  [scriptName: string]: string;
}

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  configuration: ExportConfiguration;
  isDefault?: boolean;
  category?: string;
  tags?: string[];
}

export interface DownloadPackage {
  filename: string;
  content: Blob;
  mimeType: string;
  size: number;
  files: PackageFile[];
}

export interface PackageFile {
  path: string;
  content: string;
  type: 'typescript' | 'html' | 'css' | 'json' | 'markdown' | 'other';
}

export interface ClipboardData {
  format: 'text' | 'html' | 'json';
  content: string;
  metadata?: {
    source: string;
    timestamp: Date;
    type: string;
  };
}

export interface ShareableLink {
  id: string;
  url: string;
  expiresAt?: Date;
  accessLevel: 'view' | 'edit';
  password?: string;
  downloadCount?: number;
  maxDownloads?: number;
}

export interface ExportHistory {
  id: string;
  timestamp: Date;
  configuration: ExportConfiguration;
  result: ExportResult;
  user?: string;
  formId?: string;
  notes?: string;
}

export interface ExportAnalytics {
  totalExports: number;
  exportsByFormat: { [format: string]: number };
  exportsByTarget: { [target: string]: number };
  averageFileSize: number;
  averageExportTime: number;
  popularPresets: string[];
  errorRate: number;
}

// Utility types
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type CompressionFormat = 'zip' | 'tar' | 'gzip' | '7z';
export type OutputEncoding = 'utf8' | 'base64' | 'binary';

export interface ExportJob {
  id: string;
  status: ExportStatus;
  progress: number;
  configuration: ExportConfiguration;
  startTime: Date;
  endTime?: Date;
  result?: ExportResult;
  error?: ExportError;
}

export interface ExportQueue {
  jobs: ExportJob[];
  maxConcurrent: number;
  currentlyProcessing: number;
}