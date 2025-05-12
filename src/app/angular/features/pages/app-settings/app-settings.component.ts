import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalStateService } from '../../../shared/services/global-state-service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import {TooltipKey} from '../../../shared/services/tooltip.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.css'],
})
export class AppSettingsComponent implements OnInit {
  settings: Record<string, string> = {};
  resultMessage: string = '';
  private subscription: Subscription = new Subscription();
  showTooltips: boolean = true;

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.settings = { ...this.globalStateService.getState().appSettings };

    // Subscribe to the global state to update showTooltips
    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        this.showTooltips = state.appSettings['showTooltips'] === 'true';
      })
    );
  }

  saveSettings(): void {
    const result = this.globalStateService.updateAppSettings(this.settings);
    this.resultMessage = result.ok ? result.value : result.error;
  }

  updateTooltipSetting(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settings['showTooltips'] = input.checked ? 'true' : 'false';
  }

  protected readonly TooltipKey = TooltipKey;
}
