import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For two-way binding
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import {FlashCardDeckUpdate} from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-update';
import {FlashCardDeck} from '../businesslogic/models/flashcarddeck'; // Import CommonModule for Angular directives
import {Result} from '../angular/utils/types';

@Component({
  selector: 'app-create-deck-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-deck-component.component.html',
  styleUrl: './create-deck-component.component.css',
  standalone: true,
})
export class CreateDeckComponent {
  resultMessage: string = ''
  deckName: string | null = null; // Variable to store the current deck name
  newDeckName: string | null = null; // Holds the input value for updating the deck name

  constructor(private globalStateService: GlobalStateService) {
    // Subscribe to the global state to retrieve the current deck name
    this.globalStateService.flashCardDeck$.subscribe((deck) => {
      this.deckName = deck ? deck.deckName : null;
      if (deck) {
        this.newDeckName = deck.deckName; // Initialize newDeckName with current deckName
      }
    });
  }

  /**
   * Updates the deck name in the global state
   */
  updateDeckName(): void {
    if (!this.newDeckName) {
      this.resultMessage = "Error: No new deckName exists.";
      return;
    }

    const result = this.globalStateService.updateFlashCardName(this.newDeckName);

    if (!result.ok) {
      // Handle error response
      this.resultMessage = result.error;
    } else {
      // Set success message
      this.resultMessage = result.value;
    }
  }
}
