import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AclEditPage } from './acl-edit.page';

describe('AclEditPage', () => {
  let component: AclEditPage;
  let fixture: ComponentFixture<AclEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AclEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AclEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
