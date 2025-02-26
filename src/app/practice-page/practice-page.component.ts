import { Component, HostListener } from '@angular/core';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { FlashCard } from '../businesslogic/models/flashcard';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';
import { FlashCardDeckPracticeUpdate } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-update';

@Component({
  selector: 'app-practice-page',
  standalone: true,
  imports: [CardComponent, CommonModule],
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.css'],
})
export class PracticePageComponent {
  constructor(protected globalStateService: GlobalStateService) {}

  /**
   * Selects the next card based on repetitionValue, sum of repetitionHistory, and cardNumber.
   */
  private selectNextCard(deck: FlashCardDeck | null): FlashCard | null {
    if (!deck || deck.cards.length === 0) return null;
    const eligibleCards = deck.cards.filter(card => card.repetitionValue > 0);
    if (eligibleCards.length === 0) return null;
    eligibleCards.sort((a, b) => {
      if (a.repetitionValue !== b.repetitionValue) {
        return a.repetitionValue - b.repetitionValue;
      }
      const sumA = a.repetitionHistory.reduce((sum, val) => sum + val, 0);
      const sumB = b.repetitionHistory.reduce((sum, val) => sum + val, 0);
      if (sumA !== sumB) {
        return sumA - sumB;
      }
      return a.cardNumber - b.cardNumber;
    });
    return eligibleCards[0];
  }

  /**
   * Initializes the practice session if no current card is set.
   */
  private initializePracticeSession(): void {
    const currentState = this.globalStateService.getPracticeState();
    if (!currentState.currentCard) {
      const nextCard = this.selectNextCard(currentState.deck);
      this.globalStateService.updatePracticeState({
        currentCard: nextCard,
        showBackSide: false,
      });
    }
  }

  /**
   * Marks the current card as known and updates the global state atomically.
   */
  markAsKnown(): void {
    const currentState = this.globalStateService.getPracticeState();
    const { deck, currentCard } = currentState;
    if (!currentCard || !deck) return;

    // Update the deck with the marked card and get the updated version
    const updatedDeck = FlashCardDeckPracticeUpdate.markCardAsKnown(deck, currentCard.cardNumber);
    const updatedCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber)!; // Get the updated card
    const nextCard = this.selectNextCard(updatedDeck);

    console.log('Before update - currentCard:', currentCard.cardNumber, 'showBackSide:', currentState.showBackSide);
    console.log('Updated card:', updatedCard);
    console.log('Next card selected:', nextCard?.cardNumber);

    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedCard, // Use the updated card as previousCard
      currentCard: nextCard,
      showBackSide: false,
    });

    const newState = this.globalStateService.getPracticeState();
    console.log('After update - currentCard:', newState.currentCard?.cardNumber, 'showBackSide:', newState.showBackSide);
  }

  /**
   * Marks the current card as forgotten and updates the global state atomically.
   */
  markAsForgotten(): void {
    const currentState = this.globalStateService.getPracticeState();
    const { deck, currentCard } = currentState;
    if (!currentCard || !deck) return;

    // Update the deck with the marked card and get the updated version
    const updatedDeck = FlashCardDeckPracticeUpdate.markCardAsForgotten(deck, currentCard.cardNumber);
    const updatedCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber)!; // Get the updated card
    const nextCard = this.selectNextCard(updatedDeck);

    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedCard, // Use the updated card as previousCard
      currentCard: nextCard,
      showBackSide: false,
    });
  }

  /**
   * Handles keyboard events for spacebar and left/right arrows.
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.globalStateService.getPracticeState();
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;

    if (event.key === ' ' || event.key === 'ArrowRight') {
      if (event.key === ' ') {
        event.preventDefault(); // Prevent scrolling
      }
      if (!showBackSide) {
        this.globalStateService.updatePracticeState({ showBackSide: true });
      } else {
        this.markAsKnown();
      }
    } else if (event.key === 'ArrowLeft' && showBackSide) {
      this.markAsForgotten();
    }
  }

  ngOnInit(): void {
    this.initializePracticeSession();
  }
}
