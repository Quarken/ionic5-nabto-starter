import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PairingPage } from './pairing.page';

describe('PairingPage', () => {
  let component: PairingPage;
  let fixture: ComponentFixture<PairingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PairingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PairingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
