import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowFpQrPage } from './show-fp-qr.page';

describe('ShowFpQrPage', () => {
  let component: ShowFpQrPage;
  let fixture: ComponentFixture<ShowFpQrPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowFpQrPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowFpQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
