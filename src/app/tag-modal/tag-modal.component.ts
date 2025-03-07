import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditable ? 'Edit Tag' : 'View Tag' }}</h2>
        <form [formGroup]="tagForm" *ngIf="isEditable">
          <div>
            <label>Key:</label>
            <input formControlName="key" (input)="cleanKey($event)" />
            <div *ngIf="tagForm.get('key')?.invalid && tagForm.get('key')?.touched" class="error">
              <span *ngIf="tagForm.get('key')?.errors?.['required']">Key is required</span>
              <span *ngIf="tagForm.get('key')?.errors?.['pattern']">Key must contain only visible ASCII characters (no whitespace)</span>
              <span *ngIf="tagForm.get('key')?.errors?.['unique']">Tag key already exists</span>
            </div>
          </div>
          <div>
            <label>Value:</label>
            <textarea formControlName="value"></textarea>
          </div>
          <button (click)="saveTag()">Save</button>
        </form>
        <div *ngIf="!isEditable">
          <p><strong>Key:</strong> {{ key }}</p>
          <p><strong>Value:</strong></p>
          <div class="scrollable">
            <p>{{ value }}</p>
          </div>
        </div>
        <button (click)="closeModal()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['../styles/modal-shared.css', './tag-modal.component.css']
})
export class TagModalComponent implements OnInit {
  @Input() key: string = '';
  @Input() value: string = '';
  @Input() isEditable: boolean = false;
  @Input() currentTags: Record<string, string> = {};
  @Output() save = new EventEmitter<{ newKey: string, newValue: string }>();
  @Output() close = new EventEmitter<void>();
  tagForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tagForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[\x21-\x7E]+$/)]],
      value: [''],
    });
  }

  ngOnInit(): void {
    if (this.isEditable) {
      this.tagForm.setValue({ key: this.key, value: this.value });
      this.tagForm.get('key')?.setValidators([
        Validators.required,
        Validators.pattern(/^[\x21-\x7E]+$/),
        this.uniqueTagKeyValidator(this.currentTags, this.key)
      ]);
      this.tagForm.get('key')?.updateValueAndValidity();
    }
  }

  uniqueTagKeyValidator(currentTags: Record<string, string>, oldKey: string) {
    return (control: any) => {
      const newKey = control.value;
      if (newKey !== oldKey && currentTags.hasOwnProperty(newKey)) {
        return { unique: 'Tag key already exists' };
      }
      return null;
    };
  }

  cleanKey(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\s+/g, '');
    this.tagForm.get('key')?.setValue(cleaned);
  }

  saveTag(): void {
    if (this.tagForm.valid) {
      const newKey = this.tagForm.value.key;
      const newValue = this.tagForm.value.value;
      this.save.emit({ newKey, newValue });
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
