import { Component } from '@angular/core';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common'; // Import CommonModule for Angular directives


@Component({
  selector: 'app-create-deck-component',
  imports: [CommonModule],
  templateUrl: './create-deck-component.component.html',
  styleUrl: './create-deck-component.component.css',
  standalone: true
})


export class CreateDeckComponent {
  deckName: string | null = null; // Variable to store the current deck name

  constructor(private globalStateService: GlobalStateService) {
    // Subscribe to the global state observable
    this.globalStateService.flashCardDeck$.subscribe((deck) => {
      this.deckName = deck ? deck.deckName : null; // Update deckName when FlashCardDeck is set
    });
  }
}

