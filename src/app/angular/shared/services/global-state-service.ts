import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlashCardDeck } from '../../../businesslogic/models/flashcarddeck';
import { FlashCard } from '../../../businesslogic/models/flashcard';
import { FlashCardDeckUpdate } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-update';
import { FlashCardDeckCreate } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-create';
import { Result } from '../../utils/types';

export interface PracticeSessionState {
  deck: FlashCardDeck | null;
  currentCard: FlashCard | null;
  previousCard: FlashCard | null;
  showBackSide: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  private practiceStateSubject = new BehaviorSubject<PracticeSessionState>({
    deck: null,
    currentCard: null,
    previousCard: null,
    showBackSide: false,
  });
  public practiceState$ = this.practiceStateSubject.asObservable();

  private protoDeckSubject = new BehaviorSubject<string | null>(null);
  public protoDeck$ = this.protoDeckSubject.asObservable();

  // Getter for the entire practice state
  getPracticeState(): PracticeSessionState {
    return this.practiceStateSubject.value;
  }

  // Setter for the entire practice state
  private setPracticeState(state: PracticeSessionState): void {
    this.practiceStateSubject.next(state);
  }

  // Setter for FlashCardDeck (updatesPracticeState)
  setFlashCardDeck(deck: FlashCardDeck, resetPractice: boolean = true): void {
    const currentState = this.getPracticeState();
    const newState: PracticeSessionState = {
      ...currentState,
      deck,
      ...(resetPractice ? { currentCard: null, previousCard: null, showBackSide: false } : {}),
    };
    this.setPracticeState(newState);
  }

  // Getter for FlashCardDeck
  getFlashCardDeck(): FlashCardDeck | null {
    return this.getPracticeState().deck;
  }

  // Setter for protoDeck
  setProtoDeck(deck: string): void {
    this.protoDeckSubject.next(deck);
  }

  // Getter for protoDeck
  getProtoDeck(): string | null {
    return this.protoDeckSubject.value;
  }

  // Clear the state
  clearFlashCardDeck(): void {
    this.setPracticeState({
      deck: null,
      currentCard: null,
      previousCard: null,
      showBackSide: false,
    });
  }

  clearProtoDeck(): void {
    this.protoDeckSubject.next(null);
  }

  // Practice session methods
  setCurrentPracticeCard(card: FlashCard | null): void {
    const currentState = this.getPracticeState();
    this.setPracticeState({ ...currentState, currentCard: card });
  }

  setPreviousPracticeCard(card: FlashCard | null): void {
    const currentState = this.getPracticeState();
    this.setPracticeState({ ...currentState, previousCard: card });
  }

  setShowBackSide(show: boolean): void {
    const currentState = this.getPracticeState();
    this.setPracticeState({ ...currentState, showBackSide: show });
  }

  // Update practice state atomically (for markAsKnown/markAsForgotten)
  updatePracticeState(updates: Partial<PracticeSessionState>): void {
    const currentState = this.getPracticeState();
    this.setPracticeState({ ...currentState, ...updates });
  }

  // Existing methods
  updateFlashCardNameState(updatedDeckName: string): Result<string, string> {
    if (!updatedDeckName) {
      return { ok: false, error: 'Error: No new deckName exists.' };
    }
    const currentDeck = this.getFlashCardDeck();
    if (!currentDeck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update.' };
    }
    try {
      const updatedDeck: FlashCardDeck = FlashCardDeckUpdate.editDeckName(updatedDeckName, currentDeck);
      this.setFlashCardDeck(updatedDeck, false); // Preserve practice state
      return { ok: true, value: 'updateFlashCardName successful' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  createNewDeckState(newDeckContent: string): Result<string, string> {
    if (!newDeckContent.trim()) {
      return { ok: false, error: 'Please enter deck content.' };
    }
    try {
      const [newDeck, result] = FlashCardDeckCreate.createNewDeck(newDeckContent);
      if (newDeck) {
        this.setFlashCardDeck(newDeck);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }
}
