import { Component, signal, computed, ViewChild, ElementRef, inject, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CodeGeneratorService } from '../../../core/services/code-generator.service';
import { DynamicRendererService } from '../../../core/services/dynamic-renderer.service';
import { EditorPanelService } from '../editor-panel/editor-panel.service';

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type OrientationType = 'portrait' | 'landscape';

interface DeviceConfig {
  type: DeviceType;
  width: number;
  height: number;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-panel.component.html',
  styleUrl: './preview-panel.component.css'
})
export class PreviewPanelComponent implements OnInit, OnDestroy {
  private codeGenerator = inject(CodeGeneratorService);
  private dynamicRenderer = inject(DynamicRendererService);
  private sanitizer = inject(DomSanitizer);
  private editorService = inject(EditorPanelService);

  @ViewChild('previewIframe', { static: false }) previewIframe!: ElementRef<HTMLIFrameElement>;
  @ViewChild('fullscreenIframe', { static: false }) fullscreenIframe!: ElementRef<HTMLIFrameElement>;

  // Preview state
  public currentDevice = signal<DeviceType>('desktop');
  public currentOrientation = signal<OrientationType>('portrait');
  private isRefreshing = signal(false);
  private previewContent = signal<string>('');
  public lastUpdateTime = signal<Date>(new Date());
  public showFullscreen = signal(false);

  // Device configurations
  private devices: DeviceConfig[] = [
    {
      type: 'mobile',
      width: 375,
      height: 667,
      label: 'Mobile',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h10v16H7V4z"/></svg>`
    },
    {
      type: 'tablet',
      width: 768,
      height: 1024,
      label: 'Tablet',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h16v14H4V5z"/></svg>`
    },
    {
      type: 'desktop',
      width: 1200,
      height: 800,
      label: 'Desktop',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4a1 1 0 00-1 1v11a1 1 0 001 1h8v2H8a1 1 0 100 2h8a1 1 0 100-2h-3v-2h8a1 1 0 001-1V5a1 1 0 00-1-1H3zm0 2h18v9H3V6z"/></svg>`
    }
  ];

  // Computed properties
  readonly deviceConfig = computed(() => {
    const device = this.devices.find(d => d.type === this.currentDevice());
    if (!device) return this.devices[2]; // Default to desktop
    
    const orientation = this.currentOrientation();
    return {
      ...device,
      width: orientation === 'landscape' ? device.height : device.width,
      height: orientation === 'landscape' ? device.width : device.height
    };
  });

  readonly iframeStyle = computed(() => {
    const config = this.deviceConfig();
    const device = this.currentDevice();
    
    if (device === 'desktop') {
      return {
        width: '100%',
        height: '100%',
        border: '1px solid var(--gray-300)',
        borderRadius: 'var(--radius-lg)'
      };
    }
    
    return {
      width: `${config.width}px`,
      height: `${config.height}px`,
      border: '1px solid var(--gray-300)',
      borderRadius: 'var(--radius-lg)',
      transform: this.calculateScale()
    };
  });

  readonly isRefreshNeeded = computed(() => this.isRefreshing());
  readonly availableDevices = computed(() => this.devices);
  
  readonly fullscreenIframeStyle = computed(() => {
    const config = this.deviceConfig();
    const device = this.currentDevice();
    
    if (device === 'desktop') {
      return {
        width: '1200px',
        height: '800px',
        border: '1px solid var(--gray-300)',
        borderRadius: 'var(--radius-lg)'
      };
    }
    
    return {
      width: `${config.width}px`,
      height: `${config.height}px`,
      border: '1px solid var(--gray-300)',
      borderRadius: 'var(--radius-lg)'
    };
  });

  constructor() {
    // Setup auto-refresh when form changes
    afterNextRender(() => {
      this.setupAutoRefresh();
    });
  }

  ngOnInit(): void {
    // Initial preview generation
    this.refreshPreview();
  }

