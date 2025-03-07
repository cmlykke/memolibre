import { FlashCardDeck } from '../../models/flashcarddeck';

export interface TagSearchSettings {
  tagRegex: string;
}

export class FlashCardDeckTagSettings {
  /**
   * Provides default tag search settings with an empty regex.
   */
  public static defaultSearchSettings(): Record<string, string> {
    return { tagRegex: '' };
  }

  /**
   * Normalizes tag search settings by merging with defaults and trimming the regex.
   */
  public static normalizeSearchSettings(settings: Record<string, string>): Record<string, string> {
    const defaults = this.defaultSearchSettings();
    return {
      tagRegex: typeof settings['tagRegex'] === 'string' ? settings['tagRegex'].trim() : defaults['tagRegex'],
    };
  }

  /**
   * Updates the tag search settings in the flashcard deck.
   */
  public static updateTagSearchSettings(deck: FlashCardDeck, newSettings: Record<string, string>): FlashCardDeck {
    const normalizedSettings = this.normalizeSearchSettings(newSettings);
    return {
      ...deck,
      settings: {
        ...deck.settings,
        "tag-search": normalizedSettings,
      },
    };
  }

  /**
   * Edits a tag's key and value, validates the new key, and updates card references.
   */
  public static editTag(deck: FlashCardDeck, oldKey: string, newKey: string, newValue: string): FlashCardDeck {
    // Clean and validate the new key
    const cleanedNewKey = newKey.replace(/\s+/g, '');
    if (!cleanedNewKey) {
      throw new Error('Tag key cannot be empty');
    }
    if (!/^[\x21-\x7E]+$/.test(cleanedNewKey)) {
      throw new Error('Tag key must contain only visible ASCII characters (excluding whitespace)');
    }
    if (cleanedNewKey !== oldKey && deck.tags.hasOwnProperty(cleanedNewKey)) {
      throw new Error('Tag key already exists');
    }

    // Update the tags object
    const updatedTags = { ...deck.tags };
    if (cleanedNewKey !== oldKey) {
      delete updatedTags[oldKey];
    }
    updatedTags[cleanedNewKey] = newValue;

    // Update all card tags
    const updatedCards = deck.cards.map(card => {
      const updatedCardTags = card.tags.map(tag => (tag === oldKey ? cleanedNewKey : tag));
      return { ...card, tags: updatedCardTags };
    });

    return {
      ...deck,
      tags: updatedTags,
      cards: updatedCards,
    };
  }
}
