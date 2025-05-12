import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlobalStateService } from '../../../shared/services/global-state-service';
import { FlashCardDeckTagSettings } from '../../../core/services/flash-card-deck-state-management/flash-card-deck-tag-settings';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TagModalComponent } from '../../modals/tag-modal/tag-modal.component';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import {TooltipKey} from '../../../shared/services/tooltip.service';

@Component({
  selector: 'app-tag-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipDirective, TagModalComponent],
  templateUrl: './tag-page.component.html',
  styleUrls: ['./tag-page.component.css'],
})
export class TagPageComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  matchingTags: { key: string }[] = [];
  displayedTags: { key: string }[] = [];
  matchingCount: number = 0;
  showTooltips: boolean = true;
  isTagInteractionLocked: boolean = false;
  tagLockButtonText: string = 'Lock Tags'; // New property
  showTagModal: boolean = false;
  selectedTagKey: string = '';
  sortByCount: boolean = false; // New property to toggle sorting
  sortButtonText: string = 'Sort by Count'; // New property for button text
  private subscription: Subscription = new Subscription();
  protected maxTagsToShow = 500;

  constructor(
    private fb: FormBuilder,
    private globalStateService: GlobalStateService
  ) {
    this.searchForm = this.fb.group({
      tagRegex: [''],
    });
  }

  ngOnInit(): void {
    const tagSearchSettings = this.globalStateService.getState().tagSearchSettings;
    this.searchForm.patchValue(tagSearchSettings);

    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        this.showTooltips = state.appSettings['showTooltips'] === 'true';
      })
    );

    this.subscription.add(
      this.globalStateService.practiceState$.pipe(
        map(state => state.isTagInteractionLocked),
        distinctUntilChanged()
      ).subscribe(isLocked => {
        this.isTagInteractionLocked = isLocked;
        this.tagLockButtonText = this.isTagInteractionLocked ? 'Unlock Tags' : 'Lock Tags';
      })
    );

    this.subscription.add(
      this.searchForm.valueChanges.pipe(debounceTime(300)).subscribe(values => {
        this.globalStateService.updateTagSearchSettings(values);
        this.performSearch();
      })
    );

    this.performSearch();
  }

  onDeleteTag(key: string): void {
    const deck = this.getDeck();
    if (deck) {
      try {
        const updatedDeck = FlashCardDeckTagSettings.deleteTag(deck, key);
        this.globalStateService.setFlashCardDeck(updatedDeck, false);
        this.performSearch();
      } catch (error: unknown) {
        console.error('Failed to delete tag:', error);

        // Safely extract the error message or provide a fallback
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred while deleting the tag.';
        alert(message); // Show error to user
      }
    }
    this.closeTagModal();
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getDeck() {
    return this.globalStateService.getState().practiceSession.deck;
  }

  getTagValue(key: string): string {
    const deck = this.getDeck();
    return deck?.tags[key] || '';
  }

  truncateValue(value: string, maxLength: number = 50): string {
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }

  openAddTagModal(): void {
    this.selectedTagKey = ''; // Empty key for new tag
    this.showTagModal = true;
  }

  openTagModal(key: string): void {
    this.selectedTagKey = key;
    this.showTagModal = true;
  }

  toggleSort(): void {
    this.sortByCount = !this.sortByCount;
    this.sortButtonText = this.sortByCount ? 'Sort Alphabetically' : 'Sort by Count';
    this.performSearch(); // Re-run search to apply sorting
  }

  getTagCardCount(key: string): number {
    const deck = this.getDeck();
    if (!deck) return 0;
    return deck.cards.filter(card => card.tags.includes(key)).length;
  }

  performSearch(): void {
    const deck = this.getDeck();
    if (!deck) {
      this.matchingTags = [];
      this.displayedTags = [];
      this.matchingCount = 0;
      return;
    }
    const tagRegex = this.searchForm.get('tagRegex')?.value;
    let regex: RegExp | null = null;
    try {
      if (tagRegex) regex = new RegExp(tagRegex);
    } catch (e) {
      this.matchingTags = [];
      this.displayedTags = [];
      this.matchingCount = 0;
      return;
    }
    const tags = deck.tags;
    const matchingKeys = Object.keys(tags).filter(key => !regex || regex.test(key));

    // Sort based on toggle
    if (this.sortByCount) {
      matchingKeys.sort((a, b) => this.getTagCardCount(b) - this.getTagCardCount(a) || a.localeCompare(b));
    } else {
      matchingKeys.sort();
    }

    this.matchingTags = matchingKeys.map(key => ({ key }));
    this.displayedTags = this.matchingTags.slice(0, this.maxTagsToShow);
    this.matchingCount = matchingKeys.length;
  }

  closeTagModal(): void {
    this.showTagModal = false;
    this.selectedTagKey = '';
  }

  onSaveTag(data: { newKey: string, newValue: string }): void {
    const deck = this.getDeck();
    if (deck) {
      try {
        const updatedDeck = FlashCardDeckTagSettings.editTag(deck, this.selectedTagKey, data.newKey, data.newValue);
        this.globalStateService.setFlashCardDeck(updatedDeck, false);
        this.performSearch();
      } catch (error) {
        console.error('Failed to update tag:', error);
      }
    }
    this.closeTagModal();
  }

  toggleTagLock(): void {
    const currentState = this.globalStateService.getState();
    this.globalStateService.updatePracticeState({
      isTagInteractionLocked: !currentState.practiceSession.isTagInteractionLocked,
    });
  }

  protected readonly TooltipKey = TooltipKey;
}
