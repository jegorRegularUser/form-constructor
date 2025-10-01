import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzResizableModule } from 'ng-zorro-antd/resizable';

import { FormBuilderComponent } from '../components/form-builder/form-builder.component';

// Form element components
import { InputComponent } from '../components/form-elements/input.component';
import { TextareaComponent } from '../components/form-elements/textarea.component';
import { ButtonElementComponent } from '../components/form-elements/button-element/button-element.component';
import { SelectElementComponent } from '../components/form-elements/select-element/select-element.component';

/**
 * Form Builder module that provides functionality
 * for building and managing forms.
 *
 * Note: This module is used to provide common dependencies for the FormBuilderComponent.
 * The actual form element components are imported directly where needed.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzMessageModule,
    NzToolTipModule,
    NzDropDownModule,
    NzMenuModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSwitchModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzSliderModule,
    NzRateModule,
    NzUploadModule,
    NzSpinModule,
    NzAlertModule,
    NzTagModule,
    NzBadgeModule,
    NzProgressModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzCardModule,
    NzListModule,
    NzTableModule,
    NzTabsModule,
    NzCollapseModule,
    NzCarouselModule,
    NzTimelineModule,
    NzTreeModule,
    NzTreeSelectModule,
    NzCascaderModule,
    NzTransferModule,
    NzInputNumberModule,
    NzPaginationModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzStepsModule,
    NzResultModule,
    NzStatisticModule,
    NzAvatarModule,
    NzDividerModule,
    NzSpaceModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzSegmentedModule,
    NzImageModule,
    NzDrawerModule,
    NzNotificationModule,
    NzEmptyModule,
    NzAffixModule,
    NzBackTopModule,
    NzAnchorModule,
    NzCommentModule,
    NzSkeletonModule,
    NzFloatButtonModule,
    NzResizableModule
  ]
})
export class FormBuilderModule { }