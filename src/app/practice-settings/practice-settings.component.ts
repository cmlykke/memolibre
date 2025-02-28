import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added for checkboxes
import { MatSelectModule } from '@angular/material/select';     // Added for dropdowns
import { GlobalStateService } from '../angular/shared/services/global-state-service';

@Component({
  selector: 'app-practice-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule, // Added
    MatSelectModule    // Added
  ],
  templateUrl: './practice-settings.component.html',
  styleUrls: ['./practice-settings.component.css'],
})
export class PracticeSettingsComponent implements OnInit {
  settings: Record<string, string> = {};
  displaySettings: Record<string, number> = {};
  toggleSettings: Record<string, boolean> = {}; // For checkbox states
  fontFamilySettings: Record<string, string> = {}; // For font family selections
  resultMessage: string = '';

  // Define font options for dropdowns
  fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Noto Sans', label: 'Noto Sans' },
    { value: 'Noto Sans SC', label: 'Noto Sans SC (Simplified Chinese)' },
    { value: 'Noto Sans TC', label: 'Noto Sans TC (Traditional Chinese)' }
  ];

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.settings = { ...this.globalStateService.getState().practiceSettings };
    this.initializeDisplaySettings();
    this.initializeToggleSettings();
    this.initializeFontFamilySettings();
  }

  private initializeDisplaySettings(): void {
    const defaultFontSize = 16;
    Object.entries(this.settings).forEach(([key, value]) => {
      if (key.endsWith('FontSize')) {
        this.displaySettings[key] = parseInt(value, 10) || defaultFontSize;
      }
    });
  }

  private initializeToggleSettings(): void {
    const toggleKeys = [
      'showFrontSideLabel', 'showBackSideLabel', 'showCardNumberLabel',
      'showCardNameLabel', 'showNotableCardsLabel', 'showTagsLabel',
      'showDateOfLastReviewLabel', 'showRepetitionValueLabel',
      'showRepetitionHistoryLabel', 'showPrimaryInfoLabel', 'showSecondaryInfoLabel'
    ];
    toggleKeys.forEach(key => {
      this.toggleSettings[key] = this.settings[key] === 'true'; // Default to false if not set
    });
  }

  private initializeFontFamilySettings(): void {
    this.fontFamilySettings['frontSideFontFamily'] = this.settings['frontSideFontFamily'] || 'Arial';
    this.fontFamilySettings['backSideFontFamily'] = this.settings['backSideFontFamily'] || 'Arial';
  }

  saveSettings(): void {
    const updatedSettings: Record<string, string> = {};
    // Save font sizes
    Object.entries(this.displaySettings).forEach(([key, value]) => {
      updatedSettings[key] = `${value}px`;
    });
    // Save toggle settings
    Object.entries(this.toggleSettings).forEach(([key, value]) => {
      updatedSettings[key] = value.toString();
    });
    // Save font family settings
    Object.entries(this.fontFamilySettings).forEach(([key, value]) => {
      updatedSettings[key] = value;
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
