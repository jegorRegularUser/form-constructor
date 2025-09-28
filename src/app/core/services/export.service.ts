import { Injectable, signal, computed, inject } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { 
  ExportConfiguration, 
  ExportResult, 
  ExportFormat, 
  ExportedFile,
  DownloadPackage,
  GeneratedComponent,
  CodeGenerationConfig
} from '../models';
import { CodeGeneratorService } from './code-generator.service';
import { SerializationService } from './serialization.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  public codeGenerator = inject(CodeGeneratorService);
  public serialization = inject(SerializationService);

  // Export state management
  public exportInProgress = signal(false);
  public lastExportResult = signal<ExportResult | null>(null);
  public exportHistory = signal<ExportResult[]>([]);

  // Computed properties
  readonly isExporting = computed(() => this.exportInProgress());
  readonly lastExport = computed(() => this.lastExportResult());
  readonly exportCount = computed(() => this.exportHistory().length);

  /**
   * Export form as Angular component files
   */
  async exportAngularComponent(
    structure: any,
    grapesJSData: any,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    this.exportInProgress.set(true);
    
    try {
      const startTime = Date.now();
      const files: ExportedFile[] = [];
      
      // Generate Angular component code
      const codeConfig: CodeGenerationConfig = {
        componentName: config.metadata.formName || 'GeneratedForm',
        selector: `app-${this.kebabCase(config.metadata.formName || 'generated-form')}`,
        standalone: true,
        generateTests: config.options.includeTests || false,
        includeFormValidation: config.options.includeValidation || true,
        styleFormat: 'css',
        outputFormat: 'separate',
        templateFormat: 'external',
        generateComments: true,
        includeAccessibility: true,
        responsive: true
      };

      const generatedComponent = this.codeGenerator.generateComponent(structure, codeConfig);

      // Create component files
      files.push(this.createFile(
        `${codeConfig.componentName.toLowerCase()}.component.ts`,
        generatedComponent.typescript,
        'typescript'
      ));

      files.push(this.createFile(
        `${codeConfig.componentName.toLowerCase()}.component.html`,
        generatedComponent.template,
        'template'
      ));

      files.push(this.createFile(
        `${codeConfig.componentName.toLowerCase()}.component.css`,
        generatedComponent.styles,
        'style'
      ));

      // Add test file if requested
      if (generatedComponent.spec && config.options.includeTests) {
        files.push(this.createFile(
          `${codeConfig.componentName.toLowerCase()}.component.spec.ts`,
          generatedComponent.spec,
          'spec'
        ));
      }

      // Add README if requested
      if (config.options.generateReadme) {
        files.push(this.createFile(
          'README.md',
          this.generateReadme(generatedComponent, codeConfig),
          'other'
        ));
      }

      // Add package.json if complete project requested
      if (config.format === 'angular-project') {
        files.push(this.createFile(
          'package.json',
          this.generatePackageJson(codeConfig),
          'other'
        ));
      }

      // Create download package based on format
      let downloadUrl: string | undefined;
      
      switch (config.format) {
        case 'standalone-files':
          downloadUrl = await this.createZipDownload(files, `${codeConfig.componentName}-component.zip`);
          break;
        case 'angular-component':
          downloadUrl = await this.createZipDownload(files, `${codeConfig.componentName}-component.zip`);
          break;
        case 'angular-project':
          downloadUrl = await this.createProjectDownload(files, generatedComponent, codeConfig);
          break;
        default:
          downloadUrl = await this.createZipDownload(files, `${codeConfig.componentName}-component.zip`);
      }

      const result: ExportResult = {
        success: true,
        format: config.format,
        files,
        downloadUrl,
        metadata: {
          totalFiles: files.length,
          totalSize: files.reduce((size, file) => size + file.size, 0),
          duration: Date.now() - startTime,
          timestamp: new Date()
        }
      };

      this.addToHistory(result);
      this.lastExportResult.set(result);
      
      return result;

    } catch (error) {
      const errorResult: ExportResult = {
        success: false,
        format: config.format,
        files: [],
        errors: [{
          code: 'EXPORT_FAILED',
          message: `Export failed: ${error}`,
          severity: 'critical'
        }],
        metadata: {
          totalFiles: 0,
          totalSize: 0,
          duration: 0,
          timestamp: new Date()
        }
      };

      this.lastExportResult.set(errorResult);
      throw error;
    } finally {
      this.exportInProgress.set(false);
    }
  }

  /**
   * Export as JSON structure
   */
  async exportJSON(structure: any, grapesJSData: any, filename?: string): Promise<ExportResult> {
    try {
      const jsonString = this.serialization.serializeForm(structure, grapesJSData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const downloadFilename = filename || `form-${Date.now()}.json`;
      saveAs(blob, downloadFilename);

      const result: ExportResult = {
        success: true,
        format: 'json-structure',
        files: [this.createFile(downloadFilename, jsonString, 'other')],
        metadata: {
          totalFiles: 1,
          totalSize: blob.size,
          duration: 0,
          timestamp: new Date()
        }
      };

      this.addToHistory(result);
      return result;

    } catch (error) {
      throw new Error(`JSON export failed: ${error}`);
    }
  }

  /**
   * Copy code to clipboard
   */
  async copyToClipboard(
    structure: any,
    grapesJSData: any,
    codeType: 'typescript' | 'template' | 'styles' | 'all' = 'all'
  ): Promise<void> {
    try {
      const config: CodeGenerationConfig = {
        componentName: 'GeneratedForm',
        selector: 'app-generated-form',
        standalone: true,
        generateTests: false,
        includeFormValidation: true,
        styleFormat: 'css',
        outputFormat: 'separate',
        templateFormat: 'external',
        generateComments: true,
        includeAccessibility: true,
        responsive: true
      };

      const component = this.codeGenerator.generateComponent(structure, config);
      
      let textToCopy = '';
      
      switch (codeType) {
        case 'typescript':
          textToCopy = component.typescript;
          break;
        case 'template':
          textToCopy = component.template;
          break;
        case 'styles':
          textToCopy = component.styles;
          break;
        case 'all':
          textToCopy = `// TypeScript Component\n${component.typescript}\n\n` +
                      `<!-- HTML Template -->\n${component.template}\n\n` +
                      `/* CSS Styles */\n${component.styles}`;
          break;
      }

      await navigator.clipboard.writeText(textToCopy);
      console.log(`${codeType} code copied to clipboard`);

    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  }

  /**
   * Create individual file download
   */
  downloadSingleFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, filename);
  }

  /**
   * Create ZIP download package
   */
  public async createZipDownload(files: ExportedFile[], filename: string): Promise<string> {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, filename);
    
    return URL.createObjectURL(blob);
  }

  /**
   * Create complete Angular project download
   */
  public async createProjectDownload(
    files: ExportedFile[], 
    component: GeneratedComponent, 
    config: CodeGenerationConfig
  ): Promise<string> {
    const zip = new JSZip();
    const projectName = this.kebabCase(config.componentName);
    
    // Create project structure
    const projectFolder = zip.folder(projectName);
    const srcFolder = projectFolder?.folder('src');
    const appFolder = srcFolder?.folder('app');
    
    // Add component files
    files.forEach(file => {
      appFolder?.file(file.name, file.content);
    });

    // Add Angular project files
    srcFolder?.file('main.ts', this.generateMainTs());
    srcFolder?.file('styles.css', this.generateGlobalStyles());
    srcFolder?.file('index.html', this.generateIndexHtml(config.componentName));

    // Add configuration files
    projectFolder?.file('angular.json', this.generateAngularJson(projectName));
    projectFolder?.file('package.json', this.generatePackageJson(config));
    projectFolder?.file('tsconfig.json', this.generateTsConfig());
    projectFolder?.file('tsconfig.app.json', this.generateTsConfigApp());
    projectFolder?.file('.gitignore', this.generateGitignore());
    projectFolder?.file('README.md', this.generateProjectReadme(config));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName}-project.zip`);
    
    return URL.createObjectURL(blob);
  }

  /**
   * Create file object
   */
  public createFile(name: string, content: string, type: string): ExportedFile {
    const mimeTypes = {
      'typescript': 'text/typescript',
      'template': 'text/html',
      'style': 'text/css',
      'spec': 'text/typescript',
      'other': 'text/plain'
    };

    return {
      name,
      path: `./${name}`,
      content,
      mimeType: mimeTypes[type as keyof typeof mimeTypes] || 'text/plain',
      size: new Blob([content]).size
    };
  }

  /**
   * Generate project files
   */
  public generateMainTs(): string {
    return `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .catch(err => console.error(err));`;
  }

  public generateIndexHtml(componentName: string): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${componentName}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>`;
  }

  public generateAngularJson(projectName: string): string {
    return JSON.stringify({
      "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
      "version": 1,
      "newProjectRoot": "projects",
      "projects": {
        [projectName]: {
          "projectType": "application",
          "schematics": {},
          "root": "",
          "sourceRoot": "src",
          "prefix": "app",
          "architect": {
            "build": {
              "builder": "@angular-devkit/build-angular:application",
              "options": {
                "outputPath": `dist/${projectName}`,
                "index": "src/index.html",
                "browser": "src/main.ts",
                "polyfills": ["zone.js"],
                "tsConfig": "tsconfig.app.json",
                "assets": [],
                "styles": ["src/styles.css"],
                "scripts": []
              }
            },
            "serve": {
              "builder": "@angular-devkit/build-angular:dev-server",
              "configurations": {
                "development": {
                  "buildTarget": `${projectName}:build:development`
                }
              },
              "defaultConfiguration": "development"
            }
          }
        }
      }
    }, null, 2);
  }

  public generatePackageJson(config: CodeGenerationConfig): string {
    return JSON.stringify({
      "name": this.kebabCase(config.componentName),
      "version": "0.0.0",
      "description": `Generated Angular component: ${config.componentName}`,
      "scripts": {
        "ng": "ng",
        "start": "ng serve",
        "build": "ng build",
        "test": "ng test"
      },
      "dependencies": {
        "@angular/common": "^19.2.0",
        "@angular/compiler": "^19.2.0",
        "@angular/core": "^19.2.0",
        "@angular/forms": "^19.2.0",
        "@angular/platform-browser": "^19.2.0",
        "@angular/platform-browser-dynamic": "^19.2.0",
        "@angular/router": "^19.2.0",
        "rxjs": "~7.8.0",
        "tslib": "^2.3.0",
        "zone.js": "~0.15.0"
      },
      "devDependencies": {
        "@angular-devkit/build-angular": "^19.2.17",
        "@angular/cli": "^19.2.17",
        "@angular/compiler-cli": "^19.2.0",
        "@types/jasmine": "~5.1.0",
        "jasmine-core": "~5.6.0",
        "karma": "~6.4.0",
        "karma-chrome-launcher": "~3.2.0",
        "karma-coverage": "~2.2.0",
        "karma-jasmine": "~5.1.0",
        "karma-jasmine-html-reporter": "~2.1.0",
        "typescript": "~5.7.2"
      },
      "author": "Form Constructor User",
      "license": "MIT"
    }, null, 2);
  }

  public generateTsConfig(): string {
    return JSON.stringify({
      "compileOnSave": false,
      "compilerOptions": {
        "outDir": "./dist/out-tsc",
        "strict": true,
        "noImplicitOverride": true,
        "noPropertyAccessFromIndexSignature": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "skipLibCheck": true,
        "isolatedModules": true,
        "esModuleInterop": true,
        "sourceMap": true,
        "declaration": false,
        "experimentalDecorators": true,
        "moduleResolution": "bundler",
        "importHelpers": true,
        "target": "ES2022",
        "module": "ES2022",
        "lib": ["ES2022", "dom"]
      },
      "angularCompilerOptions": {
        "enableI18nLegacyMessageIdFormat": false,
        "strictInjectionParameters": true,
        "strictInputAccessModifiers": true,
        "strictTemplates": true
      }
    }, null, 2);
  }

  public generateTsConfigApp(): string {
    return JSON.stringify({
      "extends": "./tsconfig.json",
      "compilerOptions": {
        "outDir": "./out-tsc/app",
        "types": []
      },
      "files": ["src/main.ts"],
      "include": ["src/**/*.d.ts"]
    }, null, 2);
  }

  public generateGitignore(): string {
    return `# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
# Only exists if Bazel was run
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
/.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db`;
  }

  public generateGlobalStyles(): string {
    return `/* Global Styles for Generated Form */

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* CSS Custom Properties */
:root {
  --primary-color: #2563eb;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
  --error-500: #ef4444;
  --success-500: #22c55e;
  
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  
  --radius-md: 0.375rem;
  --transition-fast: 150ms ease-in-out;
}

/* Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.5;
  color: var(--gray-900);
  background-color: var(--gray-50);
}

/* Base component styles */
.form-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: var(--space-6);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}`;
  }

  public generateReadme(component: GeneratedComponent, config: CodeGenerationConfig): string {
    return `# ${config.componentName}

Generated Angular component created with Form Constructor.

## Installation

1. Copy the component files to your Angular project
2. Import the component in your module or use directly as standalone
3. Add the component to your template

## Usage

\`\`\`html
<${config.selector}></${config.selector}>
\`\`\`

## Component Files

- \`${config.componentName.toLowerCase()}.component.ts\` - Component logic
- \`${config.componentName.toLowerCase()}.component.html\` - Template
- \`${config.componentName.toLowerCase()}.component.css\` - Styles
${config.generateTests ? `- \`${config.componentName.toLowerCase()}.component.spec.ts\` - Unit tests` : ''}

