import { FlashCardDeck } from '../../models/flashcarddeck';

export interface SearchSettings {
  cardNumberSearch: string;
  frontSideRegex: string;
  backSideRegex: string;
  tagsRegex: string;
}

export class FlashCardDeckSearchSettings {
  /**
   * Provides default search settings with empty strings.
   */
  public static defaultSettings(): Record<string, string> {
    return {
      cardNumberSearch: '',
      frontSideRegex: '',
      backSideRegex: '',
      tagsRegex: '',
    };
  }

  /**
   * Normalizes search settings by merging with defaults and ensuring values are strings.
   */
  public static normalizeSettings(settings: Record<string, string>): Record<string, string> {
    const defaults = this.defaultSettings();
    const normalized: Record<string, string> = { ...defaults };

    for (const [key, value] of Object.entries(settings)) {
      if (key in defaults) {
        normalized[key] = typeof value === 'string' ? value.trim() : defaults[key];
      }
    }
    return normalized;
  }

  /**
   * Updates the search settings in the flashcard deck.
   */
  public static updateSearchSettings(deck: FlashCardDeck, newSettings: Record<string, string>): FlashCardDeck {
    const normalizedSettings = this.normalizeSettings(newSettings);
    return {
      ...deck,
      settings: {
        ...deck.settings,
        "search": normalizedSettings,
      },
    };
  }
}
