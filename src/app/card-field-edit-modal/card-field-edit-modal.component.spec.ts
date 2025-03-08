import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFieldEditModalComponent } from './card-field-edit-modal.component';

describe('CardFieldEditModalComponent', () => {
  let component: CardFieldEditModalComponent;
  let fixture: ComponentFixture<CardFieldEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFieldEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFieldEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