## Features

- ✅ Angular 19 standalone component
- ✅ Reactive forms with validation
- ✅ Responsive design
- ✅ Accessibility support
- ✅ Modern CSS styling

## Dependencies

This component requires:
- Angular 19+
- Angular Forms (ReactiveFormsModule)
- Angular Common (CommonModule)

## Generated on

${new Date().toLocaleDateString()} by Angular Form Constructor

---

*This component was automatically generated. You can modify it as needed for your project.*`;
  }

  public generateProjectReadme(config: CodeGenerationConfig): string {
    return `# ${config.componentName} - Angular Project

This is a complete Angular project containing the generated form component.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open http://localhost:4200

## Project Structure

\`\`\`
src/
├── app/
│   ├── ${config.componentName.toLowerCase()}.component.ts
│   ├── ${config.componentName.toLowerCase()}.component.html
│   ├── ${config.componentName.toLowerCase()}.component.css
│   ${config.generateTests ? `├── ${config.componentName.toLowerCase()}.component.spec.ts` : ''}
│   └── app.component.ts
├── main.ts
├── styles.css
└── index.html
\`\`\`

## Generated with Angular Form Constructor

This project was automatically generated and is ready to run with no additional configuration required.`;
  }

  /**
   * Utility methods
   */
  public kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  public addToHistory(result: ExportResult): void {
    this.exportHistory.update(history => {
      const newHistory = [...history, result];
      // Keep only last 20 exports
      return newHistory.slice(-20);
    });
  }

  /**
   * Get export statistics
   */
  getExportStatistics(): {
    totalExports: number;
    successfulExports: number;
    failedExports: number;
    averageFileSize: number;
    popularFormats: string[];
  } {
    const history = this.exportHistory();
    const successful = history.filter(exp => exp.success);
    const failed = history.filter(exp => !exp.success);
    
    const totalSize = successful.reduce((sum, exp) => sum + exp.metadata.totalSize, 0);
    const averageSize = successful.length > 0 ? totalSize / successful.length : 0;
    
    const formatCounts = new Map<string, number>();
    history.forEach(exp => {
      formatCounts.set(exp.format, (formatCounts.get(exp.format) || 0) + 1);
    });
    
    const popularFormats = Array.from(formatCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([format]) => format);

    return {
      totalExports: history.length,
      successfulExports: successful.length,
      failedExports: failed.length,
      averageFileSize: Math.round(averageSize),
      popularFormats
    };
  }

  /**
   * Clear export history
   */
  clearHistory(): void {
    this.exportHistory.set([]);
    this.lastExportResult.set(null);
  }

  /**
   * Export presets for common scenarios
   */
  getExportPresets(): { [key: string]: Partial<ExportConfiguration> } {
    return {
      'component-only': {
        format: 'standalone-files',
        options: {
          includeTests: false,
          generateReadme: true
        }
      },
      'component-with-tests': {
        format: 'standalone-files',
        options: {
          includeTests: true,
          generateReadme: true
        }
      },
      'complete-project': {
        format: 'angular-project',
        options: {
          includeTests: true,
          generateReadme: true
        }
      },
      'minimal': {
        format: 'standalone-files',
        options: {
          includeTests: false,
          generateReadme: false
        }
      }
    };
  }
}