  ngOnDestroy(): void {
    // Cleanup iframe resources
    this.clearPreview();
  }

  private lastEventTimestamp = 0;

  /**
   * Setup automatic preview refresh when form changes
   */
  private setupAutoRefresh(): void {
    // Listen for custom window events from editor panel
    window.addEventListener('form:changed', (event: any) => {
      try {
        const eventTimestamp = event.detail?.timestamp || Date.now();
        
        // Prevent processing the same event multiple times
        if (eventTimestamp <= this.lastEventTimestamp) {
          return;
        }
        this.lastEventTimestamp = eventTimestamp;
        
        console.log('Form changed event received in preview panel', event.detail);
        
        // If a specific component was changed, refresh immediately
        if (event.detail && event.detail.componentId) {
          this.refreshPreview();
        } else {
          this.debounceRefresh();
        }
      } catch (error) {
        console.error('Error handling form change event:', error);
      }
    });
  }

  private debounceTimeout: any;
  
  /**
   * Debounced refresh to avoid too frequent updates
   */
  private debounceRefresh(): void {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.refreshPreview();
    }, 300); // 300ms debounce
  }

  /**
   * Generate and display preview
   */
  async refreshPreview(): Promise<void> {
    this.isRefreshing.set(true);
    
    try {
      // Get form HTML from editor panel or GrapesJS
      let html = this.getFormHtml();
      let css = '';
      
      // If HTML is empty, use a default form container
      if (!html || html.trim() === '') {
        html = '<div class="form-container" style="padding: 2rem; border: 2px dashed #ccc; text-align: center; color: #666;">Drag components here to build your form</div>';
      }
      
      // Generate complete preview HTML
      const previewHtml = this.generatePreviewHTML(html, css);
      
      // Update iframe content
      await this.updateIframeContent(previewHtml);
      
      this.previewContent.set(previewHtml);
      this.lastUpdateTime.set(new Date());
      
      console.log('Preview refreshed successfully');

    } catch (error) {
      console.error('Preview refresh failed:', error);
    } finally {
      this.isRefreshing.set(false);
    }
  }

  /**
   * Get form HTML from editor service
   */
  private getFormHtml(): string {
    try {
      return this.editorService.generateFormHtml();
    } catch (error) {
      console.warn('Error getting HTML from editor service:', error);
      return '';
    }
  }

  /**
   * Generate complete HTML for preview
   */
  private generatePreviewHTML(formHtml: string, formCss: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Preview</title>
  <style>
    /* Reset and base styles */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.5;
      color: #111827;
      background-color: #f9fafb;
      padding: 1rem;
    }
    
    /* Import our design system */
    :root {
      --primary-500: #3b82f6;
      --primary-600: #2563eb;
      --primary-700: #1d4ed8;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
      --error-500: #ef4444;
      --error-600: #dc2626;
      --space-1: 0.25rem;
      --space-2: 0.5rem;
      --space-3: 0.75rem;
      --space-4: 1rem;
      --space-6: 1.5rem;
      --radius-md: 0.375rem;
      --transition-fast: 150ms ease-in-out;
    }
    
    /* Form styles */
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-6);
      background: white;
      border-radius: var(--radius-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
      margin-bottom: var(--space-4);
    }
    
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: var(--space-2);
    }
    
    .form-control {
      display: block;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      font-size: 1rem;
      color: var(--gray-900);
      background-color: white;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }
    
    .form-check {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .form-check-input {
      width: 1rem;
      height: 1rem;
      accent-color: var(--primary-600);
    }
    
    .form-check-label {
      font-size: 1rem;
      color: var(--gray-700);
      cursor: pointer;
      margin: 0;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2) var(--space-4);
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    
    .btn-primary {
      color: white;
      background-color: var(--primary-600);
      border-color: var(--primary-600);
    }
    
    .btn-primary:hover {
      background-color: var(--primary-700);
      border-color: var(--primary-700);
    }
    
    .btn-secondary {
      color: var(--gray-700);
      background-color: white;
      border-color: var(--gray-300);
    }
    
    .btn-secondary:hover {
      background-color: var(--gray-50);
      border-color: var(--gray-300);
    }
    
    /* Custom form styles */
    ${formCss}
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .form-container {
        padding: var(--space-4);
        margin: 0;
      }
      
      .form-control {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    }
  </style>
</head>
<body>
  <div class="preview-wrapper">
    ${formHtml || '<div class="form-container"><p>Start building your form by dragging components from the sidebar</p></div>'}
  </div>
  
  <script>
    // Add interactivity for preview
    document.addEventListener('DOMContentLoaded', function() {
      // Handle form submission
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          console.log('Form Data:', data);
          
          // Show success message
          alert('Form submitted successfully! Check console for data.');
        });
      });
      
      // Handle button clicks
      const buttons = document.querySelectorAll('button[type="button"]');
      buttons.forEach(button => {
        button.addEventListener('click', function() {
          console.log('Button clicked:', this.textContent);
        });
      });
      
      // Add validation feedback
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          if (this.hasAttribute('required') && !this.value) {
            this.style.borderColor = 'var(--error-500)';
          } else {
            this.style.borderColor = 'var(--gray-300)';
          }
        });
        
        input.addEventListener('input', function() {
          this.style.borderColor = 'var(--gray-300)';
        });
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Update iframe content safely
   */
  private async updateIframeContent(html: string): Promise<void> {
    if (!this.previewIframe?.nativeElement) {
      console.warn('Preview iframe not available');
      return;
    }

    const iframe = this.previewIframe.nativeElement;
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        console.log('Preview iframe content updated');
      } else {
        console.warn('Could not access iframe document');
      }
    } catch (error) {
      console.error('Error updating iframe content:', error);
    }
  }

  /**
   * Device switching
   */
  switchDevice(device: DeviceType): void {
    this.currentDevice.set(device);
    console.log(`Switched to ${device} preview`);
  }

  toggleOrientation(): void {
    const currentOrientation = this.currentOrientation();
    const newOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
    this.currentOrientation.set(newOrientation);
    console.log(`Orientation changed to ${newOrientation}`);
  }

  /**
   * Calculate scale for device preview
   */
  private calculateScale(): string {
    const device = this.currentDevice();
    
    if (device === 'desktop') return 'scale(1)';
    
    // Calculate scale based on available space
    const availableWidth = 400; // Approximate available width in preview panel
    const deviceWidth = this.deviceConfig().width;
    const scale = Math.min(1, (availableWidth - 40) / deviceWidth); // 40px padding
    
    return `scale(${scale})`;
  }

  /**
   * Manual refresh
   */
  manualRefresh(): void {
    this.refreshPreview();
  }

  /**
   * Open preview in new window
   */
  openInNewWindow(): void {
    const content = this.previewContent();
    if (!content) {
      console.warn('No preview content available');
      return;
    }

    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  }

  /**
   * Download preview as HTML file
   */
  downloadPreview(): void {
    const content = this.previewContent();
    if (!content) {
      console.warn('No preview content available');
      return;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `form-preview-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Copy preview HTML to clipboard
   */
  async copyPreviewHTML(): Promise<void> {
    try {
      const content = this.previewContent();
      if (!content) {
        console.warn('No preview content available');
        return;
      }

      await navigator.clipboard.writeText(content);
      console.log('Preview HTML copied to clipboard');
    } catch (error) {
      console.error('Failed to copy preview HTML:', error);
    }
  }

  /**
   * Test form interactivity
   */
  testFormInteraction(): void {
    const iframe = this.previewIframe?.nativeElement;
    if (!iframe || !iframe.contentWindow) return;

    try {
      // Send test data to iframe
      iframe.contentWindow.postMessage({
        type: 'test-interaction',
        data: { action: 'fill-form' }
      }, '*');
    } catch (error) {
      console.error('Failed to test form interaction:', error);
    }
  }

  /**
   * Get current preview metrics
   */
  getPreviewMetrics(): {
    deviceType: DeviceType;
    orientation: OrientationType;
    dimensions: { width: number; height: number };
    lastUpdate: Date;
    hasContent: boolean;
  } {
    const config = this.deviceConfig();
    
    return {
      deviceType: this.currentDevice(),
      orientation: this.currentOrientation(),
      dimensions: { width: config.width, height: config.height },
      lastUpdate: this.lastUpdateTime(),
      hasContent: this.previewContent().length > 0
    };
  }

  /**
   * Reset preview to initial state
   */
  resetPreview(): void {
    this.currentDevice.set('desktop');
    this.currentOrientation.set('portrait');
    this.clearPreview();
    this.refreshPreview();
  }

  /**
   * Clear preview content
   */
  private clearPreview(): void {
    if (this.previewIframe) {
      const iframe = this.previewIframe.nativeElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write('<html><body><p>Loading preview...</p></body></html>');
        iframeDoc.close();
      }
    }
    
    this.previewContent.set('');
  }

  /**
   * Handle iframe load events
   */
  onIframeLoad(): void {
    console.log('Preview iframe loaded');
    
    // Setup message listener for iframe communication
    window.addEventListener('message', (event) => {
      if (event.source === this.previewIframe?.nativeElement.contentWindow) {
        this.handleIframeMessage(event.data);
      }
    });
  }

  /**
   * Handle messages from iframe
   */
  private handleIframeMessage(data: any): void {
    switch (data.type) {
      case 'form-submit':
        console.log('Form submitted in preview:', data.payload);
        break;
      case 'validation-error':
        console.log('Validation error in preview:', data.payload);
        break;
      case 'interaction':
        console.log('User interaction in preview:', data.payload);
        break;
      default:
        console.log('Unknown message from preview iframe:', data);
    }
  }

  /**
   * Process HTML for preview by removing absolute positioning
   */
  private processHtmlForPreview(html: string): string {
    // Remove absolute positioning from components
    let processedHtml = html.replace(/style="position: absolute;[^"]*"/g, '');
    
    // Remove empty style attributes
    processedHtml = processedHtml.replace(/style=""/g, '');
    
    // Convert form-container to have proper layout
    processedHtml = processedHtml.replace(
      /<div class="form-container"/g,
      '<div class="form-container"'
    );
    
    return processedHtml;
  }

  /**
    * Enable/disable preview interactions
    */
  toggleInteractivity(enabled: boolean): void {
    const iframe = this.previewIframe?.nativeElement;
    if (!iframe) return;

    iframe.style.pointerEvents = enabled ? 'auto' : 'none';
    console.log(`Preview interactivity ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Open fullscreen preview modal
   */
  openFullscreen(): void {
    this.showFullscreen.set(true);
    
    // Update the fullscreen iframe content after a short delay to ensure the modal is rendered
    setTimeout(() => {
      this.updateFullscreenIframe();
    }, 100);
  }

  /**
   * Close fullscreen preview modal
   */
  closeFullscreen(): void {
    this.showFullscreen.set(false);
  }

  /**
   * Update fullscreen iframe content
   */
  private updateFullscreenIframe(): void {
    if (!this.fullscreenIframe?.nativeElement) {
      console.warn('Fullscreen iframe not available');
      return;
    }

    const content = this.previewContent();
    if (!content) {
      console.warn('No preview content available for fullscreen');
      return;
    }

    const iframe = this.fullscreenIframe.nativeElement;
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
        console.log('Fullscreen iframe content updated');
      } else {
        console.warn('Could not access fullscreen iframe document');
      }
    } catch (error) {
      console.error('Error updating fullscreen iframe content:', error);
    }
  }
}