import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalStateService, PracticeSessionState } from '../../../shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';

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
  showTooltips: boolean = true; // Default to true

  constructor(private globalStateService: GlobalStateService) {
    // Subscribe to state$ to get the showTooltips setting
    this.globalStateService.state$.subscribe(state => {
      this.showTooltips = state.appSettings['showTooltips'] === 'true';
    });
    this.globalStateService.practiceState$.subscribe((state: PracticeSessionState) => {
      const deck = state.deck;
      this.deckName = deck ? deck.deckName : null;
      if (deck) {
        this.newDeckName = deck.deckName;
      }
    });
    this.globalStateService.protoDeck$.subscribe((protoDeck: string | null) => {
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
    this.resultMessage = result.ok ? result.value : result.error;
  }

  createDeck(): void {
    if (!this.newDeckContent.trim()) {
      this.resultMessage = 'Please enter deck content.';
      return;
    }
    const result = this.globalStateService.createNewDeckState(this.newDeckContent.trim());
    this.resultMessage = result.ok ? result.value : result.error;
  }
}
