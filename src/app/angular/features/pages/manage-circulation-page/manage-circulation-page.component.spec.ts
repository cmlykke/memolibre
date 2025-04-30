import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCirculationPageComponent } from './manage-circulation-page.component';

describe('ManageCirculationPageComponent', () => {
  let component: ManageCirculationPageComponent;
  let fixture: ComponentFixture<ManageCirculationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCirculationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCirculationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
