import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DataSet {
  id: string;
  name: string;
  description?: string;
  type: 'options' | 'icons' | 'images' | 'custom';
  data: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionItem {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataSetsService {
  private dataSetsSubject = new BehaviorSubject<DataSet[]>(this.getInitialDataSets());
  public dataSets$ = this.dataSetsSubject.asObservable();

  getDataSets(): DataSet[] {
    return this.dataSetsSubject.value;
  }

  getDataSet(id: string): DataSet | undefined {
    return this.dataSetsSubject.value.find(set => set.id === id);
  }

  getDataSetsByType(type: DataSet['type']): DataSet[] {
    return this.dataSetsSubject.value.filter(set => set.type === type);
  }

  addDataSet(dataSet: Omit<DataSet, 'id' | 'createdAt' | 'updatedAt'>): string {
    const newDataSet: DataSet = {
      ...dataSet,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentDataSets = this.dataSetsSubject.value;
    this.dataSetsSubject.next([...currentDataSets, newDataSet]);
    this.saveToStorage();
    
    return newDataSet.id;
  }

  updateDataSet(id: string, updates: Partial<DataSet>): void {
    const currentDataSets = this.dataSetsSubject.value;
    const index = currentDataSets.findIndex(set => set.id === id);
    
    if (index !== -1) {
      const updatedDataSet = {
        ...currentDataSets[index],
        ...updates,
        updatedAt: new Date()
      };
      
      const newDataSets = [...currentDataSets];
      newDataSets[index] = updatedDataSet;
      this.dataSetsSubject.next(newDataSets);
      this.saveToStorage();
    }
  }

  deleteDataSet(id: string): void {
    const currentDataSets = this.dataSetsSubject.value;
    const filteredDataSets = currentDataSets.filter(set => set.id !== id);
    this.dataSetsSubject.next(filteredDataSets);
    this.saveToStorage();
  }

  addItemToDataSet(dataSetId: string, item: any): void {
    const dataSet = this.getDataSet(dataSetId);
    if (dataSet) {
      const updatedData = [...dataSet.data, item];
      this.updateDataSet(dataSetId, { data: updatedData });
    }
  }

  removeItemFromDataSet(dataSetId: string, itemIndex: number): void {
    const dataSet = this.getDataSet(dataSetId);
    if (dataSet) {
      const updatedData = dataSet.data.filter((_, index) => index !== itemIndex);
      this.updateDataSet(dataSetId, { data: updatedData });
    }
  }

  private getInitialDataSets(): DataSet[] {
    const storedData = localStorage.getItem('form-builder-data-sets');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch {
        return this.getDefaultDataSets();
      }
    }
    return this.getDefaultDataSets();
  }

  private getDefaultDataSets(): DataSet[] {
    return [
      {
        id: 'common-options',
        name: 'Common Options',
        type: 'options',
        data: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
          { label: 'Maybe', value: 'maybe' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'countries',
        name: 'Countries',
        type: 'options',
        data: [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Australia', value: 'AU' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private generateId(): string {
    return `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    localStorage.setItem('form-builder-data-sets', JSON.stringify(this.dataSetsSubject.value));
  }
}