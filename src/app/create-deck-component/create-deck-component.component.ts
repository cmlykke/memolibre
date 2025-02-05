import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For two-way binding
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular directives

@Component({
  selector: 'app-create-deck-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-deck-component.component.html',
  styleUrl: './create-deck-component.component.css',
  standalone: true,
})
export class CreateDeckComponent {
  deckName: string | null = null; // Variable to store the current deck name
  newDeckName: string = ''; // Holds the input value for updating the deck name

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
    if (this.deckName) {
      const updatedDeck = {
        ...this.globalStateService.getFlashCardDeck(), // Get the existing state
        deckName: this.newDeckName, // Update the deck name
      };
      this.globalStateService.setFlashCardDeck(updatedDeck as any); // Update global state
    } else {
      // If no deck exists, create a new one with a name
      this.globalStateService.setFlashCardDeck({
        deckName: this.newDeckName,
        deckInfo: '', // You can set default values as needed
        settings: {},
        tags: {}, // Properly initialize `tags` as an object, not an empty array
        cards: [], // Properly initialize `cards` as an empty array
      });
    }
  }
}
