import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from './core.module';
import { ComponentsModule } from './components.module';
import { FormBuilderModule } from './form-builder.module';
import { FormConstructorConfig } from '../api/form-constructor-config';
import { FORM_CONSTRUCTOR_CONFIG } from '../api/injection-tokens';

/**
 * Main Form Constructor module that provides all functionality
 * for building and managing forms.
 */
@NgModule({
  imports: [
    CommonModule,
    CoreModule.forRoot(),
    ComponentsModule,
    FormBuilderModule
  ],
  exports: [
    ComponentsModule,
    FormBuilderModule
  ]
})
export class FormConstructorModule {
  /**
   * Import this module to get all form constructor functionality
   * @param config Configuration options for the form constructor
   * @returns ModuleWithProviders
   */
  static forRoot(config?: FormConstructorConfig): ModuleWithProviders<FormConstructorModule> {
    return {
      ngModule: FormConstructorModule,
      providers: [
        {
          provide: FORM_CONSTRUCTOR_CONFIG,
          useValue: config || {}
        }
      ]
    };
  }
}