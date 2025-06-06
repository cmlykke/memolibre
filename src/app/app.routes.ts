import { Routes } from '@angular/router';
import {CreateDeckComponent} from './angular/features/pages/create-deck-component/create-deck-component.component';
import {LoadUserDataComponent} from './angular/features/pages/load-user-data/load-user-data.component';
import {PracticePageComponent} from './angular/features/pages/practice-page/practice-page.component';
import {AppSettingsComponent} from './angular/features/pages/app-settings/app-settings.component';
import {PracticeSettingsComponent} from './angular/features/pages/practice-settings/practice-settings.component';
import {SearchPageComponent} from './angular/features/pages/search-page/search-page.component';
import {TagPageComponent} from './angular/features/pages/tag-page/tag-page.component';
import {ManageCirculationPageComponent} from './angular/features/pages/manage-circulation-page/manage-circulation-page.component';
import {AddRemoveCardPageComponent} from './angular/features/pages/add-remove-card-page/add-remove-card-page.component';

export const routes: Routes = [{
  path: '',
  redirectTo: '/load-user-data',
  pathMatch: 'full'
}, {
  path: 'load-user-data',
  component: LoadUserDataComponent // Example: Set 'home' to show LoadUserDataComponent
}, {
  path: 'practice-page',
  component: PracticePageComponent
}, {
  path: 'search-page',
  component: SearchPageComponent
}, {
  path: 'tag-page',
  component: TagPageComponent
}, {
  path: 'manage-circulation-page',
  component: ManageCirculationPageComponent
}, {
  path: 'create-deck',
  component: CreateDeckComponent
}, {
  path: 'add-remove-card',
  component: AddRemoveCardPageComponent
}, {
  path: 'practice-settings',
  component: PracticeSettingsComponent
}, {
  path: 'app-settings',
  component: AppSettingsComponent
}
];
