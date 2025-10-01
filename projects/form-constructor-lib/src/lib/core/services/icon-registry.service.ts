import { Injectable } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';

// Import all icons used in the application
import {
  DeleteOutline,
  CopyOutline,
  CheckCircleOutline,
  CheckCircleFill,
  RightOutline,
  LeftOutline,
  DownOutline,
  InfoCircleOutline,
  PlusOutline,
  UndoOutline,
  ExclamationCircleFill,
  UpOutline,
  FormOutline,
  AppstoreOutline,
  SettingOutline,
  ToolOutline,
  EditOutline,
  CheckOutline,
  PlusSquareOutline
} from '@ant-design/icons-angular/icons';

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {
  constructor(private iconService: NzIconService) {}

  /**
   * Register all icons used in the application
   */
  registerIcons(): void {
    // Register outline icons
    this.iconService.addIcon(
      DeleteOutline,
      CopyOutline,
      CheckCircleOutline,
      RightOutline,
      LeftOutline,
      DownOutline,
      InfoCircleOutline,
      PlusOutline,
      UndoOutline,
      UpOutline,
      FormOutline,
      AppstoreOutline,
      SettingOutline,
      ToolOutline,
      EditOutline,
      CheckOutline,
      PlusSquareOutline
    );

    // Register fill icons
    this.iconService.addIcon(
      CheckCircleFill,
      ExclamationCircleFill
    );
  }

  /**
   * Get all registered icon names
   */
  getRegisteredIconNames(): string[] {
    return [
      'delete',
      'copy',
      'check-circle',
      'right',
      'left',
      'down',
      'info-circle',
      'plus',
      'undo',
      'exclamation-circle',
      'up',
      'form',
      'appstore',  // Replaces 'grid_view'
      'setting',   // Replaces 'widgets'
      'tool',      // Replaces 'extension'
      'edit',
      'check',
      'plus-square'
    ];
  }
}