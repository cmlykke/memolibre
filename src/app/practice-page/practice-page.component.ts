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
  @ViewChild('currentCardContainer') currentCardContainer!: ElementRef;

  // Properties for touch handling
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private isTouchOnCurrentCard: boolean = false;

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
    const { deck, currentCard, practicedCardHistory, practiceCount, positiveCount } = currentState;
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
      practiceCount: practiceCount + 1,
      positiveCount: positiveCount + 1,
    });
  }

  markAsForgotten(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard, practicedCardHistory, practiceCount, positiveCount } = currentState;
    if (!currentCard || !deck) return;
    const updatedDeck = FlashCardDeckPracticeUpdate.performPracticeAction(deck, currentCard.cardNumber, 'forgotten');
    const newHistory = [...practicedCardHistory, currentCard.cardNumber];
    const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
    const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);
    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      currentCard: nextCard,
      previousCard: currentCard,
      showBackSide: false,
      practicedCardHistory: newHistory,
      practiceCount: practiceCount + 1,
      positiveCount: positiveCount - 1,
    });
  }

  undo(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, practicedCardHistory, practiceCount, positiveCount } = currentState;
    if (!deck || practicedCardHistory.length === 0) return;
    const { updatedDeck, revertedCard, undoCount, updatedPreviusCard } = FlashCardDeckPracticeUpdate.undoLastAction(deck, positiveCount);
    if (revertedCard) {
      const newHistory = practicedCardHistory.slice(0, -1);
      if (!updatedPreviusCard) {
        throw new Error(`Previous Card not found. Current card number: ${revertedCard?.cardNumber}`);
      }
      this.globalStateService.updatePracticeState({
        deck: updatedDeck,
        previousCard: updatedPreviusCard,
        currentCard: revertedCard,
        showBackSide: true,
        practicedCardHistory: newHistory,
        practiceCount: Math.max(0, practiceCount - 1),
        positiveCount: undoCount,
      });
    }
  }

  redo(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, practicedCardHistory, practiceCount, positiveCount } = currentState;
    if (!deck) return;
    const { updatedDeck, appliedCard, redoCount, updatedPreviusCard } = FlashCardDeckPracticeUpdate.redoLastAction(deck, positiveCount);
    if (appliedCard) {
      const newHistory = [...practicedCardHistory, appliedCard.cardNumber];
      const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
      const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);
      if (!updatedPreviusCard) {
        throw new Error(`Previous Card not found. Current card number: ${nextCard?.cardNumber}`);
      }
      this.globalStateService.updatePracticeState({
        deck: updatedDeck,
        previousCard: updatedPreviusCard,
        currentCard: nextCard,
        showBackSide: false,
        practicedCardHistory: newHistory,
        practiceCount: practiceCount + 1,
        positiveCount: redoCount,
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

    element.addEventListener('touchstart', (event: TouchEvent) => {
      const isOnCurrentCard = this.currentCardContainer && this.currentCardContainer.nativeElement.contains(event.target as Node);
      console.log('Touch start on current card:', isOnCurrentCard, 'Target:', event.target);
      if (isOnCurrentCard) {
        this.isTouchOnCurrentCard = true;
        this.touchStartX = event.changedTouches[0].screenX;
        this.touchStartY = event.changedTouches[0].screenY;
      } else {
        this.isTouchOnCurrentCard = false;
      }
    }, false);

    element.addEventListener('touchend', (event: TouchEvent) => {
      if (this.isTouchOnCurrentCard) {
        this.touchEndX = event.changedTouches[0].screenX;
        this.touchEndY = event.changedTouches[0].screenY;
        this.handleSwipe(this.touchStartX, this.touchStartY, this.touchEndX, this.touchEndY);
        this.isTouchOnCurrentCard = false;
      }
    }, false);
  }

  private handleSwipe(touchStartX: number, touchStartY: number, touchEndX: number, touchEndY: number): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;

    // Calculate distances
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Define thresholds
    const minDragDistance = 50; // Lower threshold for slow drags (in pixels)
    const maxVerticalDistance = 20; // Max vertical movement in pixels
    const maxAngle = 30; // Allow movements within ±30 degrees of horizontal

    // Calculate swipe angle (in degrees)
    const angle = Math.atan2(absDeltaY, absDeltaX) * (180 / Math.PI);

    // Process horizontal movement if it's primarily horizontal
    if (absDeltaX > minDragDistance && absDeltaY < maxVerticalDistance && angle < maxAngle) {
      if (!showBackSide) {
        // Show back side on any significant horizontal movement
        this.globalStateService.updatePracticeState({ showBackSide: true });
      } else {
        // Handle known/forgotten based on direction
        if (deltaX > minDragDistance) {
          this.markAsKnown();
        } else if (deltaX < -minDragDistance) {
          this.markAsForgotten();
        }
      }
    }
  }
}
