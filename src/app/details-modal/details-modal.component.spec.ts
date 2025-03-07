import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsModalComponent } from './details-modal.component';

describe('SimpleTagModalComponent', () => {
  let component: DetailsModalComponent;
  let fixture: ComponentFixture<DetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
