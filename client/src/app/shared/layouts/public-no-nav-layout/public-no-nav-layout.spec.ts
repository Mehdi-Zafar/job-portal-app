import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicNoNavLayout } from './public-no-nav-layout';

describe('PublicNoNavLayout', () => {
  let component: PublicNoNavLayout;
  let fixture: ComponentFixture<PublicNoNavLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicNoNavLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicNoNavLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
