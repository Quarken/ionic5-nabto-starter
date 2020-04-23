import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VendorHeatingPage } from './vendor-heating.page';

describe('VendorHeatingPage', () => {
  let component: VendorHeatingPage;
  let fixture: ComponentFixture<VendorHeatingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorHeatingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorHeatingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
