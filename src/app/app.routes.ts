import { Routes } from '@angular/router';
import {CreateDeckComponent} from '../app/angular/features/create-deck-component/create-deck-component.component';
import {LoadUserDataComponent} from '../app/angular/features/load-user-data/load-user-data.component';
import {PracticePageComponent} from '../app/angular/features/practice-page/practice-page.component';
import {AppSettingsComponent} from '../app/angular/features/app-settings/app-settings.component';
import {PracticeSettingsComponent} from '../app/angular/features/practice-settings/practice-settings.component';
import {SearchPageComponent} from '../app/angular/features/search-page/search-page.component';
import {TagPageComponent} from '../app/angular/features/tag-page/tag-page.component';
import {ManageCirculationPageComponent} from '../app/angular/features/manage-circulation-page/manage-circulation-page.component';
import {AddRemoveCardPageComponent} from '../app/angular/features/add-remove-card-page/add-remove-card-page.component';

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
