import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalInfoCardComponent } from './total-info-card.component';

describe('TotalInfoCardComponent', () => {
  let component: TotalInfoCardComponent;
  let fixture: ComponentFixture<TotalInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TotalInfoCardComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
