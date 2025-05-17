import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalStateService } from './angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {AutoSaveService} from './angular/shared/services/auto-save.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  menuOpen: boolean = false;

  constructor(
    private router: Router,
    private globalStateService: GlobalStateService,
    private autoSaveService: AutoSaveService
  ) {}

  ngOnInit() {
    this.checkForAutoSavedDeck();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // No button-related logic needed here anymore
      }
    });
  }

  onMouseEnter() {
    this.menuOpen = true;
  }

  onMouseLeave() {
    this.menuOpen = false;
  }

  private checkForAutoSavedDeck(): void {
    if (this.autoSaveService.hasAutoSavedDeck()) {
      const savedDeck = this.autoSaveService.restoreAutoSavedDeck();
      if (savedDeck) {
        // On mobile, a confirm dialog might not be ideal - consider a more native approach
        const timestamp = localStorage.getItem('memolibre_auto_save_timestamp');
        const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'recently';

        // Create a non-blocking notification instead of a modal dialog
        this.showRestoreNotification(formattedTime, () => {
          this.globalStateService.setFlashCardDeck(savedDeck);
          this.autoSaveService.clearAutoSavedDeck();
        });
      }
    }
  }


  private showRestoreNotification(time: string, onRestore: () => void): void {
    // Implement a toast/banner notification that's mobile-friendly
    // This is just a placeholder - you'd implement actual UI here
    const banner = document.createElement('div');
    banner.className = 'restore-notification';
    banner.innerHTML = `
    <p>Auto-saved deck from ${time} available</p>
    <button class="restore-btn">Restore</button>
    <button class="dismiss-btn">Dismiss</button>
  `;

    document.body.appendChild(banner);

    // Add event listeners
    banner.querySelector('.restore-btn')?.addEventListener('click', () => {
      onRestore();
      document.body.removeChild(banner);
    });

    banner.querySelector('.dismiss-btn')?.addEventListener('click', () => {
      this.autoSaveService.clearAutoSavedDeck();
      document.body.removeChild(banner);
    });

    // Auto-dismiss after 10 seconds if no action taken
    setTimeout(() => {
      if (document.body.contains(banner)) {
        document.body.removeChild(banner);
      }
    }, 10000);
  }


}
