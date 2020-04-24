import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeviceSettingsPage } from './device-settings.page';

describe('DeviceSettingsPage', () => {
  let component: DeviceSettingsPage;
  let fixture: ComponentFixture<DeviceSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
