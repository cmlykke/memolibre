import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FlashCard } from '../businesslogic/models/flashcard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnChanges {
  @Input() card: FlashCard | null = null;
  @Input() showBackSide: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('CardComponent inputs - card:', this.card?.cardNumber, 'showBackSide:', this.showBackSide);
  }

  getNotableCards(): string {
    return this.card && this.card.notableCards.length > 0 ? this.card.notableCards.join(', ') : 'None';
  }
}
