import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { increaseCirculation, decreaseCirculation } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-circulation';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../tooltip.directive'; // Adjust the path if necessary

@Component({
  selector: 'app-manage-circulation-page',
  standalone: true,
  imports: [CommonModule, TooltipDirective], // Add TooltipDirective here
  templateUrl: './manage-circulation-page.component.html',
  styleUrls: ['./manage-circulation-page.component.css']
})
export class ManageCirculationPageComponent implements OnInit, OnDestroy {
  deck: FlashCardDeck | null = null;
  numberInput: number | null = null;
  cardInput: string = ''; // New property for textarea input
  private subscription: Subscription = new Subscription();

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.globalStateService.practiceState$.subscribe(practiceState => {
        this.deck = practiceState.deck;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get totalCards(): number {
    return this.deck?.cards.length ?? 0;
  }

  get highestCardInCirculation(): number {
    if (!this.deck || this.deck.cards.length === 0) return 0;
    const inCirculation = this.deck.cards.filter(card => card.repetitionValue > 0);
    return inCirculation.length > 0 ? Math.max(...inCirculation.map(card => card.cardNumber)) : 0;
  }

  get repetitionStats(): { repetitionValue: number, count: number }[] {
    if (!this.deck) return [];
    const statsMap = new Map<number, number>();
    this.deck.cards.forEach(card => {
      statsMap.set(card.repetitionValue, (statsMap.get(card.repetitionValue) || 0) + 1);
    });
    return Array.from(statsMap.entries())
      .map(([repetitionValue, count]) => ({ repetitionValue, count }))
      .sort((a, b) => a.repetitionValue - b.repetitionValue);
  }

  // Parse the textarea input into an array of card numbers
  private parseCardInput(input: string): number[] {
    const trimmedInput = input.trim();
    if (trimmedInput.includes('-')) {
      // Handle range (e.g., "1289-1400")
      const [start, end] = trimmedInput.split('-').map(s => parseInt(s.trim(), 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    } else if (trimmedInput.includes(',')) {
      // Handle comma-separated list (e.g., "132,233,237,321")
      return trimmedInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }
    return [];
  }

  increase(): void {
    if (this.deck) {
      let updatedDeck: FlashCardDeck;
      if (this.numberInput === null && this.cardInput.trim() !== '') {
        const cardNumbers = this.parseCardInput(this.cardInput);
        updatedDeck = increaseCirculation(this.deck, null, cardNumbers);
      } else {
        updatedDeck = increaseCirculation(this.deck, this.numberInput);
      }
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }

  decrease(): void {
    if (this.deck) {
      let updatedDeck: FlashCardDeck;
      if (this.numberInput === null && this.cardInput.trim() !== '') {
        const cardNumbers = this.parseCardInput(this.cardInput);
        updatedDeck = decreaseCirculation(this.deck, null, cardNumbers);
      } else {
        updatedDeck = decreaseCirculation(this.deck, this.numberInput);
      }
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }

  get cardsInCirculation(): number {
    return this.deck?.cards.filter(card => card.repetitionValue > 0).length ?? 0;
  }

  onNumberInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement?.value;
    this.numberInput = value ? parseInt(value, 10) : null;
    if (this.numberInput !== null && (isNaN(this.numberInput) || this.numberInput <= 0)) {
      this.numberInput = null;
    }
  }

  onCardInputChange(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement;
    this.cardInput = textareaElement.value;
  }
}
