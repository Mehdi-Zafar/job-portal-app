import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicWithNavLayout } from './public-with-nav-layout';

describe('PublicWithNavLayout', () => {
  let component: PublicWithNavLayout;
  let fixture: ComponentFixture<PublicWithNavLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicWithNavLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicWithNavLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
