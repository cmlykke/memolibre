import { Component } from '@angular/core';
import { RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corrected key name and array syntax
})
export class AppComponent {
  title = 'memolibre';

  // Variable to keep track of menu's visibility state
  menuOpen = false;

  // Toggle menu visibility
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}





