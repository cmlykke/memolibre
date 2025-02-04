import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'memolibre';
  menuOpen = false; // Controls the visibility of the dropdown menu
  isTouchDevice = false; // Detects whether the user is using a touch device
  hovering = false; // Tracks if the mouse is hovering over the button or dropdown

  constructor() {
    // Detect if the user is using a touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Toggle menu open/close on button click
  // toggleMenu(): void {
  //  this.menuOpen = !this.menuOpen;
  //}

  // Called when the mouse enters the dropdown or button
  onMouseEnter(): void {
    this.menuOpen = true;
    //this.hovering = true;
  }

  // Called when the mouse leaves the dropdown or button
  onMouseLeave(): void {
    this.menuOpen = false;
    //this.hovering = false;
    //this.closeMenuWithDelay();
  }

  // Close the menu only if hovering is false after a small delay
  closeMenuWithDelay(): void {
    setTimeout(() => {
      if (!this.hovering && !this.isTouchDevice) {
        this.menuOpen = false;
      }
    }, 100); // Small delay to prevent close when transitioning between button and dropdown
  }
}
