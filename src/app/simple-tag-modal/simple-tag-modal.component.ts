import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-simple-tag-modal',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './simple-tag-modal.component.html',
  styleUrls: ['./simple-tag-modal.component.css']
})
export class SimpleTagModalComponent {
  @Input() data: { key: string; value: string } | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
