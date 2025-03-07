import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { ModalData } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    DetailsModalComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() card: FlashCard | null = null;
  @Input() showBackSide: boolean = false;
  @Input() isTagInteractionLocked!: boolean;
  settings: Record<string, string> = {};
  isEditingTags: boolean = false;
  isEditingNotableCards: boolean = false;
  showTagModal: boolean = false;
  tagModalData: ModalData | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        const previousLocked = this.settings['tagInteractionLocked'];
        this.settings = state.practiceSettings;
        const currentLocked = this.settings['tagInteractionLocked'];
        if (previousLocked !== currentLocked && currentLocked === 'true') {
          if (this.isEditingTags) {
            this.isEditingTags = false;
            this.saveTags();
          }
          if (this.isEditingNotableCards) {
            this.isEditingNotableCards = false;
            this.saveNotableCards();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNotableCards(): string {
    return this.card && this.card.notableCards.length > 0 ? this.card.notableCards.join(', ') : 'None';
  }

  openTagModal(tag: string): void {
    if (this.isTagInteractionLocked) return;
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && deck.tags[tag]) {
      this.tagModalData = {
        title: 'Tag Details',
        fields: [
          { label: 'Key', value: tag },
          { label: 'Value', value: deck.tags[tag] },
        ],
      };
      this.showTagModal = true;
    }
  }

  openNotableCardModal(cardNumber: number): void {
    if (this.isTagInteractionLocked) return;
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck) {
      const notableCard = deck.cards.find(c => c.cardNumber === cardNumber);
      if (notableCard) {
        this.tagModalData = {
          title: `Card ${notableCard.cardNumber} Details`,
          fields: [
            { label: 'Card Number', value: notableCard.cardNumber.toString() },
            { label: 'Card Name', value: notableCard.cardName },
            { label: 'Front Side', value: notableCard.frontSide },
            { label: 'Back Side', value: notableCard.backSide },
            { label: 'Primary Info', value: notableCard.primaryInfo },
            { label: 'Secondary Info', value: notableCard.secondaryInfo },
            { label: 'Notable Cards', value: notableCard.notableCards.join(', ') },
            { label: 'Date of Last Review', value: notableCard.dateOfLastReview },
            { label: 'Repetition Value', value: notableCard.repetitionValue.toString() },
            { label: 'Repetition History', value: notableCard.repetitionHistory.join(', ') },
            { label: 'Tags', value: notableCard.tags.join(', ') }
          ]
        };
        this.showTagModal = true;
      }
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

  toggleEditNotableCards(): void {
    if (this.isTagInteractionLocked) {
      return; // Cannot edit when locked
    }
    this.isEditingNotableCards = !this.isEditingNotableCards;
    if (!this.isEditingNotableCards && this.card) {
      this.saveNotableCards();
    }
  }

  addNotableCard(event: any): void {
    const input = event.input;
    const value = event.value.trim();
    if (value) {
      const cardNumber = parseInt(value, 10);
      if (!isNaN(cardNumber)) {
        const deck = this.globalStateService.getFlashCardDeck();
        if (deck && deck.cards.some(c => c.cardNumber === cardNumber) && this.card && !this.card.notableCards.includes(cardNumber)) {
          this.card.notableCards.push(cardNumber);
        }
      }
    }
    if (input) {
      input.value = '';
    }
  }

  removeNotableCard(cardNumber: number): void {
    if (this.card) {
      this.card.notableCards = this.card.notableCards.filter(n => n !== cardNumber);
    }
  }

  private saveTags(): void {
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && this.card) {
      const updatedCards = deck.cards.map(c =>
        c.cardNumber === this.card!.cardNumber
          ? { ...c, tags: Array.isArray(this.card!.tags) ? this.card!.tags : [] }
          : c
      );
      const updatedDeck = { ...deck, cards: updatedCards };
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }

  private saveNotableCards(): void {
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && this.card) {
      const updatedCards = deck.cards.map(c =>
        c.cardNumber === this.card!.cardNumber
          ? { ...c, notableCards: Array.isArray(this.card!.notableCards) ? this.card!.notableCards : [] }
          : c
      );
      const updatedDeck = { ...deck, cards: updatedCards };
      this.globalStateService.setFlashCardDeck(updatedDeck, false);
    }
  }
}
