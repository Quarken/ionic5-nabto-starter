import { Component, OnInit } from '@angular/core';
import { NabtoDevice } from '../device.class';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { NabtoService } from '../nabto.service';
import { showToast } from '../util';
import { TranslateService } from '@ngx-translate/core';

declare var NabtoError;

enum DeviceMode {
  COOL = 0,
  HEAT = 1,
  CIRCULATE = 2,
  DEHUMIDIFY = 3
}

// TODO: Busy loader

@Component({
  selector: 'app-vendor-heating',
  templateUrl: './vendor-heating.page.html',
  styleUrls: ['./vendor-heating.page.scss'],
})
export class VendorHeatingPage implements OnInit {
  device: NabtoDevice;
  activated: boolean;
  offline: boolean;
  temperature: number;
  mode: string;
  roomTemperature: number;
  minTemp: number;
  maxTemp: number;

  busyCtx: {
    busy: boolean;
    timer: number;
    loading: HTMLIonLoadingElement;
  };

  // TODO: localization
  unavailableStatus: string;

  constructor(
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController,
    private nabtoService: NabtoService
  ) {
    this.temperature = undefined;
    this.activated = false;
    this.offline = true;
    this.mode = undefined;
    this.maxTemp = 30;
    this.minTemp = 16;
    this.busyCtx = {
      busy: false,
      timer: undefined,
      loading: undefined
    };
  }

  DeviceModeKeys() {
    const keys = Object.values(DeviceMode);
    return keys.slice(0, keys.length / 2);
  }

  ngOnInit() {
    this.loadingCtrl.create({
      message: this.translate.instant('HEATING.LOADING')
    }).then(loading => this.busyCtx.loading = loading);
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation().extras.state;
      if (state && state.device) {
        this.device = state.device;
      } else {
        // TODO: Logging?
      }
    });
  }

  refresh() {
    this.busyBegin();
    this.nabtoService.invokeRpc(this.device.id, 'heatpump_get_full_state.json')
      .then(state => {
        this.busyEnd();
        console.log(`Got new heatpump state: ${JSON.stringify(state)}`);
        this.activated = state.activated;
        this.offline = false;
        this.mode = this.mapDeviceMode(state.mode);
        this.temperature = this.mapDeviceTemp(state.target_temperature);
        this.roomTemperature = state.room_temperature;
        if (!this.activated) {
          this.unavailableStatus = 'Powered off';
        }
      }).catch(error => {
        this.busyEnd();
        this.handleError(error);
      });
  }

  activationToggled() {
    this.busyBegin();
    this.nabtoService.invokeRpc(
      this.device.id,
      'heatpump_set_activation_state.json',
      { activated: this.activated ? 1 : 0 }
    ).then((state: any) => {
      this.busyEnd();
      this.activated = state.activated;
      if (!this.activated) {
        this.unavailableStatus = 'Powered off';
      }
    }).catch(error => {
      this.busyEnd();
      this.handleError(error);
    });
  }

  tempChanged(temp: number) {
    this.temperature = temp;
    this.updateTargetTemperature();
  }

  increment() {
    if (this.activated) { // we cannot disable tap events on icon in html
      if (this.temperature < this.maxTemp) {
        this.temperature++;
      }
      this.updateTargetTemperature();
    }
  }

  decrement() {
    if (this.activated) { // we cannot disable tap events on icon in html
      if (this.temperature > this.minTemp) {
        this.temperature--;
      }
      this.updateTargetTemperature();
    }
  }

  updateTargetTemperature() {
    this.nabtoService.invokeRpc(
      this.device.id,
      'heatpump_set_target_temperature.json',
      { temperature: this.temperature }
    ).then((state: any) => {
      this.temperature = state.temperature;
    }).catch(error => {
      this.handleError(error);
    });
  }

  updateMode() {
    this.busyBegin();
    this.nabtoService.invokeRpc(
      this.device.id,
      'heatpump_set_mode.json',
      { mode: this.mapToDeviceMode(this.mode) }
    ).then((state: any) => {
      this.busyEnd();
      this.mode = this.mapDeviceMode(state.mode);
    }).catch(error => {
      this.busyEnd();
      this.handleError(error);
    });
  }

  mapDeviceMode(mode: DeviceMode): string {
    return DeviceMode[mode] || '';
  }

  mapToDeviceMode(mode: string): DeviceMode {
    return DeviceMode[mode] || -1;
  }

  mapDeviceTemp(tempFromDevice: number) {
    return Math.min(Math.max(tempFromDevice, this.minTemp), this.maxTemp);
  }

  handleError(error) {
    if (error.code == NabtoError.Code.API_RPC_DEVICE_OFFLINE) {
      this.unavailableStatus = 'Device offline';
      this.offline = true;
    } else {
      console.error(`ERROR invoking device: ${JSON.stringify(error)}`);
    }
    showToast(this.toastCtrl, error.message);
  }

  available() {
    return this.activated && !this.offline;
  }

  unavailable() {
    return !this.activated || this.offline;
  }

  busyBegin() {
    if (!this.busyCtx.busy) {
      this.busyCtx.busy = true;
      this.busyCtx.timer = window.setTimeout(() => {
        if (this.busyCtx.loading && this.busyCtx.busy) {
          this.busyCtx.loading.present();
        }
      }, 500);
    }
  }

  busyEnd() {
    this.busyCtx.busy = false;
    if (this.busyCtx.timer) {
      clearTimeout(this.busyCtx.timer);
      this.busyCtx.timer = undefined;
    }
    if (this.busyCtx.loading) {
      this.busyCtx.loading.dismiss();
    }
  }
}
