
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '../../../shared/services/global-state-service';

@Component({
  selector: 'app-tag-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tag-modal.component.html',
  styleUrls: ['../styles/modal-shared.css', './tag-modal.component.css']
})
export class TagModalComponent implements OnInit, OnChanges {
  @Input() key: string = '';
  @Input() value: string = '';
  @Input() isEditable: boolean = false;
  @Input() currentTags: Record<string, string> = {};
  @Output() save = new EventEmitter<{ newKey: string, newValue: string }>();
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();
  showDeleteConfirmation: boolean = false;
  tagForm: FormGroup;
  tagValueFontSize: string = '16px'; // Default value

  constructor(private fb: FormBuilder, private globalStateService: GlobalStateService) {
    this.tagForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[\x21-\x7E]+$/)]],
      value: [''],
    });
  }

  ngOnInit(): void {
    this.updateFormValues();
    this.tagValueFontSize = this.globalStateService.getState().practiceSettings['tagValueFontSize'] || '16px';
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update form values when input properties change
    if (changes['key'] || changes['value'] || changes['currentTags']) {
      this.updateFormValues();

      // Reset delete confirmation when switching tags
      if (changes['key']) {
        this.showDeleteConfirmation = false;
      }
    }
  }

  private updateFormValues(): void {
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

  onKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
  }

  initiateDelete(): void {
    this.showDeleteConfirmation = true;
  }

  confirmDelete(): void {
    this.delete.emit(this.key);
    this.showDeleteConfirmation = false;
    this.closeModal();
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
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
