import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalStateService } from '../angular/shared/services/global-state-service';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.css'],
})
export class AppSettingsComponent implements OnInit {
  settings: Record<string, string> = {};
  resultMessage: string = '';

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.settings = { ...this.globalStateService.getState().appSettings };
  }

  saveSettings(): void {
    const result = this.globalStateService.updateAppSettings(this.settings);
    this.resultMessage = result.ok ? result.value : result.error;
  }

  updateTooltipSetting(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settings['showTooltips'] = input.checked ? 'true' : 'false';
  }
}
