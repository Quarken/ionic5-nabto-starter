import { Component, OnInit } from '@angular/core';
import { NabtoService } from '../nabto.service';
import { NabtoDevice } from '../device.class';
import { ToastController } from '@ionic/angular';
import { showToast } from '../util';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-device-settings',
  templateUrl: './device-settings.page.html',
  styleUrls: ['./device-settings.page.scss'],
})
export class DeviceSettingsPage implements OnInit {
  device: NabtoDevice;
  firstView = true;
  hideQr = true;
  securityMessage: string;
  qrInput: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard,
    private toastCtrl: ToastController,
    private nabtoService: NabtoService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation().extras.state;
      if (state?.device) {
        this.device = state.device;
      } else {
        console.error('Device settings page was loaded without a device.');
      }
    });
  }

  ionViewWillEnter() {
    this.readDeviceSecuritySettings();
    this.qrInput = JSON.stringify({
      i: this.device.id,
      n: this.device.name
    });
  }

  readDeviceSecuritySettings() {
    this.nabtoService.readAllSecuritySettings(this.device)
      .then(() => this.updateSecurityMessage())
      .catch((error) => {
        showToast(this.toastCtrl, 'Could not read security settings: ' + error.message);
      });
  }

  updateSecurityMessage() {
    if (this.device.openForPairing) {
      this.securityMessage = 'This device is currently open for pairing to grant new guests access.';
    } else {
      this.securityMessage = 'This device is closed for pairing, change this to grant new guests access.';
    }
  }

  copyDeviceId() {
    this.clipboard.copy(this.device.id);
    showToast(this.toastCtrl, `Device id copied to clipboard`);
  }

  saveProperties() {
    this.nabtoService.setSystemInfo(this.device)
      .then(() => {
        showToast(this.toastCtrl, 'Device updated!');
      }).catch((error) => {
        showToast(this.toastCtrl, error.message);
      });
  }

  toggleQr() {
    this.hideQr = !this.hideQr;
  }
}
