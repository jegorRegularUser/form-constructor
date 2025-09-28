/**
 * Constants for the Editor Panel Component
 */

// Component Types
export const COMPONENT_TYPES = {
  TEXT_INPUT: 'text-input',
  EMAIL_INPUT: 'email-input',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  BUTTON: 'button',
  CONTAINER: 'container',
} as const;

// Drop Zone Positions
export const DROP_ZONE_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

// Drag Sources
export const DRAG_SOURCES = {
  SIDEBAR: 'sidebar',
  CANVAS: 'canvas',
} as const;

// Layout Types
export const LAYOUT_TYPES = {
  BLOCK: 'block',
  FLEX: 'flex',
  GRID: 'grid',
  INLINE: 'inline',
} as const;

// CSS Classes
export const CSS_CLASSES = {
  DRAG_GHOST_CURSOR: 'drag-ghost-cursor',
  DRAG_GHOST_CONTENT: 'drag-ghost-content',
  DRAG_GHOST_ICON: 'drag-ghost-icon',
  DRAG_GHOST_LABEL: 'drag-ghost-label',
  DROPPED_COMPONENT: 'dropped-component',
  COMPONENT_DROP_ZONE: 'component-drop-zone',
  COMPONENT_PREVIEW: 'component-preview',
  FORM_CONTAINER: 'form-container',
  CONTAINER_COMPONENT: 'container-component',
  NESTED_COMPONENT: 'nested-component',
  CONTAINER_PLACEHOLDER: 'container-placeholder',
  FORM_GROUP: 'form-group',
  FORM_LABEL: 'form-label',
  FORM_CONTROL: 'form-control',
  FORM_CHECK: 'form-check',
  FORM_CHECK_INPUT: 'form-check-input',
  FORM_CHECK_LABEL: 'form-check-label',
  EDITOR_TOOLBAR: 'editor-toolbar',
  TOOLBAR_GROUP: 'toolbar-group',
  TOOLBAR_SEPARATOR: 'toolbar-separator',
  EDITOR_INFO: 'editor-info',
  DROP_INDICATOR: 'drop-indicator',
  DROP_INDICATOR_TOP: 'drop-indicator-top',
  DROP_INDICATOR_BOTTOM: 'drop-indicator-bottom',
  DROP_INDICATOR_LEFT: 'drop-indicator-left',
  DROP_INDICATOR_RIGHT: 'drop-indicator-right',
  DROP_ZONE_HOVER: 'drop-zone-hover',
  SELECTED: 'selected',
  DRAGGING: 'dragging',
  PREVIEW: 'preview',
  CDK_DRAG_PREVIEW: 'cdk-drag-preview',
  CDK_DRAG_ANIMATING: 'cdk-drag-animating',
  CDK_DRAG_PLACEHOLDER: 'cdk-drag-placeholder',
  CDK_DROP_LIST_DRAGGING: 'cdk-drop-list-dragging',
  BTN: 'btn',
  BTN_SM: 'btn-sm',
  'W-16': 'w-16',
  'H-16': 'h-16',
} as const;

// Event Names
export const EVENT_NAMES = {
  COMPONENT_SELECTED: 'component-selected',
  COMPONENT_PROPERTY_UPDATED: 'component-property-updated',
  COMPONENT_DELETE_REQUESTED: 'component-delete-requested',
  FORM_CHANGED: 'form:changed',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  COMPONENT_WIDTH: '100%',
  CONTAINER_WIDTH: 'fit-content',
  BUTTON_WIDTH: 'auto',
  TEXTAREA_ROWS: 3,
  DEBOUNCE_TIME: 300,
  OPACITY_HALF: '0.5',
  OPACITY_ZERO: '0',
  Z_INDEX_MAX: '10000',
  BORDER_RADIUS_SMALL: '2px',
  BORDER_RADIUS_MEDIUM: '6px',
  BORDER_RADIUS_LARGE: '8px',
  GAP_SMALL: '0.5rem',
  GAP_MEDIUM: '0.75rem',
  GAP_LARGE: '1rem',
  PADDING_SMALL: '0.5rem',
  PADDING_MEDIUM: '0.75rem',
  PADDING_LARGE: '1rem',
  MIN_HEIGHT_CANVAS: '320px',
  MIN_WIDTH_ZERO: '0',
  MIN_HEIGHT_ZERO: '0',
} as const;

// Icons
export const ICONS = {
  PACKAGE: '📦',
  TRASH: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  EXPORT: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#3b82f6',
  PRIMARY_500: 'var(--primary-500)',
  GRAY_50: 'var(--gray-50)',
  GRAY_200: 'var(--gray-200)',
  GRAY_300: 'var(--gray-300)',
  GRAY_500: 'var(--gray-500)',
  CANVAS_BG: 'var(--canvas-bg, #ffffff)',
  CONTAINER_BG: 'var(--container-bg, #fafafa)',
  TEXT_GRAY: '#9aa0a6',
} as const;

// Animation
export const ANIMATION = {
  PULSE_INDICATOR: 'pulse-indicator 1s ease-in-out infinite alternate',
} as const;

// Selectors
export const SELECTORS = {
  CDK_DRAG_PREVIEW: '.cdk-drag-preview',
  DROPPED_COMPONENT: '.dropped-component',
} as const;

// Component Labels
export const COMPONENT_LABELS = {
  [COMPONENT_TYPES.TEXT_INPUT]: 'Text Input',
  [COMPONENT_TYPES.EMAIL_INPUT]: 'Email Input',
  [COMPONENT_TYPES.TEXTAREA]: 'Textarea',
  [COMPONENT_TYPES.SELECT]: 'Select',
  [COMPONENT_TYPES.CHECKBOX]: 'Checkbox',
  [COMPONENT_TYPES.BUTTON]: 'Button',
  [COMPONENT_TYPES.CONTAINER]: 'Container',
} as const;

// Default Properties
export const DEFAULT_PROPERTIES = {
  [COMPONENT_TYPES.TEXT_INPUT]: {
    label: 'Text Input',
    placeholder: 'Enter text',
    required: false,
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
  [COMPONENT_TYPES.EMAIL_INPUT]: {
    label: 'Email',
    placeholder: 'Enter email',
    required: false,
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
  [COMPONENT_TYPES.TEXTAREA]: {
    label: 'Description',
    placeholder: 'Enter description',
    rows: DEFAULT_VALUES.TEXTAREA_ROWS,
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
  [COMPONENT_TYPES.SELECT]: {
    label: 'Select Option',
    options: ['Option 1', 'Option 2', 'Option 3'],
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
  [COMPONENT_TYPES.CHECKBOX]: {
    label: 'Checkbox',
    checked: false,
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
  [COMPONENT_TYPES.BUTTON]: {
    text: 'Button',
    type: 'button',
    variant: 'primary',
    fullWidth: false,
    width: DEFAULT_VALUES.BUTTON_WIDTH,
  },
  [COMPONENT_TYPES.CONTAINER]: {
    layout: LAYOUT_TYPES.FLEX,
    direction: 'column',
    gap: DEFAULT_VALUES.GAP_MEDIUM,
    padding: DEFAULT_VALUES.PADDING_SMALL,
    columns: 2,
    width: DEFAULT_VALUES.COMPONENT_WIDTH,
  },
} as const;

// Connected Lists
export const CONNECTED_LISTS = [
  'sidebar-list',
  'sidebar-layout-list',
  'sidebar-actions-list',
  'main-editor-list',
] as const;

// ID Prefixes
export const ID_PREFIXES = {
  COMPONENT: 'comp_',
  CONTAINER: 'container-',
} as const;