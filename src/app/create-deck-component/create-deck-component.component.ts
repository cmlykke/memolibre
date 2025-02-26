import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalStateService, PracticeSessionState } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { Result } from '../angular/utils/types';
import { TooltipDirective } from '../tooltip.directive';

@Component({
  selector: 'app-create-deck-component',
  imports: [CommonModule, FormsModule, TooltipDirective],
  templateUrl: './create-deck-component.component.html',
  styleUrls: ['./create-deck-component.component.css'],
  standalone: true,
})
export class CreateDeckComponent {
  resultMessage: string = '';
  deckName: string | null = null;
  newDeckName: string | null = null;
  newDeckContent: string = '';

  constructor(private globalStateService: GlobalStateService) {
    // Subscribe to practiceState$ to get the current deck
    this.globalStateService.practiceState$.subscribe((state: PracticeSessionState) => {
      const deck = state.deck;
      this.deckName = deck ? deck.deckName : null;
      if (deck) {
        this.newDeckName = deck.deckName; // Initialize newDeckName with current deckName
      }
    });

    // Subscribe to protoDeck$ to sync newDeckContent
    this.globalStateService.protoDeck$.subscribe((protoDeck) => {
      this.newDeckContent = protoDeck || '';
    });
  }

  onDeckContentChange(content: string): void {
    this.globalStateService.setProtoDeck(content);
  }

  updateDeckName(): void {
    if (!this.newDeckName) {
      this.resultMessage = 'Error: No new deckName exists.';
      return;
    }
    const result = this.globalStateService.updateFlashCardNameState(this.newDeckName);
    if (!result.ok) {
      this.resultMessage = result.error;
    } else {
      this.resultMessage = result.value;
    }
  }

  createDeck(): void {
    if (!this.newDeckContent.trim()) {
      this.resultMessage = 'Please enter deck content.';
      return;
    }
    const result = this.globalStateService.createNewDeckState(this.newDeckContent.trim());
    if (!result.ok) {
      this.resultMessage = result.error;
    } else {
      this.resultMessage = result.value;
    }
  }
}
