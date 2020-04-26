import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AclAddPage } from './acl-add.page';

describe('AclAddPage', () => {
  let component: AclAddPage;
  let fixture: ComponentFixture<AclAddPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AclAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AclAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
