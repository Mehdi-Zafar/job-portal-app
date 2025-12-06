import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindJobs } from './find-jobs';

describe('FindJobs', () => {
  let component: FindJobs;
  let fixture: ComponentFixture<FindJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
