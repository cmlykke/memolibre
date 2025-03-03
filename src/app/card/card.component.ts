import { Component, Input, OnInit } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SimpleTagModalComponent } from '../simple-tag-modal/simple-tag-modal.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    SimpleTagModalComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() card: FlashCard | null = null;
  @Input() showBackSide: boolean = false;
  settings: Record<string, string> = {};
  isEditingTags: boolean = false;
  showTagModal: boolean = false;
  tagModalData: { key: string; value: string } | null = null;

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.globalStateService.state$.subscribe(state => {
      const previousLocked = this.settings['tagInteractionLocked'];
      this.settings = state.practiceSettings;
      const currentLocked = this.settings['tagInteractionLocked'];
      if (previousLocked !== currentLocked && currentLocked === 'true' && this.isEditingTags) {
        this.isEditingTags = false;
        this.saveTags();
      }
    });
  }

  get isTagInteractionLocked(): boolean {
    return this.settings['tagInteractionLocked'] === 'true';
  }

  getNotableCards(): string {
    return this.card && this.card.notableCards.length > 0 ? this.card.notableCards.join(', ') : 'None';
  }

  openTagModal(tag: string): void {
    if (this.isTagInteractionLocked) {
      return; // Do not open modal if locked
    }
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && deck.tags[tag]) {
      this.tagModalData = { key: tag, value: deck.tags[tag] };
      this.showTagModal = true;
    }
  }

  closeTagModal(): void {
    this.showTagModal = false;
    this.tagModalData = null;
  }

  toggleEditTags(): void {
    if (this.isTagInteractionLocked) {
      return; // Cannot edit when locked
    }
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
