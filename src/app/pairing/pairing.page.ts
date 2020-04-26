import { Component, OnInit } from '@angular/core';
import { NabtoDevice, DeviceUser } from '../device.class';
import { Device } from '@ionic-native/device/ngx';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ProfileService } from '../profile.service';
import { BookmarksService } from '../bookmarks.service';
import { NabtoService } from '../nabto.service';
import { ToastController } from '@ionic/angular';
import { showToast } from '../util';
import Customization from '../customization';

@Component({
  selector: 'app-pairing',
  templateUrl: './pairing.page.html',
  styleUrls: ['./pairing.page.scss'],
})
export class PairingPage implements OnInit {
  device?: NabtoDevice;
  platform: string;
  isPairing = false;
  success = false;

  constructor(
    public toastCtrl: ToastController,
    private hostDevice: Device,
    private route: ActivatedRoute,
    private router: Router,
    private nabtoService: NabtoService,
    private profileService: ProfileService,
    private bookmarksService: BookmarksService
  ) {
    this.platform = '';
  }

  ngOnInit() {
    this.platform = this.hostDevice.platform;
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state?.device) {
        this.device = state.device;
      } else {
        // TODO: Logging?
      }
    });
  }

  pair() {
    this.isPairing = true;
    this.profileService.lookupKeyPairName()
      .then((name) => {
        if (!this.device) { return; }
        return this.nabtoService.pairWithCurrentUser(this.device, name);
      })
      .then((user?: DeviceUser) => {
        if (!this.device || !user) { return; }
        this.writeBookmark();
        this.success = true;
        this.device.currentUserIsOwner = user.isOwner();
      })
      .catch(error => {
        this.handleError(error);
      });
  }

  handleError(error: any) {
    showToast(this.toastCtrl, error.message, true);
  }

  writeBookmark() {
    if (!this.device) { return; }
    this.bookmarksService.addBookmarkFromDevice(this.device);
  }

  showVendorPage() {
    const extras: NavigationExtras = {
      state: {
        device: this.device
      }
    };
    this.router.navigate([Customization.vendorPage], extras);
  }
}
