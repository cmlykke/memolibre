import { FlashCardDeck } from '../../../core/services/models/flashcarddeck';
import { FlashCard } from '../../../core/services/models/flashcard';

export class FlashCardDeckPracticeUpdate {
  public static markCardAsKnown(deck: FlashCardDeck, cardNumber: number): FlashCardDeck {
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: card.repetitionValue + 1,
      repetitionHistory: [1, ...card.repetitionHistory].slice(0, 20),
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    return { ...deck, cards: updatedCards };
  }

  public static markCardAsForgotten(deck: FlashCardDeck, cardNumber: number): FlashCardDeck {
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: Math.max(1, card.repetitionValue - 1),
      repetitionHistory: [0, ...card.repetitionHistory].slice(0, 20),
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    return { ...deck, cards: updatedCards };
  }

  public static performPracticeAction(deck: FlashCardDeck, cardNumber: number, action: 'known' | 'forgotten'): FlashCardDeck {
    let updatedDeck = action === 'known' ? this.markCardAsKnown(deck, cardNumber) : this.markCardAsForgotten(deck, cardNumber);
    const practiceHistory = updatedDeck.settings["practiceHistory"] || { undoStack: '', redoStack: '' };
    const undoStack = practiceHistory['undoStack'] ? practiceHistory['undoStack'].split('|') : [];
    undoStack.push(`${cardNumber}:${action}`);
    if (undoStack.length > 100) {
      undoStack.shift(); // Remove oldest action
    }
    const newPracticeHistory: Record<string, string> = {
      undoStack: undoStack.join('|'),
      redoStack: '', // Clear redo stack on new action
    };
    return {
      ...updatedDeck,
      settings: { ...updatedDeck.settings, practiceHistory: newPracticeHistory },
    };
  }

  public static undoLastAction(deck: FlashCardDeck, positiveCount: number):
      { updatedDeck: FlashCardDeck; revertedCard: FlashCard | null; undoCount: number; updatedPreviusCard: FlashCard | null} {
    const practiceHistory = deck.settings["practiceHistory"] || { undoStack: '', redoStack: '' };
    const undoStack = practiceHistory['undoStack'] ? practiceHistory['undoStack'].split('|') : [];
    if (undoStack.length === 0) {
      return { updatedDeck: deck, revertedCard: null, undoCount: positiveCount, updatedPreviusCard: null };
    }
    const lastAction = undoStack.pop()!;
    const [cardNumberStr, actionType] = lastAction.split(':');
    const cardNumber = parseInt(cardNumberStr, 10);
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const repetitionValue = actionType === 'known' ? card.repetitionValue - 1 : card.repetitionValue + 1
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: repetitionValue,
      repetitionHistory: card.repetitionHistory.slice(1), // Remove the first element (front)
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    const redoStack = practiceHistory['redoStack'] ? practiceHistory['redoStack'].split('|') : [];
    redoStack.push(lastAction);
    const newPracticeHistory: Record<string, string> = {
      undoStack: undoStack.join('|'),
      redoStack: redoStack.join('|'),
    };
    const updatedDeck = {
      ...deck,
      cards: updatedCards,
      settings: { ...deck.settings, practiceHistory: newPracticeHistory },
    };
    const undoCount = actionType === 'known' ? positiveCount - 1 : positiveCount + 1


    if (undoStack.length === 0) {
      return { updatedDeck: updatedDeck, revertedCard: updatedCard, undoCount: undoCount, updatedPreviusCard: null };
    }
    // update previus card
    const updatedPreviusCardString: string = undoStack.at(-1) ?? "";
    const [cardNumberStrTEMP, actionTypeTEMP] = updatedPreviusCardString.split(':');
    const cardNumberTEMP = parseInt(cardNumberStrTEMP, 10);
    const cardTEMP = deck.cards.find(c => c.cardNumber === cardNumberTEMP);
    if (!cardTEMP) {
      throw new Error(`Card with number ${cardNumberTEMP} not found`);
    }
    return { updatedDeck, revertedCard: updatedCard, undoCount: undoCount, updatedPreviusCard: cardTEMP };
  }

