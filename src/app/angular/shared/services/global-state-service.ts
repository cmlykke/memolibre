// C:\Users\CMLyk\WebstormProjects\memolibre\src\app\angular\shared\services\global-state-service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlashCardDeck } from '../../../businesslogic/models/flashcarddeck';
import { FlashCard } from '../../../businesslogic/models/flashcard';
import { FlashCardDeckUpdate } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-update';
import { FlashCardDeckCreate } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-create';
import { FlashCardDeckPracticeSettings } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-settings';
import { FlashCardDeckAppSettings } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-app-settings';
import { Result } from '../../utils/types';
import { FlashCardDeckSearchSettings } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-search-settings';
import { FlashCardDeckTagSettings } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-tag-settings';
import { FlashCardDeckAddRemoveCard } from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-add-remove-card';

export interface AppState {
  practiceSession: PracticeSessionState;
  practiceSettings: Record<string, string>;
  appSettings: Record<string, string>;
  searchSettings: Record<string, string>;
  tagSearchSettings: Record<string, string>;
  protoDeck: string | null;
  practiceHistory: Record<string, string>;
}

export interface PracticeSessionState {
  deck: FlashCardDeck | null;
  currentCard: FlashCard | null;
  previousCard: FlashCard | null;
  showBackSide: boolean;
  isTagInteractionLocked: boolean;
  practicedCardHistory: number[];
  practiceCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  private stateSubject = new BehaviorSubject<AppState>({
    practiceSession: {
      deck: null,
      currentCard: null,
      previousCard: null,
      showBackSide: false,
      isTagInteractionLocked: true,
      practicedCardHistory: [],
      practiceCount: 0,
    },
    practiceSettings: FlashCardDeckPracticeSettings.defaultSettings(),
    appSettings: FlashCardDeckAppSettings.defaultSettings(),
    searchSettings: FlashCardDeckSearchSettings.defaultSettings(),
    tagSearchSettings: { tagRegex: '' },
    protoDeck: null,
    practiceHistory: { undoStack: '', redoStack: '' },
  });

  public state$ = this.stateSubject.asObservable();
  public practiceState$ = this.state$.pipe(map((state: AppState) => state.practiceSession));
  public protoDeck$ = this.state$.pipe(map((state: AppState) => state.protoDeck));

  public getState(): AppState {
    return this.stateSubject.value;
  }

  private setState(state: AppState): void {
    this.stateSubject.next(state);
  }

  private updateState(updates: Partial<AppState>): void {
    const currentState = this.getState();
    this.setState({ ...currentState, ...updates });
  }

  setFlashCardDeck(deck: FlashCardDeck, resetPractice: boolean = true): void {
    const currentState = this.getState();
    const normalizedDeck = this.normalizeDeckSettings(deck);

    normalizedDeck.cards = normalizedDeck.cards.map(card => ({
      ...card,
      notableCards: Array.isArray(card.notableCards) ? card.notableCards : [],
      tags: Array.isArray(card.tags) ? card.tags : [],
    }));

    const newState: AppState = {
      ...currentState,
      practiceSession: {
        ...currentState.practiceSession,
        deck: normalizedDeck,
        ...(resetPractice ? {
          currentCard: null,
          previousCard: null,
          showBackSide: false,
          practicedCardHistory: [],
          practiceCount: 0,
        } : {}),
      },
      practiceSettings: FlashCardDeckPracticeSettings.normalizeSettings(normalizedDeck.settings["practice-settings"]),
      appSettings: FlashCardDeckAppSettings.normalizeSettings(normalizedDeck.settings["app-settings"]),
      searchSettings: FlashCardDeckSearchSettings.normalizeSettings(normalizedDeck.settings["search"]),
      tagSearchSettings: normalizedDeck.settings["tag-search"],
      practiceHistory: normalizedDeck.settings["practiceHistory"],
    };
    this.setState(newState);
  }

  getFlashCardDeck(): FlashCardDeck | null {
    return this.getState().practiceSession.deck;
  }

  setProtoDeck(deck: string): void {
    this.updateState({ protoDeck: deck });
  }

  getProtoDeck(): string | null {
    return this.getState().protoDeck;
  }

  clearFlashCardDeck(): void {
    this.updateState({
      practiceSession: {
        deck: null,
        currentCard: null,
        previousCard: null,
        showBackSide: false,
        isTagInteractionLocked: false,
        practicedCardHistory: [],
        practiceCount: 0, // Reset counter
      },
    });
  }

  clearProtoDeck(): void {
    this.updateState({ protoDeck: null });
  }

  setCurrentPracticeCard(card: FlashCard | null): void {
    const currentState = this.getState();
    this.updateState({
      practiceSession: { ...currentState.practiceSession, currentCard: card },
    });
  }

  setPreviousPracticeCard(card: FlashCard | null): void {
    const currentState = this.getState();
    this.updateState({
      practiceSession: { ...currentState.practiceSession, previousCard: card },
    });
  }

  setShowBackSide(show: boolean): void {
    const currentState = this.getState();
    this.updateState({
      practiceSession: { ...currentState.practiceSession, showBackSide: show },
    });
  }

  updatePracticeState(updates: Partial<PracticeSessionState>): void {
    const currentState = this.getState();
    this.updateState({
      practiceSession: { ...currentState.practiceSession, ...updates },
    });
  }

