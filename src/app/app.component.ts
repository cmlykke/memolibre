import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalStateService } from './angular/shared/services/global-state-service';
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

  constructor(
    private router: Router,
    private globalStateService: GlobalStateService
  ) {}

  ngOnInit() {
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
}
