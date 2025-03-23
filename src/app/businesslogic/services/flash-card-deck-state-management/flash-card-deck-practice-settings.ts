import { FlashCardDeck } from '../../models/flashcarddeck';

export interface ModalData {
  title: string;
  fields: { label: string; value: string }[];
}

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
  tagValueFontSize: string;       // e.g., "16px" <- New setting
  // New toggle settings for label visibility
  showFrontSideLabel: string;     // "true" or "false"
  showBackSideLabel: string;      // "true" or "false"
  showCardNumberLabel: string;    // "true" or "false"
  showCardNameLabel: string;      // "true" or "false"
  showNotableCardsLabel: string;  // "true" or "false"
  showTagsLabel: string;          // "true" or "false"
  showDateOfLastReviewLabel: string; // "true" or "false"
  showRepetitionValueLabel: string;  // "true" or "false"
  showRepetitionHistoryLabel: string; // "true" or "false"
  showPrimaryInfoLabel: string;   // "true" or "false"
  showSecondaryInfoLabel: string; // "true" or "false"
  // New font family settings
  frontSideFontFamily: string;    // e.g., "Arial"
  backSideFontFamily: string;     // e.g., "Arial"
  // New setting for tag interaction lock
  tagInteractionLocked: string;   // "true" or "false"
}

export class FlashCardDeckPracticeSettings {
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
      tagValueFontSize: "16px",     // New default value
      showFrontSideLabel: "true",
      showBackSideLabel: "true",
      showCardNumberLabel: "true",
      showCardNameLabel: "true",
      showNotableCardsLabel: "true",
      showTagsLabel: "true",
      showDateOfLastReviewLabel: "true",
      showRepetitionValueLabel: "true",
      showRepetitionHistoryLabel: "true",
      showPrimaryInfoLabel: "true",
      showSecondaryInfoLabel: "true",
      frontSideFontFamily: "Arial",
      backSideFontFamily: "Arial",
      tagInteractionLocked: "false",
      minCardsBeforeRepeat: "0", // Default: no restriction
    };
  }

  /**
   * Validates and merges practice settings with defaults.
   */
  public static normalizeSettings(settings: Record<string, string>): Record<string, string> {
    const defaults = this.defaultSettings();
    const normalized: Record<string, string> = { ...defaults };

    const pixelRegex = /^\d+px$/;
    const booleanRegex = /^(true|false)$/;

    for (const [key, value] of Object.entries(settings)) {
      if (key in defaults) {
        if (key.endsWith('FontSize')) {
          normalized[key] = pixelRegex.test(value) ? value : defaults[key];
        } else if (key.startsWith('show') && key.endsWith('Label')) {
          normalized[key] = booleanRegex.test(value) ? value : defaults[key];
        } else if (key.endsWith('FontFamily')) {
          normalized[key] = value && typeof value === 'string' ? value : defaults[key];
        } else if (key === 'tagInteractionLocked') {
          normalized[key] = booleanRegex.test(value) ? value : defaults[key];
        } else if (key === 'minCardsBeforeRepeat') {
          const num = parseInt(value, 10);
          normalized[key] = (!isNaN(num) && num >= 0) ? num.toString() : defaults[key];
        }
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
