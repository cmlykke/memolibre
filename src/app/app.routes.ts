import { Routes } from '@angular/router';
import {CreateDeckComponent} from './create-deck-component/create-deck-component.component';
import {LoadUserDataComponent} from './load-user-data/load-user-data.component';
import {PracticePageComponent} from './practice-page/practice-page.component';
import {AppSettingsComponent} from './app-settings/app-settings.component';
import {PracticeSettingsComponent} from './practice-settings/practice-settings.component';
import {SearchPageComponent} from './search-page/search-page.component';
import {TagPageComponent} from './tag-page/tag-page.component';
import {ManageCirculationPageComponent} from './manage-circulation-page/manage-circulation-page.component';

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
  path: 'practice-settings',
  component: PracticeSettingsComponent
}, {
  path: 'app-settings',
  component: AppSettingsComponent
}
];
