import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTagModalComponent } from './simple-tag-modal.component';

describe('SimpleTagModalComponent', () => {
  let component: SimpleTagModalComponent;
  let fixture: ComponentFixture<SimpleTagModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleTagModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleTagModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
