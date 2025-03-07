import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { FlashCard } from '../businesslogic/models/flashcard';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';
import { FlashCardDeckPracticeUpdate } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-update';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-practice-page',
  standalone: true,
  imports: [CardComponent, CommonModule],
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.css'],
})
export class PracticePageComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private isTagInteractionLocked: boolean = false;
  tagLockButtonText: string = 'Lock Tags'; // New property for button text

  constructor(protected globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.initializePracticeSession();
    this.subscription.add(
      this.globalStateService.practiceState$.subscribe(state => {
        this.isTagInteractionLocked = state.isTagInteractionLocked;
        this.tagLockButtonText = this.isTagInteractionLocked ? 'Unlock Tags' : 'Lock Tags';
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleTagLock(): void {
    const currentState = this.globalStateService.getState();
    this.globalStateService.updatePracticeState({
      isTagInteractionLocked: !currentState.practiceSession.isTagInteractionLocked,
    });
  }

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

  private initializePracticeSession(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    if (!currentState.currentCard) {
      const nextCard = this.selectNextCard(currentState.deck);
      this.globalStateService.updatePracticeState({
        currentCard: nextCard,
        showBackSide: false,
      });
    }
  }

  markAsKnown(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard } = currentState;
    if (!currentCard || !deck) return;

    const updatedDeck = FlashCardDeckPracticeUpdate.markCardAsKnown(deck, currentCard.cardNumber);
    const updatedCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber)!;
    const nextCard = this.selectNextCard(updatedDeck);

    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedCard,
      currentCard: nextCard,
      showBackSide: false,
    });
  }

  markAsForgotten(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard } = currentState;
    if (!currentCard || !deck) return;

    const updatedDeck = FlashCardDeckPracticeUpdate.markCardAsForgotten(deck, currentCard.cardNumber);
    const updatedCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber)!;
    const nextCard = this.selectNextCard(updatedDeck);

    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedCard,
      currentCard: nextCard,
      showBackSide: false,
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.globalStateService.getState().practiceSession;
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;

    if (!showBackSide && (event.key === ' ' || event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      if (event.key === ' ') {
        event.preventDefault();
      }
      this.globalStateService.updatePracticeState({ showBackSide: true });
    } else if (showBackSide) {
      if (event.key === ' ' || event.key === 'ArrowRight') {
        if (event.key === ' ') {
          event.preventDefault();
        }
        this.markAsKnown();
      } else if (event.key === 'ArrowLeft') {
        this.markAsForgotten();
      }
    }
  }
}
