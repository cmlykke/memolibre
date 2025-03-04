import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalStateService } from './angular/shared/services/global-state-service';
import { CommonModule } from '@angular/common'; // Provides *ngIf, *ngFor, etc.
import { RouterModule } from '@angular/router'; // Provides <router-outlet>

@Component({
  selector: 'app-root',
  standalone: true, // Confirms this is a standalone component
  imports: [CommonModule, RouterModule], // Import required modules
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isPracticePage: boolean = false;
  isTagInteractionLocked: boolean = false;
  menuOpen: boolean = false; // Existing property for menu toggle

  constructor(private router: Router, private globalStateService: GlobalStateService) {}

  ngOnInit() {
    // Detect current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isPracticePage = event.url === '/practice-page';
      }
    });

    // Subscribe to practice state for isTagInteractionLocked
    this.globalStateService.practiceState$.subscribe(state => {
      this.isTagInteractionLocked = state.isTagInteractionLocked;
    });
  }

  toggleTagLock() {
    const currentState = this.globalStateService.getState();
    this.globalStateService.updatePracticeState({
      isTagInteractionLocked: !currentState.practiceSession.isTagInteractionLocked
    });
  }

  // Existing menu methods
  onMouseEnter() {
    this.menuOpen = true;
  }

  onMouseLeave() {
    this.menuOpen = false;
  }
}
