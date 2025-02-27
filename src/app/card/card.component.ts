import { Component, Input, OnInit } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../angular/shared/services/global-state-service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() card: FlashCard | null = null;
  @Input() showBackSide: boolean = false;
  settings: Record<string, string> = {};

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.globalStateService.state$.subscribe(state => {
      this.settings = state.practiceSettings;
    });
  }

  getNotableCards(): string {
    return this.card && this.card.notableCards.length > 0 ? this.card.notableCards.join(', ') : 'None';
  }
}
