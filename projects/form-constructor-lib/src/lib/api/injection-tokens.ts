import { InjectionToken } from '@angular/core';
import { FormConstructorConfig } from './form-constructor-config';
import { DEFAULT_FORM_CONSTRUCTOR_CONFIG } from './form-constructor-config';

/**
 * Injection token for the Form Constructor configuration
 */
export const FORM_CONSTRUCTOR_CONFIG = new InjectionToken<FormConstructorConfig>(
  'FORM_CONSTRUCTOR_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_FORM_CONSTRUCTOR_CONFIG
  }
);