import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalData } from '../businesslogic/services/flash-card-deck-state-management/flash-card-deck-practice-settings';

@Component({
  selector: 'app-simple-tag-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-tag-modal.component.html',
  styleUrls: ['./simple-tag-modal.component.css']
})
export class SimpleTagModalComponent {
  @Input() data: ModalData | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
