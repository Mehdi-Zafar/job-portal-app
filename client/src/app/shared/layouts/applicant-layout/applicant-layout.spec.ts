import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantLayout } from './applicant-layout';

describe('ApplicantLayout', () => {
  let component: ApplicantLayout;
  let fixture: ComponentFixture<ApplicantLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
