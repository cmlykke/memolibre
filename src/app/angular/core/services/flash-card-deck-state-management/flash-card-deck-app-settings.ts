import { FlashCardDeck } from '../../../core/services/models/flashcarddeck';

export interface AppSettings {
  showTooltips: string; // "true" or "false"
  autoSave: string; // "true" or "false"
}

export class FlashCardDeckAppSettings {
  /**
   * Default app settings.
   */
  public static defaultSettings(): Record<string, string> {
    return {
      showTooltips: "true",
      autoSave: "false",
    };
  }

  /**
   * Validates and merges app settings with defaults.
   */
  public static normalizeSettings(settings: Record<string, string>): Record<string, string> {
    const defaults = this.defaultSettings();
    const normalized: Record<string, string> = { ...defaults };

    for (const [key, value] of Object.entries(settings)) {
      if (key in defaults) {
        // Validate boolean as string
        normalized[key] = value === "true" || value === "false" ? value : defaults[key];
      }
    }
    return normalized;
  }

  /**
   * Updates app settings in the deck.
   */
  public static updateAppSettings(deck: FlashCardDeck, newSettings: Record<string, string>): FlashCardDeck {
    const normalizedSettings = this.normalizeSettings(newSettings);
    return {
      ...deck,
      settings: {
        ...deck.settings,
        "app-settings": normalizedSettings,
      },
    };
  }
}
