import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DataSetsService, DataSet, OptionItem } from '../../../../core/services/data-sets.service';
import { FilterByTypePipe } from '../../../../shared/pipes/filter-by-type.pipe';

@Component({
  selector: 'app-data-sets-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzCardModule,
    NzTabsModule,
    NzTagModule,
    FilterByTypePipe
  ],
  templateUrl: './data-sets-manager.component.html',
  styleUrls: ['./data-sets-manager.component.scss']
})
export class DataSetsManagerComponent implements OnInit {
  dataSets: DataSet[] = [];
  isModalVisible = false;
  editingDataSet: DataSet | null = null;
  activeTab = 0;
  newDataSet: Partial<DataSet> = {
    name: '',
    type: 'options',
    description: '',
    data: []
  };

  newItem: any = {};

  constructor(
    private dataSetsService: DataSetsService,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.dataSetsService.dataSets$.subscribe(sets => {
      this.dataSets = sets;
    });
  }

  openCreateModal(): void {
    this.editingDataSet = null;
    this.newDataSet = {
      name: '',
      type: 'options',
      description: '',
      data: []
    };
    this.isModalVisible = true;
  }

  openEditModal(dataSet: DataSet): void {
    this.editingDataSet = { ...dataSet };
    this.newDataSet = { ...dataSet };
    this.isModalVisible = true;
  }

  saveDataSet(): void {
    if (!this.newDataSet.name?.trim()) {
      this.message.error('Name is required');
      return;
    }

    if (this.editingDataSet) {
      this.dataSetsService.updateDataSet(this.editingDataSet.id, this.newDataSet);
      this.message.success('Data set updated successfully');
    } else {
      this.dataSetsService.addDataSet(this.newDataSet as any);
      this.message.success('Data set created successfully');
    }

    this.isModalVisible = false;
  }

  deleteDataSet(dataSet: DataSet): void {
    this.modalService.confirm({
      nzTitle: 'Delete Data Set',
      nzContent: `Are you sure you want to delete "${dataSet.name}"?`,
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.dataSetsService.deleteDataSet(dataSet.id);
        this.message.success('Data set deleted successfully');
      },
      nzCancelText: 'No'
    });
  }

  addItemToDataSet(dataSet: DataSet): void {
    if (!this.validateItem(this.newItem, dataSet.type)) return;

    const item = { ...this.newItem };
    this.dataSetsService.addItemToDataSet(dataSet.id, item);
    this.newItem = {};
    this.message.success('Item added successfully');
  }

  removeItemFromDataSet(dataSet: DataSet, index: number): void {
    this.dataSetsService.removeItemFromDataSet(dataSet.id, index);
    this.message.success('Item removed successfully');
  }

  addItemToCurrentDataSet(): void {
    const currentDataSet = this.editingDataSet || (this.newDataSet as DataSet);
    if (currentDataSet && currentDataSet.type) {
      if (!this.validateItem(this.newItem, currentDataSet.type)) return;
      
      if (this.editingDataSet) {
        this.dataSetsService.addItemToDataSet(this.editingDataSet.id, { ...this.newItem });
      } else {
        this.newDataSet.data = [...(this.newDataSet.data || []), { ...this.newItem }];
      }
      
      this.newItem = {};
      this.message.success('Item added successfully');
    }
  }

  removeItemFromCurrentDataSet(index: number): void {
    if (this.editingDataSet) {
      this.dataSetsService.removeItemFromDataSet(this.editingDataSet.id, index);
    } else {
      const data = this.newDataSet.data || [];
      data.splice(index, 1);
      this.newDataSet.data = [...data];
    }
    this.message.success('Item removed successfully');
  }

  private validateItem(item: any, type: DataSet['type']): boolean {
    if (type === 'options') {
      if (!item.label || item.value === undefined) {
        this.message.error('Label and Value are required for options');
        return false;
      }
    }
    return true;
  }

  getItemFields(type: DataSet['type']): string[] {
    switch (type) {
      case 'options':
        return ['label', 'value', 'disabled'];
      default:
        return ['name', 'value'];
    }
  }

  trackByFn(index: number, item: any): any {
    return item.value || index;
  }
}