import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Services
import { ElementStateService } from '../core/services/element-state.service';
import { PropertyPanelService } from '../core/services/property-panel.service';
import { ElementRegistryService } from '../core/services/element-registry.service';
import { ElementSelectionService } from '../core/services/element-selection.service';
import { DragStateService } from '../core/services/drag-state.service';
import { FormService } from '../core/services/form.service';
import { IconRegistryService } from '../core/services/icon-registry.service';

// Factories
import { PropertyEditorFactory } from '../core/factories/property-editor.factory';
import { ElementFactory } from '../core/factories/element-factory.service';

// API
import { FormConstructorService } from '../api/form-constructor.service';
import { FormConstructorConfig } from '../api/form-constructor-config';
import { FORM_CONSTRUCTOR_CONFIG } from '../api/injection-tokens';

/**
 * Core module that provides essential services and functionality
 * for the form constructor library.
 */
@NgModule({
  imports: [
    CommonModule,
    NzIconModule
  ]
})
export class CoreModule {
  /**
   * Import this module to get core services and functionality
   * @param config Configuration options for the form constructor
   * @returns ModuleWithProviders
   */
  static forRoot(config?: FormConstructorConfig): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        {
          provide: FORM_CONSTRUCTOR_CONFIG,
          useValue: config || {}
        },
        // Services
        ElementStateService,
        PropertyPanelService,
        ElementRegistryService,
        ElementSelectionService,
        DragStateService,
        FormService,
        IconRegistryService,
        
        // Factories
        PropertyEditorFactory,
        ElementFactory,
        
        // API
        FormConstructorService
      ]
    };
  }
}