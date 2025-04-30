import { FlashCardDeck } from '../models/flashcarddeck';
import { FlashCard } from '../models/flashcard';
import { Result } from '../models/result';

export class FlashCardDeckAddRemoveCard {
  // Remove cards based on a range (e.g., "239-435") or comma-separated list (e.g., "234,345,456")
  public static removeCards(deck: FlashCardDeck, cardInput: string): Result<FlashCardDeck, string> {
    try {
      const cardNumbersToRemove = this.parseCardInput(cardInput);
      if (cardNumbersToRemove.length === 0) {
        return { ok: false, error: 'No valid card numbers provided' };
      }

      // Filter out the cards to remove
      let updatedCards = deck.cards.filter(card => !cardNumbersToRemove.includes(card.cardNumber));

      // Renumber the remaining cards sequentially starting from 1
      updatedCards = this.renumberCards(updatedCards);

      // Update notableCards references across all cards
      updatedCards = this.updateNotableCardsReferences(updatedCards);

      const updatedDeck = { ...deck, cards: updatedCards };
      return { ok: true, value: updatedDeck };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { ok: false, error: `Error removing cards: ${errorMessage}` };
    }
  }

  // Add a new card at a specified card number, shifting existing cards as needed
  public static addCard(deck: FlashCardDeck, newCard: FlashCard): Result<FlashCardDeck, string> {
    try {
      // Check if frontSide is unique and non-empty
      const trimmedFrontSide = newCard.frontSide.trim();
      if (!trimmedFrontSide || deck.cards.some(card => card.frontSide.trim() === trimmedFrontSide && card.cardNumber !== newCard.cardNumber)) {
        return { ok: false, error: 'Front side must be unique and non-empty' };
      }

      // Insert the new card and shift existing cards
      let updatedCards = [...deck.cards];
      const insertIndex = updatedCards.findIndex(card => card.cardNumber >= newCard.cardNumber);
      if (insertIndex === -1) {
        updatedCards.push(newCard); // Add to the end if cardNumber is higher than all existing
      } else {
        updatedCards.splice(insertIndex, 0, newCard); // Insert at the correct position
      }

      // Renumber all cards sequentially
      updatedCards = this.renumberCards(updatedCards);

      // Update notableCards references
      updatedCards = this.updateNotableCardsReferences(updatedCards);

      const updatedDeck = { ...deck, cards: updatedCards };
      return { ok: true, value: updatedDeck };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { ok: false, error: `Error adding card: ${errorMessage}` };
    }
  }

  // Parse card input (range or comma-separated list)
  private static parseCardInput(input: string): number[] {
    const numbers: number[] = [];
    const parts = input.split(',').map(part => part.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            numbers.push(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          numbers.push(num);
        }
      }
    }
    return [...new Set(numbers)]; // Remove duplicates
  }

  // Renumber cards sequentially starting from 1
  private static renumberCards(cards: FlashCard[]): FlashCard[] {
    return cards.map((card, index) => ({
      ...card,
      cardNumber: index + 1,
    }));
  }

  // Update notableCards references after renumbering
  private static updateNotableCardsReferences(cards: FlashCard[]): FlashCard[] {
    const cardNumberMap = new Map<number, number>();
    cards.forEach((card, index) => {
      cardNumberMap.set(card.cardNumber, index + 1);
    });

    return cards.map(card => {
      const updatedNotableCards = card.notableCards.map(oldNum => {
        return cardNumberMap.get(oldNum) || oldNum; // Keep old number if not found (shouldn't happen after renumbering)
      });
      return { ...card, notableCards: updatedNotableCards };
    });
  }

  // Get the highest card number in the deck
  public static getHighestCardNumber(deck: FlashCardDeck): number {
    if (!deck.cards.length) return 0;
    return Math.max(...deck.cards.map(card => card.cardNumber));
  }
}
