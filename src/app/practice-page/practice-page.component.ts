import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class PracticePageComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private isTagInteractionLocked: boolean = false;
  tagLockButtonText: string = 'Lock Tags';

  @ViewChild('practiceContainer') practiceContainer!: ElementRef;

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

  ngAfterViewInit(): void {
    this.addTouchListeners();
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

  private initializePracticeSession(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    if (!currentState.currentCard && currentState.deck) {
      const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
      const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(currentState.deck, minCardsBeforeRepeat, currentState.practicedCardHistory);
      this.globalStateService.updatePracticeState({
        currentCard: nextCard,
        showBackSide: false,
      });
    }
  }

  markAsKnown(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard, practicedCardHistory, practiceCount } = currentState;
    if (!currentCard || !deck) return;
    const updatedDeck = FlashCardDeckPracticeUpdate.performPracticeAction(deck, currentCard.cardNumber, 'known');
    const newHistory = [...practicedCardHistory, currentCard.cardNumber];
    const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
    const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);
    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: currentCard,
      currentCard: nextCard,
      showBackSide: false,
      practicedCardHistory: newHistory,
      practiceCount: practiceCount + 1, // Increment counter
    });
  }

  markAsForgotten(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard, practicedCardHistory, practiceCount } = currentState;
    if (!currentCard || !deck) return;
    const updatedDeck = FlashCardDeckPracticeUpdate.performPracticeAction(deck, currentCard.cardNumber, 'forgotten');
    const newHistory = [...practicedCardHistory, currentCard.cardNumber];
    const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
    const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);
    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: currentCard,
      currentCard: nextCard,
      showBackSide: false,
      practicedCardHistory: newHistory,
      practiceCount: practiceCount + 1, // Increment counter
    });
  }

  undo(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, practiceCount } = currentState;
    if (!deck) return;
    const { updatedDeck, revertedCard } = FlashCardDeckPracticeUpdate.undoLastAction(deck);
    if (revertedCard) {
      this.globalStateService.updatePracticeState({
        deck: updatedDeck,
        currentCard: revertedCard,
        showBackSide: true,
        practiceCount: Math.max(0, practiceCount - 1), // Decrement, not below 0
      });
    }
  }

  redo(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, practiceCount } = currentState;
    if (!deck) return;
    const { updatedDeck, appliedCard } = FlashCardDeckPracticeUpdate.redoLastAction(deck);
    if (appliedCard) {
      this.globalStateService.updatePracticeState({
        deck: updatedDeck,
        currentCard: appliedCard,
        showBackSide: true,
        practiceCount: practiceCount + 1, // Increment counter
      });
    }
  }

  canUndo(): boolean {
    const deck = this.globalStateService.getState().practiceSession.deck;
    return !!deck && !!deck.settings["practiceHistory"]?.["undoStack"];
  }

  canRedo(): boolean {
    const deck = this.globalStateService.getState().practiceSession.deck;
    return !!deck && !!deck.settings["practiceHistory"]?.["redoStack"];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.globalStateService.getState().practiceSession;
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;
    if (!showBackSide && [' ', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
      if (event.key === ' ') event.preventDefault();
      this.globalStateService.updatePracticeState({ showBackSide: true });
    } else if (showBackSide) {
      if (event.key === ' ' || event.key === 'ArrowRight') {
        if (event.key === ' ') event.preventDefault();
        this.markAsKnown();
      } else if (event.key === 'ArrowLeft') {
        this.markAsForgotten();
      }
    }
  }

  private addTouchListeners(): void {
    const element = this.practiceContainer.nativeElement;
    let touchStartX = 0;
    let touchEndX = 0;

    element.addEventListener('touchstart', (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
    }, false);

    element.addEventListener('touchend', (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, false);
  }

  private handleSwipe(touchStartX: number, touchEndX: number): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;
    const distance = touchEndX - touchStartX;
    if (!showBackSide) {
      if (Math.abs(distance) < 10) {
        this.globalStateService.updatePracticeState({ showBackSide: true });
      }
    } else {
      if (distance > 50) {
        this.markAsKnown();
      } else if (distance < -50) {
        this.markAsForgotten();
      }
    }
  }
}
