import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChestionarComponent } from './chestionar.component';

describe('ChestionarComponent', () => {
  let component: ChestionarComponent;
  let fixture: ComponentFixture<ChestionarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChestionarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChestionarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
