// src/app/angular/shared/services/auto-save.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { GlobalStateService } from './global-state-service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService implements OnDestroy {
  private autoSaveEnabled = false;
  private currentDeck: any = null;
  private subscription: Subscription = new Subscription();
  private saveInterval: any = null;
  private lastModified: number = 0;

  constructor(private globalStateService: GlobalStateService) {
    // Subscribe to app settings changes to track autoSave setting
    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        const wasEnabled = this.autoSaveEnabled;
        this.autoSaveEnabled = state.appSettings['autoSave'] === 'true';
        this.currentDeck = state.practiceSession.deck;

        // Mark as modified when deck changes
        if (this.currentDeck) {
          this.lastModified = Date.now();
        }

        // Setup or teardown interval based on setting change
        if (!wasEnabled && this.autoSaveEnabled) {
          this.setupAutoSave();
        } else if (wasEnabled && !this.autoSaveEnabled) {
          this.teardownAutoSave();
        }
      })
    );

    // Add event listeners for both desktop and mobile scenarios
    this.setupLifecycleEvents();

    // Setup initial state if needed
    if (this.autoSaveEnabled) {
      this.setupAutoSave();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.teardownAutoSave();
    this.removeLifecycleEvents();
  }

  private setupLifecycleEvents(): void {
    // Desktop/common events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Mobile-specific events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));

    // iOS-specific events
    window.addEventListener('blur', this.handleAppBlur.bind(this));
  }

  private removeLifecycleEvents(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('pagehide', this.handlePageHide.bind(this));
    window.removeEventListener('blur', this.handleAppBlur.bind(this));
  }

  private setupAutoSave(): void {
    // Set up periodic saves as backup for mobile browsers
    // that might not properly trigger visibility or unload events
    this.saveInterval = setInterval(() => {
      if (this.autoSaveEnabled && this.currentDeck && this.lastModified > 0) {
        this.saveDeckToLocalStorage();
      }
    }, 30000); // Save every 30 seconds if there were modifications
  }

  private teardownAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  // Handle standard page close/refresh on desktops
  private handleBeforeUnload(): void {
    if (this.autoSaveEnabled && this.currentDeck) {
      this.saveDeckToLocalStorage();
    }
  }

  // Handle when app goes to background on mobile
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden' && this.autoSaveEnabled && this.currentDeck) {
      this.saveDeckToLocalStorage();
    }
  }

  // Handle iOS and some mobile browsers
  private handlePageHide(): void {
    if (this.autoSaveEnabled && this.currentDeck) {
      this.saveDeckToLocalStorage();
    }
  }

  // Additional handler for iOS
  private handleAppBlur(): void {
    if (this.autoSaveEnabled && this.currentDeck) {
      this.saveDeckToLocalStorage();
    }
  }

  private saveDeckToLocalStorage(): void {
    try {
      // Only save if there's a deck
      if (!this.currentDeck) return;

      const deckJson = JSON.stringify(this.currentDeck);

      // Check size before saving (mobile browsers have stricter storage limits)
      const sizeInBytes = new Blob([deckJson]).size;
      if (sizeInBytes > 5 * 1024 * 1024) { // 5MB limit (reasonable for most browsers)
        console.warn('Deck is too large to auto-save:', sizeInBytes, 'bytes');
        // Consider implementing a compressed version or breaking into chunks
        return;
      }

      localStorage.setItem('memolibre_auto_saved_deck', deckJson);
      localStorage.setItem('memolibre_auto_save_timestamp', new Date().toISOString());

      // Reset last modified time since we've saved
      this.lastModified = 0;
    } catch (error) {
      console.error('Failed to auto-save deck to local storage:', error);
      // Could attempt to use alternative storage method if localStorage fails
    }
  }

  // Public method to check if there's an auto-saved deck to restore
  public hasAutoSavedDeck(): boolean {
    return !!localStorage.getItem('memolibre_auto_saved_deck');
  }

  // Public method to restore auto-saved deck
  public restoreAutoSavedDeck(): any {
    try {
      const deckJson = localStorage.getItem('memolibre_auto_saved_deck');
      if (deckJson) {
        return JSON.parse(deckJson);
      }
    } catch (error) {
      console.error('Failed to restore auto-saved deck:', error);
    }
    return null;
  }

  // Public method to clear auto-saved deck
  public clearAutoSavedDeck(): void {
    localStorage.removeItem('memolibre_auto_saved_deck');
    localStorage.removeItem('memolibre_auto_save_timestamp');
  }

  // Method to manually trigger a save
  public saveNow(): void {
    if (this.currentDeck) {
      this.saveDeckToLocalStorage();
    }
  }
}
