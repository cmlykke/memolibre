import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeckComponent } from './create-deck-component.component';

describe('CreateDeckComponentComponent', () => {
  let component: CreateDeckComponent;
  let fixture: ComponentFixture<CreateDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
