import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { NabtoDevice } from '../device.class';
import { NabtoService } from '../nabto.service';
import { BookmarksService, Bookmark } from '../bookmarks.service';
import { showToast, RefreshEvent } from '../util';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationExtras } from '@angular/router';
import Customization from '../customization';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  recentIds: string[] = [];
  busy = false;
  deviceInfoSource: Subject<NabtoDevice[]>;
  devices: Observable<NabtoDevice[]>;

  constructor(
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private router: Router,
    private nabtoService: NabtoService,
    private bookmarksService: BookmarksService
  ) { }

  ngOnInit() {
    this.deviceInfoSource = new Subject<NabtoDevice[]>();
    this.devices = this.deviceInfoSource.asObservable();
  }

  ionViewDidEnter() {
    this.refresh();
    this.nabtoService.prepareInvoke(this.recentIds);
  }

  prepareDevices(ids: string[]) {
    this.nabtoService.prepareInvoke(ids).then(() => {
      // listview observes this.devices and will be populated as data is received
      this.nabtoService.getPublicInfo(ids.map((id) => new Bookmark(id)), this.deviceInfoSource);
      this.recentIds = ids;
    });
  }

  refresh(event?: RefreshEvent) {
    this.nabtoService.discover().then(ids => {
      if (event) { event.target.complete(); }
      this.prepareDevices(ids);
    })
      .catch(error => {
        showToast(this.toastCtrl, error.message);
        console.error(`Error at device discovery: ${JSON.stringify(error)}`);
        if (event) { event.target.complete(); }
      });
  }

  isAccessible(device: NabtoDevice) {
    return device.openForPairing || device.currentUserIsOwner;
  }

  handleAlreadyPairedDevice(dev: NabtoDevice) {
    showToast(this.toastCtrl, this.translate.instant('DISCOVER.TOAST_ALREADY_PAIRED'));
    // if the user has deleted bookmark, add again
    this.bookmarksService.addBookmarkFromDevice(dev);
    const extras: NavigationExtras = {
      state: {
        device: dev
      }
    };
    this.router.navigate([Customization.vendorPage], extras);
  }

  handleUnpairedDevice(dev: NabtoDevice) {
    const extras: NavigationExtras = {
      state: {
        device: dev
      }
    };
    this.router.navigate(['pairing'], extras);
  }

  async handleClosedDevice() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('DISCOVER.ALERT_CLOSED_DEVICE_HEADER'),
      message: this.translate.instant('DISCOVER.ALERT_CLOSED_DEVICE_BODY'),
      backdropDismiss: false,
      buttons: [this.translate.instant('OKAY')]
    });
    return await alert.present();
  }

  async handleNoInterfaceInfo(continueHandler: () => void) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('DISCOVER.ALERT_NO_INTERFACE_HEADER'),
      message: this.translate.instant('DISCOVER.ALERT_NO_INTERFACE_BODY'),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Continue',
          handler: continueHandler
        }
      ]
    });
    return await alert.present();
  }

  attemptPair(device: NabtoDevice) {
    if (device.openForPairing) {
      if (device.currentUserIsPaired) {
        this.handleAlreadyPairedDevice(device);
      } else {
        this.handleUnpairedDevice(device);
      }
    } else {
      if (device.currentUserIsPaired) {
        this.handleAlreadyPairedDevice(device);
      } else {
        this.handleClosedDevice();
      }
    }
  }

  itemTapped(device: NabtoDevice) {
    if (!device.reachable) {
      showToast(this.toastCtrl, device.description);
      return;
    }
    if (device.hasInterfaceInfo) {
      this.attemptPair(device);
    } else {
      this.handleNoInterfaceInfo(() => this.attemptPair(device));
    }
  }

  badImage(device: NabtoDevice) {
    console.log(`Found no icon for ${JSON.stringify(device)}`);
    device.setUnknownIcon();
  }
}
