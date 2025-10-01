import { FormProperties } from '../models/form-properties.model';
import { PropertyPanelConfig } from '../models/property-schema.model';

/**
 * Form Constructor Configuration Interface
 * 
 * Defines the configuration options for the Form Constructor library
 */
export interface FormConstructorConfig {
  /**
   * Default form properties
   */
  defaultFormProperties?: Partial<FormProperties>;
  
  /**
   * Property panel configuration
   */
  propertyPanel?: PropertyPanelConfig;
  
  /**
   * Theme configuration
   */
  theme?: {
    /**
     * Primary color for the form constructor
     */
    primaryColor?: string;
    
    /**
     * Secondary color for the form constructor
     */
    secondaryColor?: string;
    
    /**
     * Background color for the form constructor
     */
    backgroundColor?: string;
    
    /**
     * Text color for the form constructor
     */
    textColor?: string;
    
    /**
     * Border color for the form constructor
     */
    borderColor?: string;
    
    /**
     * Border radius for form elements
     */
    borderRadius?: string | number;
    
    /**
     * Font family for the form constructor
     */
    fontFamily?: string;
    
    /**
     * Font size for the form constructor
     */
    fontSize?: string | number;
  };
  
  /**
   * Behavior configuration
   */
  behavior?: {
    /**
     * Whether to enable drag and drop functionality
     */
    enableDragAndDrop?: boolean;
    
    /**
     * Whether to enable inline editing of element labels
     */
    enableInlineLabelEditing?: boolean;
    
    /**
     * Whether to enable form validation
     */
    enableValidation?: boolean;
    
    /**
     * Whether to show validation errors
     */
    showValidationErrors?: boolean;
    
    /**
     * Whether to auto-save form state
     */
    autoSave?: boolean;
    
    /**
     * Auto-save interval in milliseconds
     */
    autoSaveInterval?: number;
    
    /**
     * Whether to confirm before removing elements
     */
    confirmBeforeRemove?: boolean;
    
    /**
     * Whether to enable keyboard shortcuts
     */
    enableKeyboardShortcuts?: boolean;
    
    /**
     * Whether to enable undo/redo functionality
     */
    enableUndoRedo?: boolean;
    
    /**
     * Maximum number of undo/redo steps to keep in history
     */
    maxUndoRedoSteps?: number;
  };
  
  /**
   * Localization configuration
   */
  localization?: {
    /**
     * Language code (e.g., 'en', 'fr', 'de')
     */
    language?: string;
    
    /**
     * Custom translations
     */
    translations?: Record<string, Record<string, string>>;
    
    /**
     * Date format
     */
    dateFormat?: string;
    
    /**
     * Time format
     */
    timeFormat?: string;
    
    /**
     * Number format
     */
    numberFormat?: string;
    
    /**
     * Currency format
     */
    currencyFormat?: {
      currency: string;
      symbol: string;
      position: 'before' | 'after';
    };
  };
  
  /**
   * Element configuration
   */
  elements?: {
    /**
     * Default element properties
     */
    defaultProperties?: Record<string, any>;
    
    /**
     * Whether to show element icons
     */
    showIcons?: boolean;
    
    /**
     * Whether to show element descriptions
     */
    showDescriptions?: boolean;
    
    /**
     * Whether to enable element categories
     */
    enableCategories?: boolean;
    
    /**
     * Default category to show
     */
    defaultCategory?: string;
    
    /**
     * Whether to enable element search
     */
    enableSearch?: boolean;
    
    /**
     * Whether to enable element filtering
     */
    enableFiltering?: boolean;
  };
  
  /**
   * Form configuration
   */
  form?: {
    /**
     * Default form layout
     */
    defaultLayout?: 'vertical' | 'horizontal' | 'inline';
    
    /**
     * Default form size
     */
    defaultSize?: 'small' | 'default' | 'large';
    
    /**
     * Default label alignment
     */
    defaultLabelAlign?: 'left' | 'right';
    
    /**
     * Default label width
     */
    defaultLabelWidth?: number | string;
    
    /**
     * Whether to show form title
     */
    showTitle?: boolean;
    
    /**
     * Whether to show form description
     */
    showDescription?: boolean;
    
    /**
     * Whether to show form borders
     */
    showBorders?: boolean;
    
    /**
     * Whether to enable form responsiveness
     */
    enableResponsiveness?: boolean;
  };
  
