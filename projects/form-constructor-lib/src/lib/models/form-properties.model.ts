export interface FormProperties {
  id: string;
  title?: string;
  description?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelAlign?: 'left' | 'right';
  labelWidth?: number | string;
  size?: 'small' | 'default' | 'large';
  style?: Record<string, string>;
  customClass?: string;
  submitButton?: FormButtonProperties;
  resetButton?: FormButtonProperties;
  validation?: FormValidationProperties;
  titleConfig?: FormTitleProperties;
  formStyle?: FormStyleProperties;
  customProperties?: Record<string, any>;
}

export interface FormStyleProperties {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number | string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderRadius?: number | string;
  padding?: string;
  margin?: string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  minHeight?: number | string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number | string;
  letterSpacing?: number | string;
}

export interface FormTitleProperties {
  text?: string;
  visible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'left' | 'center' | 'right';
  style?: Record<string, string>;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  color?: string;
  margin?: string;
  padding?: string;
}

export interface FormButtonProperties {
  text: string;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  size?: 'large' | 'default' | 'small';
  visible?: boolean;
  disabled?: boolean;
}

export interface FormValidationProperties {
  validateOnSubmit?: boolean;
  validateOnBlur?: boolean;
  showErrorMessages?: boolean;
  customValidators?: FormValidationRule[];
}

export interface FormValidationRule {
  name: string;
  validator: string; // Function name or expression
  message: string;
}