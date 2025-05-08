// C:\Users\CMLyk\WebstormProjects\memolibre\src\app\add-remove-card-page\add-remove-card-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { GlobalStateService } from '../../../shared/services/global-state-service';
import { FlashCard } from '../../../core/services/models/flashcard';
import {TooltipDirective} from '../../../shared/directives/tooltip.directive';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-add-remove-card-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, TooltipDirective],
  templateUrl: './add-remove-card-page.component.html',
  styleUrls: ['./add-remove-card-page.component.css'],
})
export class AddRemoveCardPageComponent implements OnInit {
  deleteCardInput: string = '';
  cardNumber: number = 1;
  frontSide: string = '';
  backSide: string = '';
  cardName: string = '';
  tags: string = '';
  primaryInfo: string = '';
  secondaryInfo: string = '';
  showTooltips: boolean = true;

  private subscription: Subscription = new Subscription();

  constructor(private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.resetCardNumber();

    // Subscribe to the global state to update showTooltips
    this.subscription.add(
      this.globalStateService.state$.subscribe(state => {
        this.showTooltips = state.appSettings['showTooltips'] === 'true';
      })
    );
  }

  resetCardNumber(): void {
    this.cardNumber = this.globalStateService.getNextCardNumber();
  }

  onUpdate(): void {
    // Handle card deletion
    if (this.deleteCardInput.trim()) {
      const result = this.globalStateService.removeCards(this.deleteCardInput);
      if (result.ok) {
        console.log(result.value);
        this.deleteCardInput = ''; // Clear the delete field after success
        this.resetCardNumber(); // Update default card number
      } else {
        console.error(result.error);
      }
      return;
    }

    // Handle card addition
    if (this.frontSide.trim() && this.backSide.trim()) {
      const newCard: FlashCard = {
        cardNumber: this.cardNumber,
        frontSide: this.frontSide,
        backSide: this.backSide,
        cardName: this.cardName.trim(),
        tags: this.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        primaryInfo: this.primaryInfo.trim(),
        secondaryInfo: this.secondaryInfo.trim(),
        notableCards: [],
        dateOfLastReview: new Date().toISOString().split('T')[0], // Current date
        repetitionValue: 0,
        repetitionHistory: [0, 0, 0, 0, 0],
      };

      const result = this.globalStateService.addCard(newCard);
      if (result.ok) {
        console.log(result.value);
        this.clearFields();
      } else {
        console.error(result.error);
      }
    } else {
      console.error('Front side and back side are required to add a card');
    }
  }

  onClear(): void {
    this.clearFields();
  }

  private clearFields(): void {
    this.deleteCardInput = '';
    this.frontSide = '';
    this.backSide = '';
    this.cardName = '';
    this.tags = '';
    this.primaryInfo = '';
    this.secondaryInfo = '';
    this.resetCardNumber();
  }
}
