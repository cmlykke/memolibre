import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GlobalStateService } from '../../../shared/services/global-state-service';
import { CardComponent } from '../../reuseables/card/card.component';
import { CommonModule } from '@angular/common';
import { FlashCardDeckPracticeUpdate } from '../../../core/services/flash-card-deck-state-management/flash-card-deck-practice-update';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { TooltipKey } from '../../../shared/services/tooltip.service';

@Component({
  selector: 'app-practice-page',
  standalone: true,
  imports: [CardComponent, CommonModule, TooltipDirective],
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.css'],
})
export class PracticePageComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private isTagInteractionLocked: boolean = false;
  private showBackSideNameAtTopLabel: boolean = false;
  private skipBackSide: boolean = false;
  showTooltips: boolean = true;
  tagLockButtonText: string = 'Lock';

  @ViewChild('practiceContainer') practiceContainer!: ElementRef;
  @ViewChild('currentCardContainer') currentCardContainer!: ElementRef;
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

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
        this.tagLockButtonText = this.isTagInteractionLocked ? 'Unlock' : 'Lock';
        this.showBackSideNameAtTopLabel = state.showBackSideNameAtTopLabel;
        this.skipBackSide = state.skipBackSide;
      })
    );

    // Subscribe to the global state to update showTooltips
    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        this.showTooltips = state.appSettings['showTooltips'] === 'true';
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
        showBackSideNameAtTopLabel: currentState.showBackSideNameAtTopLabel,
        skipBackSide: currentState.skipBackSide
      });
    }
  }

  markAsKnown(): void {
    const currentState = this.globalStateService.getState().practiceSession;
    const { deck, currentCard, practicedCardHistory, practiceCount, positiveCount } = currentState;
    if (!currentCard || !deck) return;

    // Update the deck with the practice action
    const updatedDeck = FlashCardDeckPracticeUpdate.performPracticeAction(deck, currentCard.cardNumber, 'known');

    // Find the updated card in the updated deck
    const updatedPreviousCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber);
    if (!updatedPreviousCard) {
      throw new Error(`Updated card with number ${currentCard.cardNumber} not found in updated deck`);
    }

    // Update history and select the next card
    const newHistory = [...practicedCardHistory, currentCard.cardNumber];
    const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
    const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);

    // Update the state with the updated previous card
    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedPreviousCard,
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

    // Update the deck with the practice action
    const updatedDeck = FlashCardDeckPracticeUpdate.performPracticeAction(deck, currentCard.cardNumber, 'forgotten');

    // Find the updated card in the updated deck
    const updatedPreviousCard = updatedDeck.cards.find(c => c.cardNumber === currentCard.cardNumber);
    if (!updatedPreviousCard) {
      throw new Error(`Updated card with number ${currentCard.cardNumber} not found in updated deck`);
    }

    // Update history and select next card
    const newHistory = [...practicedCardHistory, currentCard.cardNumber];
    const minCardsBeforeRepeat = parseInt(this.globalStateService.getState().practiceSettings['minCardsBeforeRepeat'] || '0', 10);
    const nextCard = FlashCardDeckPracticeUpdate.selectNextCard(updatedDeck, minCardsBeforeRepeat, newHistory);

    // Update the state with the updated previous card
    this.globalStateService.updatePracticeState({
      deck: updatedDeck,
      previousCard: updatedPreviousCard,
      currentCard: nextCard,
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

  /** New method to check user's answer */
  checkAnswer(): void {
    const state = this.globalStateService.getState().practiceSession;
    if (!state.currentCard) return;

    const inputValue = this.answerInput.nativeElement.value.trim().toLowerCase();
    const backSide = state.currentCard.backSide.trim().toLowerCase();

    if (inputValue === backSide) {
      this.markAsKnown();
    } else {
      this.markAsForgotten();
    }

    // Clear the input and focus the new input after view update
    this.answerInput.nativeElement.value = '';
    setTimeout(() => {
      if (this.answerInput && this.answerInput.nativeElement) {
        this.answerInput.nativeElement.focus();
      }
    }, 0);
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const currentState = this.globalStateService.getState().practiceSession;
    const { currentCard, showBackSide } = currentState;
    if (!currentCard) return;
    if (this.skipBackSide) {
      if (!showBackSide && [' ', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
        if (event.key === ' ' || event.key === 'ArrowRight') {
          if (event.key === ' ') event.preventDefault();
          this.markAsKnown();
        } else if (event.key === 'ArrowLeft') {
          this.markAsForgotten();
        }
      }
    } else {
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

    // Get screen width for dynamic threshold
    const screenWidth = window.innerWidth;
    const minSwipeDistance = screenWidth * 0.15; // 15% of screen width

    // Check if swipe is primarily horizontal
    if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
      if (!showBackSide) {
        // Show back side on any significant horizontal swipe
        this.globalStateService.updatePracticeState({ showBackSide: true });
      } else {
        // Handle known/forgotten based on swipe direction
        if (deltaX > 0) {
          this.markAsKnown();
        } else if (deltaX < 0) {
          this.markAsForgotten();
        }
      }
    }
  }

  protected readonly TooltipKey = TooltipKey;
}
