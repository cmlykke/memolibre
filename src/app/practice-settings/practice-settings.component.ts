import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GlobalStateService } from '../angular/shared/services/global-state-service';

@Component({
  selector: 'app-practice-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './practice-settings.component.html',
  styleUrls: ['./practice-settings.component.css'],
})
export class PracticeSettingsComponent implements OnInit {
  settings: Record<string, string> = {};
  displaySettings: Record<string, number> = {};
  resultMessage: string = '';

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.settings = { ...this.globalStateService.getState().practiceSettings };
    this.initializeDisplaySettings();
  }

  private initializeDisplaySettings(): void {
    const defaultFontSize = 16;
    Object.entries(this.settings).forEach(([key, value]) => {
      this.displaySettings[key] = parseInt(value, 10) || defaultFontSize;
    });
  }

  saveSettings(): void {
    const updatedSettings: Record<string, string> = {};
    Object.entries(this.displaySettings).forEach(([key, value]) => {
      updatedSettings[key] = `${value}px`;
    });
    const result = this.globalStateService.updatePracticeSettings(updatedSettings);
    this.resultMessage = result.ok ? result.value : result.error;
    if (result.ok) {
      this.settings = updatedSettings;
    }
  }

  updateFontSize(key: string, value: number): void {
    this.displaySettings[key] = value;
  }
}
