import { Component, Input, OnInit } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SimpleTagModalComponent } from '../simple-tag-modal/simple-tag-modal.component'; // New import

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule, // Still used for tag chips
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    SimpleTagModalComponent // Add the new modal component
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() card: FlashCard | null = null;
  @Input() showBackSide: boolean = false;
  settings: Record<string, string> = {};
  isEditingTags: boolean = false;
  showTagModal: boolean = false; // Controls modal visibility
  tagModalData: { key: string; value: string } | null = null; // Holds modal data

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.globalStateService.state$.subscribe(state => {
      this.settings = state.practiceSettings;
    });
  }

  getNotableCards(): string {
    return this.card && this.card.notableCards.length > 0 ? this.card.notableCards.join(', ') : 'None';
  }

  openTagModal(tag: string): void {
    const deck = this.globalStateService.getFlashCardDeck();
    console.log('Clicked tag:', tag, 'Deck tags:', deck?.tags, 'Value:', deck?.tags[tag]);
    if (deck && deck.tags[tag]) {
      this.tagModalData = { key: tag, value: deck.tags[tag] };
      this.showTagModal = true; // Show the modal
    }
  }

  closeTagModal(): void {
    this.showTagModal = false; // Hide the modal
    this.tagModalData = null; // Clear the data
  }

  toggleEditTags(): void {
    this.isEditingTags = !this.isEditingTags;
    if (!this.isEditingTags && this.card) {
      this.saveTags();
    }
  }

  addTag(event: any): void {
    const input = event.input;
    const value = event.value.trim();
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && deck.tags && value && this.card && deck.tags.hasOwnProperty(value) && !this.card.tags.includes(value)) {
      this.card.tags.push(value);
    }
    if (input) {
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    if (this.card) {
      this.card.tags = this.card.tags.filter(t => t !== tag);
    }
  }

  private saveTags(): void {
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && this.card) {
      const updatedCards = deck.cards.map(c =>
        c.cardNumber === this.card!.cardNumber ? { ...c, tags: this.card!.tags } : c
      );
      const updatedDeck = { ...deck, cards: updatedCards };
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }
}
