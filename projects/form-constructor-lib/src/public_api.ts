/*
 * Public API Surface of form-constructor-lib
 */

// Core Models
export * from './lib/models/element-properties.model';
export * from './lib/models/form-properties.model';
export * from './lib/models/form-state.model';

// Core Enums - Only export the enum itself, not the types that are already defined in models
export { 
  PropertyType, 
  DimensionUnit, 
  FontWeightOption, 
  BorderStyleOption, 
  AlignmentOption, 
  LayoutOption, 
  ConditionOperator, 
  LogicalOperator, 
  PROPERTY_EDITOR_COMPONENTS, 
  DEFAULT_PROPERTY_CONFIG 
} from './lib/core/enums/property-type.enum';

// API
export * from './lib/api/form-constructor-config';
export * from './lib/api/form-constructor.service';
export * from './lib/api/injection-tokens';
export * from './lib/api/events/form-events';
export * from './lib/api/events/element-events';
export * from './lib/api/events/property-events';

// Core Configs
export * from './lib/core/configs/property-configs';
export * from './lib/core/configs/element-property-definitions';

// Modules
export * from './lib/modules/form-constructor.module';
export * from './lib/modules/form-builder.module';
export * from './lib/modules/components.module';
export * from './lib/modules/core.module';