import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GlobalStateService } from '../angular/shared/services/global-state-service';
import { FlashCardDeckTagSettings } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-tag-settings';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TooltipDirective } from '../tooltip.directive';
import { TagModalComponent } from '../tag-modal/tag-modal.component';

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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getDeck() {
    return this.globalStateService.getState().practiceSession.deck;
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
    matchingKeys.sort();
    this.matchingTags = matchingKeys.map(key => ({ key }));
    this.displayedTags = this.matchingTags.slice(0, this.maxTagsToShow);
    this.matchingCount = matchingKeys.length;
  }

  getTagValue(key: string): string {
    const deck = this.getDeck();
    return deck?.tags[key] || '';
  }

  truncateValue(value: string, maxLength: number = 50): string {
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }

  openTagModal(key: string): void {
    this.selectedTagKey = key;
    this.showTagModal = true;
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
}
