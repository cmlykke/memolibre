import { FlashCardDeck } from '../../models/flashcarddeck';

export interface PracticeSettings {
  frontSideFontSize: string;      // e.g., "16px"
  backSideFontSize: string;       // e.g., "16px"
  notableCardsFontSize: string;   // e.g., "14px"
  tagsFontSize: string;           // e.g., "14px"
  primaryInfoFontSize: string;    // e.g., "14px"
  secondaryInfoFontSize: string;  // e.g., "14px"
  cardNumberFontSize: string;     // e.g., "12px"
  cardNameFontSize: string;       // e.g., "12px"
  dateOfLastReviewFontSize: string; // e.g., "12px"
  repetitionValueFontSize: string;  // e.g., "12px"
  repetitionHistoryFontSize: string; // e.g., "12px"
}

export class FlashCardDeckPracticeSettings {
  /**
   * Default practice settings.
   */
  public static defaultSettings(): Record<string, string> {
    return {
      frontSideFontSize: "16px",
      backSideFontSize: "16px",
      notableCardsFontSize: "14px",
      tagsFontSize: "14px",
      primaryInfoFontSize: "14px",
      secondaryInfoFontSize: "14px",
      cardNumberFontSize: "12px",
      cardNameFontSize: "12px",
      dateOfLastReviewFontSize: "12px",
      repetitionValueFontSize: "12px",
      repetitionHistoryFontSize: "12px",
    };
  }

  /**
   * Validates and merges practice settings with defaults.
   */
  public static normalizeSettings(settings: Record<string, string>): Record<string, string> {
    const defaults = this.defaultSettings();
    const normalized: Record<string, string> = { ...defaults };

    const pixelRegex = /^\d+px$/; // Ensures value is a number followed by "px"
    for (const [key, value] of Object.entries(settings)) {
      if (key in defaults) {
        // Validate font size as a string ending in "px"
        normalized[key] = pixelRegex.test(value) ? value : defaults[key];
      }
    }
    return normalized;
  }

  /**
   * Updates practice settings in the deck.
   */
  public static updatePracticeSettings(deck: FlashCardDeck, newSettings: Record<string, string>): FlashCardDeck {
    const normalizedSettings = this.normalizeSettings(newSettings);
    return {
      ...deck,
      settings: {
        ...deck.settings,
        "practice-settings": normalizedSettings,
      },
    };
  }
}