  /**
   * Callback functions
   */
  callbacks?: {
    /**
     * Called when the form is submitted
     */
    onFormSubmit?: (data: any) => void | Promise<void>;
    
    /**
     * Called when the form validation state changes
     */
    onValidationChange?: (isValid: boolean, errors: any[]) => void;
    
    /**
     * Called when an element is added
     */
    onElementAdd?: (element: any) => void;
    
    /**
     * Called when an element is removed
     */
    onElementRemove?: (elementId: string) => void;
    
    /**
     * Called when an element is updated
     */
    onElementUpdate?: (elementId: string, properties: any) => void;
    
    /**
     * Called when an element is selected
     */
    onElementSelect?: (element: any) => void;
    
    /**
     * Called when the form state changes
     */
    onStateChange?: (state: any) => void;
    
    /**
     * Called when an error occurs
     */
    onError?: (error: Error) => void;
  };
  
  /**
   * Advanced configuration
   */
  advanced?: {
    /**
     * Whether to enable debug mode
     */
    debug?: boolean;
    
    /**
     * Custom CSS classes to apply to the form constructor
     */
    customCssClasses?: string[];
    
    /**
     * Custom styles to apply to the form constructor
     */
    customStyles?: Record<string, string>;
    
    /**
     * Custom validators
     */
    customValidators?: Record<string, (value: any) => boolean | string>;
    
    /**
     * Custom property editors
     */
    customPropertyEditors?: Record<string, any>;
    
    /**
     * Custom element types
     */
    customElementTypes?: any[];
    
    /**
     * Whether to enable performance monitoring
     */
    enablePerformanceMonitoring?: boolean;
    
    /**
     * Whether to enable analytics
     */
    enableAnalytics?: boolean;
    
    /**
     * Analytics configuration
     */
    analytics?: {
      /**
       * Analytics provider (e.g., 'google', 'custom')
       */
      provider?: string;
      
      /**
       * Analytics tracking ID
       */
      trackingId?: string;
      
      /**
       * Custom analytics implementation
       */
      customImplementation?: (event: string, data: any) => void;
    };
  };
}

/**
 * Default Form Constructor Configuration
 */
export const DEFAULT_FORM_CONSTRUCTOR_CONFIG: FormConstructorConfig = {
  defaultFormProperties: {
    layout: 'vertical',
    size: 'default',
    labelAlign: 'left',
    labelWidth: 120
  },
  propertyPanel: {
    title: 'Properties',
    width: 300,
    resizable: true,
    collapsible: true,
    showHelp: true,
    showValidation: true,
    livePreview: true
  },
  theme: {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#d9d9d9',
    borderRadius: 4,
    fontFamily: 'Arial, sans-serif',
    fontSize: 14
  },
  behavior: {
    enableDragAndDrop: true,
    enableInlineLabelEditing: true,
    enableValidation: true,
    showValidationErrors: true,
    autoSave: true,
    autoSaveInterval: 30000,
    confirmBeforeRemove: true,
    enableKeyboardShortcuts: true,
    enableUndoRedo: true,
    maxUndoRedoSteps: 50
  },
  localization: {
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    numberFormat: '1,000.00',
    currencyFormat: {
      currency: 'USD',
      symbol: '$',
      position: 'before'
    }
  },
  elements: {
    showIcons: true,
    showDescriptions: true,
    enableCategories: true,
    defaultCategory: 'basic',
    enableSearch: true,
    enableFiltering: true
  },
  form: {
    defaultLayout: 'vertical',
    defaultSize: 'default',
    defaultLabelAlign: 'left',
    defaultLabelWidth: 120,
    showTitle: true,
    showDescription: true,
    showBorders: true,
    enableResponsiveness: true
  },
  advanced: {
    debug: false,
    customCssClasses: [],
    customStyles: {},
    customValidators: {},
    customPropertyEditors: {},
    customElementTypes: [],
    enablePerformanceMonitoring: false,
    enableAnalytics: false
  }
};