import { Component, OnInit } from '@angular/core';
import { NabtoService } from '../nabto.service';
import { DeviceUser, NabtoDevice } from '../device.class';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastController, NavController } from '@ionic/angular';
import { showToast } from '../util';

@Component({
  selector: 'app-acl-edit',
  templateUrl: './acl-edit.page.html',
  styleUrls: ['./acl-edit.page.scss'],
})
export class AclEditPage implements OnInit {
  public translateParams = {
    name: '',
    product: ''
  };
  public user?: DeviceUser;
  public device?: NabtoDevice;
  public hasRemoteAccess: boolean;

  constructor(
    private navCtrl: NavController,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private nabtoService: NabtoService
  ) {
    this.hasRemoteAccess = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state?.device && state?.deviceUser) {
        this.device = state.device;
        this.user = state.deviceUser;
        this.hasRemoteAccess = state.deviceUser.hasRemoteAccess();
        this.updateTranslationParams();
      } else {
        console.error('ACL edit page was loaded without a device and a user.');
      }
    });
  }

  updatePermissions() {
    if (!this.user || !this.device) { return; }
    this.user.setRemoteAccessPermission(this.hasRemoteAccess);
    this.nabtoService.setUserPermissions(this.device, this.user)
      .then((user: DeviceUser) => {
        this.user = user;
        this.updateTranslationParams();
      })
      .catch(error => {
        console.error(error.message);
        showToast(this.toastCtrl, this.translate.instant('ACL_EDIT.TOAST_FAIL_UPDATE') + error.message);
      });
  }

  updateName() {
    if (!this.user || !this.device) { return; }
    console.log('Updating name ' + this.user.name);
    this.nabtoService.setUserName(this.device, this.user)
      .then((user: DeviceUser) => {
        this.user = user;
        this.updateTranslationParams();
        console.log('Updated user: ' + JSON.stringify(this.user));
      })
      .catch(error => {
        console.error(error.message);
        showToast(this.toastCtrl, this.translate.instant('ACL_EDIT.TOAST_FAIL_UPDATE') + error.message);
      });
  }

  removeUser() {
    if (!this.user || !this.device) { return; }
    console.log('Removing user (TODO) ' + this.user.name);
    this.nabtoService.removeUser(this.device, this.user)
      .then((status: number) => {
        if (status == 0) {
          this.navCtrl.pop();
        } else {
          showToast(this.toastCtrl, this.translate.instant('ACL_EDIT.TOAST_FAIL_DELETE_STATUS') + status);
        }
      })
      .catch(error => {
        console.error(error.message);
        showToast(this.toastCtrl, this.translate.instant('ACL_EDIT.TOAST_FAIL_DELETE') + error.message);
      });
  }

  updateTranslationParams() {
    if (!this.user || !this.device) { return; }
    this.translateParams.name = this.user.name;
    this.translateParams.product = this.device.product;
  }
}
