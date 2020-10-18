import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationsComponent } from './donations.component';

describe('DonationsComponent', () => {
  let component: DonationsComponent;
  let fixture: ComponentFixture<DonationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
