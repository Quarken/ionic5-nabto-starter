import { Component, OnInit } from '@angular/core';
import { NabtoService } from '../nabto.service';
import { NabtoDevice, DeviceUser } from '../device.class';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Observable, of as observableOf } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
})
export class SecurityPage implements OnInit {
  device?: NabtoDevice;
  aclSrc: DeviceUser[];
  acl: Observable<DeviceUser[]>;

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    private nabtoService: NabtoService
  ) {
    this.aclSrc = [];
    this.acl = observableOf(this.aclSrc);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state?.device) {
        this.device = state.device;
      } else {
        console.error('Security page was loaded without a device.');
      }
    });
  }

  ionViewWillEnter() {
    this.readAcl();
  }

  readAcl() {
    if (!this.device) { return; }
    this.nabtoService.invokeRpc(this.device.id, 'get_users.json', {
      count: 10,
      start: 0
    }).then(acl => {
      this.aclSrc.splice(0, this.aclSrc.length);
      for (const user of acl.users) {
        this.aclSrc.push(new DeviceUser(user));
      }
    }).catch(error => {
      // TODO: Handle error
    });
  }

  update() {
    if (!this.device) { return; }
    // TODO: Only invoke device if a user has tapped?
    console.log(`Updating security settings: ${JSON.stringify(this.device)}`);
    this.nabtoService.setSystemSecuritySettings(this.device)
      .then(() => console.log(`Updated settings:  + ${JSON.stringify(this.device)}`))
      .catch(error => {
        console.log(error.message);
        // TODO: Handle error
        // this.handleError("Could not update settings: " + error.message);
      });
  }

  async showAlert(msg: string, yesHandler: () => void, noHandler: () => void) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('CONFIRM'),
      message: msg,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          handler: noHandler
        },
        {
          text: this.translate.instant('YES'),
          handler: yesHandler
        }
      ]
    });
    return await alert.present();
  }

  aclEntryClicked(user: DeviceUser) {
    const extras: NavigationExtras = {
      state: {
        device: this.device,
        deviceUser: user
      }
    };
    this.router.navigate(['acl-edit'], extras);
  }

  addToAcl() {
    const extras: NavigationExtras = {
      state: {
        device: this.device
      }
    };
    this.router.navigate(['acl-add'], extras);
  }
}
