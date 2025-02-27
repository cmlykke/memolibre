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

export interface AppState {
  practiceSession: PracticeSessionState;
  practiceSettings: Record<string, string>;
  appSettings: Record<string, string>;
  protoDeck: string | null;
}

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
  private stateSubject = new BehaviorSubject<AppState>({
    practiceSession: {
      deck: null,
      currentCard: null,
      previousCard: null,
      showBackSide: false,
    },
    practiceSettings: FlashCardDeckPracticeSettings.defaultSettings(),
    appSettings: FlashCardDeckAppSettings.defaultSettings(),
    protoDeck: null,
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
    const newState: AppState = {
      ...currentState,
      practiceSession: {
        ...currentState.practiceSession,
        deck: normalizedDeck,
        ...(resetPractice ? { currentCard: null, previousCard: null, showBackSide: false } : {}),
      },
      practiceSettings: FlashCardDeckPracticeSettings.normalizeSettings(normalizedDeck.settings["practice-settings"]),
      appSettings: FlashCardDeckAppSettings.normalizeSettings(normalizedDeck.settings["app-settings"]),
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

  private normalizeDeckSettings(deck: FlashCardDeck): FlashCardDeck {
    const currentSettings = deck.settings || {};
    const practiceSettings = FlashCardDeckPracticeSettings.normalizeSettings(currentSettings["practice-settings"] || {});
    const appSettings = FlashCardDeckAppSettings.normalizeSettings(currentSettings["app-settings"] || {});

    // Preserve unrecognized settings keys
    const normalizedSettings: Record<string, Record<string, string>> = {
      "practice-settings": practiceSettings,
      "app-settings": appSettings,
    };
    Object.entries(currentSettings).forEach(([key, value]) => {
      if (key !== "practice-settings" && key !== "app-settings") {
        normalizedSettings[key] = value; // Preserve unrecognized settings
      }
    });

    return {
      ...deck,
      settings: normalizedSettings,
    };
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
}