  public static redoLastAction(deck: FlashCardDeck, positiveCount: number):
      { updatedDeck: FlashCardDeck; appliedCard: FlashCard | null; redoCount: number; updatedPreviusCard: FlashCard | null } {
    const practiceHistory = deck.settings["practiceHistory"] || { undoStack: '', redoStack: '' };
    const redoStack = practiceHistory['redoStack'] ? practiceHistory['redoStack'].split('|') : [];
    if (redoStack.length === 0) {
      return { updatedDeck: deck, appliedCard: null, redoCount: positiveCount, updatedPreviusCard: null };
    }
    const nextAction = redoStack.pop()!;
    const [cardNumberStr, actionType] = nextAction.split(':');
    const cardNumber = parseInt(cardNumberStr, 10);
    const card = deck.cards.find(c => c.cardNumber === cardNumber);
    if (!card) {
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    const historyEntry = actionType === 'known' ? 1 : 0;
    const repetitionValue = actionType === 'known' ? card.repetitionValue + 1 : Math.max(1, card.repetitionValue - 1)
    const updatedCard: FlashCard = {
      ...card,
      repetitionValue: repetitionValue,
      repetitionHistory: [historyEntry, ...card.repetitionHistory].slice(0, 20), // Add to front
    };
    const updatedCards = deck.cards.map(c => c.cardNumber === cardNumber ? updatedCard : c);
    const updatedDeck = { ...deck, cards: updatedCards };
    const undoStack = practiceHistory['undoStack'] ? practiceHistory['undoStack'].split('|') : [];
    undoStack.push(nextAction);
    if (undoStack.length > 100) {
      undoStack.shift();
    }
    // generate previus card
    const updatedPreviusCardString: string = undoStack.at(-1) ?? "";
    const [cardNumberStrTEMP, actionTypeTEMP] = updatedPreviusCardString.split(':');
    const cardNumberTEMP = parseInt(cardNumberStrTEMP, 10);
    const cardTEMP = deck.cards.find(c => c.cardNumber === cardNumberTEMP);
    if (!cardTEMP) {
      throw new Error(`Card with number ${cardNumberTEMP} not found`);
    }

    const newPracticeHistory: Record<string, string> = {
      undoStack: undoStack.join('|'),
      redoStack: redoStack.join('|'),
    };
    const redoCount = actionType === 'known' ? positiveCount + 1 : positiveCount - 1
    return {
      updatedDeck: { ...updatedDeck, settings: { ...updatedDeck.settings, practiceHistory: newPracticeHistory } },
      appliedCard: updatedCard,
      redoCount: redoCount,
      updatedPreviusCard: cardTEMP
    };
  }

  public static selectNextCard(deck: FlashCardDeck, minCardsBeforeRepeat: number, practicedCardHistory: number[]): FlashCard | null {
    const eligibleCards = deck.cards.filter(card => card.repetitionValue > 0);
    if (eligibleCards.length === 0) return null;

    // Determine how many cards to exclude based on history and setting
    const excludeCount = Math.min(minCardsBeforeRepeat, practicedCardHistory.length);
    const excludedCardNumbers = new Set(practicedCardHistory.slice(-excludeCount));

    // Filter out recently practiced cards
    let filteredCards = eligibleCards.filter(card => !excludedCardNumbers.has(card.cardNumber));

    // Fallback if no cards are left after exclusion
    if (filteredCards.length === 0) {
      filteredCards = eligibleCards;
    }

    // Sort by repetitionValue, then repetitionHistory sum, then cardNumber
    filteredCards.sort((a, b) => {
      if (a.repetitionValue !== b.repetitionValue) return a.repetitionValue - b.repetitionValue;
      const sumA = a.repetitionHistory.reduce((sum, val) => sum + val, 0);
      const sumB = b.repetitionHistory.reduce((sum, val) => sum + val, 0);
      if (sumA !== sumB) return sumA - sumB;
      return a.cardNumber - b.cardNumber;
    });

    return filteredCards[0] || null;
  }

}
