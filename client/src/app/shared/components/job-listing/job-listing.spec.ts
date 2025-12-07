import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobListing } from './job-listing';

describe('JobListing', () => {
  let component: JobListing;
  let fixture: ComponentFixture<JobListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
