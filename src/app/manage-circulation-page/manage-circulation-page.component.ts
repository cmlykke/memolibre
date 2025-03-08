import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { FlashCardDeck } from '../businesslogic/models/flashcarddeck';
import { increaseCirculation, decreaseCirculation } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-circulation';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-manage-circulation-page',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './manage-circulation-page.component.html',
  styleUrls: ['./manage-circulation-page.component.css']
})
export class ManageCirculationPageComponent implements OnInit, OnDestroy {
  deck: FlashCardDeck | null = null;
  numberInput: number | null = null;
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

  increase(): void {
    if (this.deck) {
      const updatedDeck = increaseCirculation(this.deck, this.numberInput);
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }

  decrease(): void {
    if (this.deck) {
      const updatedDeck = decreaseCirculation(this.deck, this.numberInput);
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
}