  updatePracticeSettings(newSettings: Record<string, string>): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update settings.' };
    }
    try {
      const updatedDeck = FlashCardDeckPracticeSettings.updatePracticeSettings(deck, newSettings);
      const normalizedSettings = FlashCardDeckPracticeSettings.normalizeSettings(newSettings);
      this.updateState({
        practiceSession: { ...currentState.practiceSession, deck: updatedDeck },
        practiceSettings: normalizedSettings,
      });
      return { ok: true, value: 'Practice settings updated successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  updateAppSettings(newSettings: Record<string, string>): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update settings.' };
    }
    try {
      const updatedDeck = FlashCardDeckAppSettings.updateAppSettings(deck, newSettings);
      const normalizedSettings = FlashCardDeckAppSettings.normalizeSettings(newSettings);
      this.updateState({
        practiceSession: { ...currentState.practiceSession, deck: updatedDeck },
        appSettings: normalizedSettings,
      });
      return { ok: true, value: 'App settings updated successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  updateSearchSettings(newSettings: Record<string, string>): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update settings.' };
    }
    try {
      const updatedDeck = FlashCardDeckSearchSettings.updateSearchSettings(deck, newSettings);
      this.setFlashCardDeck(updatedDeck, false); // Update deck without resetting practice
      return { ok: true, value: 'Search settings updated successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  updateTagSearchSettings(newSettings: Record<string, string>): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update settings.' };
    }
    try {
      const updatedDeck = FlashCardDeckTagSettings.updateTagSearchSettings(deck, newSettings);
      this.setFlashCardDeck(updatedDeck, false); // Update deck without resetting practice
      return { ok: true, value: 'Tag search settings updated successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  private normalizeDeckSettings(deck: FlashCardDeck): FlashCardDeck {
    const currentSettings = deck.settings || {};
    const practiceSettings = FlashCardDeckPracticeSettings.normalizeSettings(currentSettings["practice-settings"] || {});
    const appSettings = FlashCardDeckAppSettings.normalizeSettings(currentSettings["app-settings"] || {});
    const searchSettings = FlashCardDeckSearchSettings.normalizeSettings(currentSettings["search"] || {});
    const tagSearchSettings = FlashCardDeckTagSettings.normalizeSearchSettings(currentSettings["tag-search"] || {});
    const practiceHistory = currentSettings["practiceHistory"] || { undoStack: '', redoStack: '' };

    // Ensure practiceHistory has the correct structure
    const normalizedPracticeHistory: Record<string, string> = {
      undoStack: typeof practiceHistory['undoStack'] === 'string' ? practiceHistory['undoStack'] : '',
      redoStack: typeof practiceHistory['redoStack'] === 'string' ? practiceHistory['redoStack'] : '',
    };

    const normalizedSettings: Record<string, Record<string, string>> = {
      "practice-settings": practiceSettings,
      "app-settings": appSettings,
      "search": searchSettings,
      "tag-search": tagSearchSettings,
      "practiceHistory": normalizedPracticeHistory, // Add normalized practiceHistory
    };

    Object.entries(currentSettings).forEach(([key, value]) => {
      if (!["practice-settings", "app-settings", "search", "tag-search", "practiceHistory"].includes(key)) {
        normalizedSettings[key] = value; // Preserve other settings
      }
    });

    return { ...deck, settings: normalizedSettings };
  }

  updateFlashCardNameState(updatedDeckName: string): Result<string, string> {
    if (!updatedDeckName) {
      return { ok: false, error: 'Error: No new deckName exists.' };
    }
    const currentDeck = this.getFlashCardDeck();
    if (!currentDeck) {
      return { ok: false, error: 'Error: No flashcard deck exists to update.' };
    }
    try {
      const updatedDeck = FlashCardDeckUpdate.editDeckName(updatedDeckName, currentDeck);
      this.setFlashCardDeck(updatedDeck, false);
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
        const deckWithSettings = {
          ...newDeck,
          settings: {
            "practice-settings": FlashCardDeckPracticeSettings.defaultSettings(),
            "app-settings": FlashCardDeckAppSettings.defaultSettings(),
          },
        };
        this.setFlashCardDeck(deckWithSettings);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }

  public updateCard(updatedCard: FlashCard): void {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) return;
    const updatedCards = deck.cards.map(c => c.cardNumber === updatedCard.cardNumber ? updatedCard : c);
    const updatedDeck = { ...deck, cards: updatedCards };
    const newCurrentCard = currentState.practiceSession.currentCard?.cardNumber === updatedCard.cardNumber ? updatedCard : currentState.practiceSession.currentCard;
    const newPreviousCard = currentState.practiceSession.previousCard?.cardNumber === updatedCard.cardNumber ? updatedCard : currentState.practiceSession.previousCard;
    this.updateState({
      practiceSession: {
        ...currentState.practiceSession,
        deck: updatedDeck,
        currentCard: newCurrentCard,
        previousCard: newPreviousCard,
      },
    });
  }

  public removeCards(cardInput: string): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'No deck exists to remove cards from' };
    }
    const result = FlashCardDeckAddRemoveCard.removeCards(deck, cardInput);
    if (result.ok) {
      this.setFlashCardDeck(result.value, false);
      return { ok: true, value: 'Cards removed successfully' };
    }
    return { ok: false, error: result.error };
  }

  // New method to add a card
  public addCard(newCard: FlashCard): Result<string, string> {
    const currentState = this.getState();
    const deck = currentState.practiceSession.deck;
    if (!deck) {
      return { ok: false, error: 'No deck exists to add a card to' };
    }
    const result = FlashCardDeckAddRemoveCard.addCard(deck, newCard);
    if (result.ok) {
      this.setFlashCardDeck(result.value, false);
      return { ok: true, value: 'Card added successfully' };
    }
    return { ok: false, error: result.error };
  }

  // New method to get the next card number
  public getNextCardNumber(): number {
    const deck = this.getState().practiceSession.deck;
    if (!deck) return 1;
    return FlashCardDeckAddRemoveCard.getHighestCardNumber(deck) + 1;
  }


}
