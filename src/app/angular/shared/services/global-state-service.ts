import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlashCardDeck } from '../../../businesslogic/models/flashcarddeck'; // Update the path as per your application structure

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
}
