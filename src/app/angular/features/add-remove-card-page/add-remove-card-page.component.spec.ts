import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRemoveCardPageComponent } from './add-remove-card-page.component';

describe('AddRemoveCardPageComponent', () => {
  let component: AddRemoveCardPageComponent;
  let fixture: ComponentFixture<AddRemoveCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRemoveCardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRemoveCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
