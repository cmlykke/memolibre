import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-field-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-field-edit-modal.component.html',
  styleUrls: ['../styles/modal-shared.css', './card-field-edit-modal.component.css']
})
export class CardFieldEditModalComponent {
  @Input() field: 'primaryInfo' | 'secondaryInfo' | null = null;
  @Input() currentValue: string = '';
  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  editedValue: string = '';

  ngOnInit() {
    this.editedValue = this.currentValue;
  }

  getFieldDisplayName(): string {
    return this.field === 'primaryInfo' ? 'Primary Info' : 'Secondary Info';
  }

  saveField(): void {
    this.save.emit(this.editedValue);
  }

  closeModal(): void {
    this.close.emit();
  }
}
