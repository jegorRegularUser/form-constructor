import { Routes } from '@angular/router';
import { TestLayoutComponent } from './form-constructor/test-components/test-layout.component';
import { MainLayoutComponent } from './form-constructor/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent
  },
  {
    path: 'test',
    component: TestLayoutComponent
  }
];
