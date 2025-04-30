import { FlashCardDeck } from '../../../businesslogic/models/flashcarddeck';
import { FlashCard } from '../../../businesslogic/models/flashcard';

export function increaseCirculation(deck: FlashCardDeck, n: number | null, cardNumbers?: number[]): FlashCardDeck {
  const cards = [...deck.cards];
  if (cardNumbers && cardNumbers.length > 0) {
    // Increase repetition value from 0 to 1 for specified cards with repetitionValue === 0
    cards.forEach(card => {
      if (cardNumbers.includes(card.cardNumber) && card.repetitionValue === 0) {
        card.repetitionValue = 1;
      }
    });
  } else if (n === null) {
    // Increase repetition value by 1 for all cards in circulation
    cards.forEach(card => {
      if (card.repetitionValue > 0) {
        card.repetitionValue += 1;
      }
    });
  } else {
    // Increase repetition value from 0 to 1 for the N dormant cards with lowest card numbers
    const dormantCards = cards
      .filter(card => card.repetitionValue === 0)
      .sort((a, b) => a.cardNumber - b.cardNumber);
    const toIncrease = dormantCards.slice(0, Math.min(n, dormantCards.length));
    toIncrease.forEach(card => {
      card.repetitionValue = 1;
    });
  }
  return { ...deck, cards };
}

export function decreaseCirculation(deck: FlashCardDeck, n: number | null, cardNumbers?: number[]): FlashCardDeck {
  const cards = [...deck.cards];
  if (cardNumbers && cardNumbers.length > 0) {
    // Decrease repetition value to 0 for specified cards with repetitionValue > 0
    cards.forEach(card => {
      if (cardNumbers.includes(card.cardNumber) && card.repetitionValue > 0) {
        card.repetitionValue = 0;
      }
    });
  } else if (n === null) {
    // Decrease repetition value by 1 for all cards in circulation, but not below 1
    cards.forEach(card => {
      if (card.repetitionValue > 1) {
        card.repetitionValue -= 1;
      }
    });
  } else {
    // Decrease repetition value to 0 for the N cards in circulation with highest card numbers
    const inCirculation = cards
      .filter(card => card.repetitionValue > 0)
      .sort((a, b) => b.cardNumber - a.cardNumber);
    const toDecrease = inCirculation.slice(0, Math.min(n, inCirculation.length));
    toDecrease.forEach(card => {
      card.repetitionValue = 0;
    });
  }
  return { ...deck, cards };
}
