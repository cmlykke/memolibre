import { FlashCardDeck} from '../../models/flashcarddeck';
import {FlashCard} from "../../models/flashcard";

export class FlashCardDeckPracticeUpdate {
  /**
   * Marks a card as known by incrementing its repetitionValue and updating repetitionHistory.
   * @param deck The current flashcard deck.
   * @param cardNumber The card number to update.
   * @returns The updated deck.
   * @throws Error if the card is not found.
   */
  public static markCardAsKnown(deck: FlashCardDeck, cardNumber: number): FlashCardDeck {
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: card.repetitionValue + 1,
      repetitionHistory: [1, ...card.repetitionHistory].slice(0, 20)
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    return { ...deck, cards: updatedCards };
  }

  /**
   * Marks a card as forgotten by decrementing its repetitionValue and updating repetitionHistory.
   * @param deck The current flashcard deck.
   * @param cardNumber The card number to update.
   * @returns The updated deck.
   * @throws Error if the card is not found.
   */
  public static markCardAsForgotten(deck: FlashCardDeck, cardNumber: number): FlashCardDeck {
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: Math.max(1, card.repetitionValue - 1),
      repetitionHistory: [0, ...card.repetitionHistory].slice(0, 20)
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    return { ...deck, cards: updatedCards };
  }
}
