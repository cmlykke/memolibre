import { Routes } from '@angular/router';
import {CreateDeckComponent} from './create-deck-component/create-deck-component.component';
import {LoadUserDataComponent} from './load-user-data/load-user-data.component';

export const routes: Routes = [{
  path: '',
  redirectTo: '/load-user-data',
  pathMatch: 'full'
}, {
  path: 'load-user-data',
  component: LoadUserDataComponent // Example: Set 'home' to show LoadUserDataComponent
}, {
  path: 'create-deck',
  component: CreateDeckComponent
}
];
