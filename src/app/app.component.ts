import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalStateService } from './angular/shared/services/global-state-service';
import { ActionButtonService } from '../app/angular/shared/services/action-button.service'; // Import the new service
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  menuOpen: boolean = false;
  buttonText: string = 'Action';
  buttonVisible: boolean = false;

  constructor(
    private router: Router,
    private globalStateService: GlobalStateService,
    private actionButtonService: ActionButtonService
  ) {}

  ngOnInit() {
    // Subscribe to route changes to determine visibility and behavior
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url;
        // Reset button behavior by default
        this.actionButtonService.clearButtonBehavior();

        // Set visibility based on the route
        if (url === '/practice-page' || url === '/search-page') {
          this.actionButtonService.setButtonBehavior(
            () => {}, // Default action (will be overridden by page components)
            'Action', // Default text (will be overridden)
            true // Visible on these pages
          );
        }
      }
    });

    // Subscribe to button text and visibility changes
    this.actionButtonService.buttonText$.subscribe(text => {
      this.buttonText = text;
    });
    this.actionButtonService.buttonVisible$.subscribe(visible => {
      this.buttonVisible = visible;
    });
  }

  // Method to execute the button's action
  executeButtonAction() {
    this.actionButtonService.buttonAction$.subscribe(action => action()).unsubscribe();
  }

  // Existing menu methods
  onMouseEnter() {
    this.menuOpen = true;
  }

  onMouseLeave() {
    this.menuOpen = false;
  }
}
