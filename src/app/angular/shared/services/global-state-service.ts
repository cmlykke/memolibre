import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlashCardDeck } from '../../../businesslogic/models/flashcarddeck'; // Update the path as per your application structure
import {FlashCardDeckUpdate} from '../../../businesslogic/services/flash-card-deck-state-management/flash-card-deck-update';
import {Result} from '../../utils/types';

@Injectable({
  providedIn: 'root', // Provides this service globally
})
export class GlobalStateService {
  // BehaviorSubject to hold the state of FlashCardDeck, initializing with `null`
  private flashCardDeckSubject = new BehaviorSubject<FlashCardDeck | null>(null);
  public flashCardDeck$ = this.flashCardDeckSubject.asObservable(); // Observable for subscriptions



  // Setter for FlashCardDeck
  setFlashCardDeck(deck: FlashCardDeck): void {
    this.flashCardDeckSubject.next(deck);
  }

  // Getter for FlashCardDeck
  getFlashCardDeck(): FlashCardDeck | null {
    return this.flashCardDeckSubject.value;
  }

  // Clear the state (to reset or remove the global state)
  clearFlashCardDeck(): void {
    this.flashCardDeckSubject.next(null);
  }

  updateFlashCardName(updatedDeckName: string): Result<string, string> {
    // Check for an invalid deck name (null, empty, or undefined)
    if (!updatedDeckName) {
      return { ok: false, error: "Error: No new deckName exists." };
    }

    // Retrieve the current global deck from the BehaviorSubject
    const currentDeck = this.getFlashCardDeck();

    // Check if there's a flashcard deck to update
    if (!currentDeck) {
      return { ok: false, error: "Error: No flashcard deck exists to update." };
    }

    // Perform the business logic to update the deck's name
    try {
      const updatedDeck = FlashCardDeckUpdate.editDeckName(updatedDeckName, currentDeck);

      // Update the global state with the modified deck
      this.setFlashCardDeck(updatedDeck);

      // Indicate success
      return { ok: true, value: "updateFlashCardName successful" };
    } catch (error) {
      // Catch any unexpected runtime errors from FlashCardDeckUpdate
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred.";
      return { ok: false, error: `Error: ${errorMessage}` };
    }
  }


}
