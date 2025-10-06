import { Pipe, PipeTransform } from '@angular/core';
import { DataSet } from '../../core/services/data-sets.service';

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(dataSets: DataSet[], type: string): DataSet[] {
    if (!dataSets || !type) return dataSets;
    return dataSets.filter(set => set.type === type);
  }
}