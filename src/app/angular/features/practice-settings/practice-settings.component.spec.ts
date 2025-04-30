import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeSettingsComponent } from './practice-settings.component';

describe('PracticeSettingsComponent', () => {
  let component: PracticeSettingsComponent;
  let fixture: ComponentFixture<PracticeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
