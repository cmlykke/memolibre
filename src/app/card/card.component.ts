import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FlashCard } from '../businesslogic/models/flashcard';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { CardFieldEditModalComponent } from '../card-field-edit-modal/card-field-edit-modal.component';
import { TagModalComponent } from '../tag-modal/tag-modal.component';
import { ModalData } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-settings';
import { Subscription } from 'rxjs';
import { FlashCardDeckTagSettings } from '../../app/businesslogic/services/flash-card-deck-state-management/flash-card-deck-tag-settings';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    DetailsModalComponent,
    CardFieldEditModalComponent,
    TagModalComponent
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
  selectedTagKey: string = '';
  selectedTagValue: string = '';
  deckTags: Record<string, string> = {};
  showDetailsModal: boolean = false;
  detailsModalData: ModalData | null = null;
  showEditModal: boolean = false;
  fieldToEdit: 'primaryInfo' | 'secondaryInfo' | null = null;
  private subscription: Subscription = new Subscription();

  // Properties for tag autocomplete (unchanged)
  tagControl = new FormControl();
  filteredTags: Observable<string[]>;
  allTags: string[] = [];
  isRegexMode: boolean = false;

  // New properties for notable card autocomplete
  notableCardControl = new FormControl();
  filteredCardNumbers: Observable<number[]>;
  allCardNumbers: number[] = [];

  constructor(private globalStateService: GlobalStateService) {
    // Tag autocomplete setup (unchanged)
    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTags(value || ''))
    );

    // Notable card autocomplete setup
    this.filteredCardNumbers = this.notableCardControl.valueChanges.pipe(
      startWith(null),
      map(value => this._filterCardNumbers(value))
    );
  }

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
        const deck = state.practiceSession.deck;
        if (deck) {
          this.allTags = Object.keys(deck.tags);
          // Populate allCardNumbers with sorted card numbers from the deck
          this.allCardNumbers = deck.cards.map(c => c.cardNumber).sort((a, b) => a - b);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Tag filtering (unchanged)
  private _filterTags(value: string): string[] {
    if (!value) {
      return this.allTags;
    }
    if (this.isRegexMode) {
      try {
        const regex = new RegExp(value, 'i');
        return this.allTags.filter(tag => regex.test(tag));
      } catch (e) {
        return this.allTags;
      }
    } else {
      const filterValue = value.toLowerCase();
      return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
    }
  }

  // New filtering for notable cards
  private _filterCardNumbers(value: number | null): number[] {
    if (value === null) {
      return this.allCardNumbers; // Show all card numbers when input is empty
    }
    const filterValue = value.toString();
    return this.allCardNumbers.filter(cardNumber =>
      cardNumber.toString().startsWith(filterValue)
    );
  }

  // Tag methods (unchanged)
  selectTag(event: any): void {
    const tag = event.option.value;
    if (this.card && !this.card.tags.includes(tag)) {
      this.card.tags.push(tag);
    }
    this.tagControl.setValue('');
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value && this.allTags.includes(value) && this.card && !this.card.tags.includes(value)) {
      this.card.tags.push(value);
    } else if (value && !this.allTags.includes(value)) {
      console.log(`Tag "${value}" does not exist in the deck.`);
    }
    this.tagControl.setValue('');
  }

  removeTag(tag: string): void {
    if (this.card) {
      this.card.tags = this.card.tags.filter(t => t !== tag);
    }
  }

  toggleEditTags(): void {
    if (this.isTagInteractionLocked) return;
    this.isEditingTags = !this.isEditingTags;
    if (!this.isEditingTags && this.card) {
      this.saveTags();
    }
  }

  // Notable card methods
  toggleEditNotableCards(): void {
    if (this.isTagInteractionLocked) return;
    this.isEditingNotableCards = !this.isEditingNotableCards;
    if (!this.isEditingNotableCards && this.card) {
      this.saveNotableCards();
    }
  }

  addNotableCard(event: any): void {
    const value = event.value;
    if (value !== null && value !== '') {
      const cardNumber = Number(value); // Convert input to number
      if (!isNaN(cardNumber) && this.allCardNumbers.includes(cardNumber) && this.card && !this.card.notableCards.includes(cardNumber)) {
        this.card.notableCards.push(cardNumber);
      } else {
        console.log(`Card number ${value} does not exist in the deck.`);
      }
    }
    this.notableCardControl.setValue(null); // Clear the input
  }

  selectNotableCard(event: any): void {
    const cardNumber = event.option.value;
    if (this.card && !this.card.notableCards.includes(cardNumber)) {
      this.card.notableCards.push(cardNumber);
    }
    this.notableCardControl.setValue(null); // Clear the input
  }

  removeNotableCard(cardNumber: number): void {
    if (this.card) {
      this.card.notableCards = this.card.notableCards.filter(n => n !== cardNumber);
    }
  }

  // Remaining methods (unchanged)
  toggleFilterMode(): void {
    this.isRegexMode = !this.isRegexMode;
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

  onSaveTag(data: { newKey: string, newValue: string }): void {
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck) {
      try {
        const updatedDeck = FlashCardDeckTagSettings.editTag(deck, this.selectedTagKey, data.newKey, data.newValue);
        this.globalStateService.setFlashCardDeck(updatedDeck, false);
        console.log('Tag updated successfully:', { newKey: data.newKey, newValue: data.newValue });
      } catch (error) {
        console.error('Failed to update tag:', error);
      }
    }
    this.closeTagModal();
  }

  openTagModal(tag: string): void {
    if (this.isTagInteractionLocked) return;
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck && deck.tags[tag]) {
      this.selectedTagKey = tag;
      this.selectedTagValue = deck.tags[tag];
      this.deckTags = deck.tags;
      this.showTagModal = true;
      console.log('Tag modal opened:', { key: tag, value: deck.tags[tag] });
    } else {
      console.log('Tag not found:', tag);
    }
  }

  closeTagModal(): void {
    this.showTagModal = false;
    this.selectedTagKey = '';
    this.selectedTagValue = '';
    this.deckTags = {};
  }

  openNotableCardModal(cardNumber: number): void {
    if (this.isTagInteractionLocked) return;
    const deck = this.globalStateService.getFlashCardDeck();
    if (deck) {
      const notableCard = deck.cards.find(c => c.cardNumber === cardNumber);
      if (notableCard) {
        this.detailsModalData = {
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
        this.showDetailsModal = true;
      }
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.detailsModalData = null;
  }
}
