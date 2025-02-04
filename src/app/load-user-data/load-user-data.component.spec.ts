import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadUserDataComponent } from './load-user-data.component';

describe('LoadUserDataComponent', () => {
  let component: LoadUserDataComponent;
  let fixture: ComponentFixture<LoadUserDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadUserDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadUserDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
