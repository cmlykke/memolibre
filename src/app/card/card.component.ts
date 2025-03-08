import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { CardFieldEditModalComponent } from '../card-field-edit-modal/card-field-edit-modal.component'; // Import the new modal
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
    DetailsModalComponent,
    CardFieldEditModalComponent // Add to imports
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
  showEditModal: boolean = false; // Controls visibility of the edit modal
  fieldToEdit: 'primaryInfo' | 'secondaryInfo' | null = null; // Tracks which field is being edited
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

  openEditModal(field: 'primaryInfo' | 'secondaryInfo'): void {
    if (this.isTagInteractionLocked || !this.card) return;
    this.fieldToEdit = field;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.fieldToEdit = null;
  }

  getCurrentValue(field: 'primaryInfo' | 'secondaryInfo'): string {
    return this.card ? this.card[field] : '';
  }

  saveField(newValue: string): void {
    if (!this.card || !this.fieldToEdit) return;
    const updatedCard = { ...this.card, [this.fieldToEdit]: newValue };
    this.globalStateService.updateCard(updatedCard);
    this.closeEditModal();
  }


  private saveTags(): void {
    if (this.card) {
      const updatedCard = { ...this.card, tags: Array.isArray(this.card.tags) ? this.card.tags : [] };
      this.globalStateService.updateCard(updatedCard);
    }
  }

  private saveNotableCards(): void {
    if (this.card) {
      const updatedCard = { ...this.card, notableCards: Array.isArray(this.card.notableCards) ? this.card.notableCards : [] };
      this.globalStateService.updateCard(updatedCard);
    }
  }

}
