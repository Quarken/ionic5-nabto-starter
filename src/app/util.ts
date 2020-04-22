import { ToastController } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';

export async function showToast(toastCtrl: ToastController, msg: string, stayOnScreen = false) {
    const options: ToastOptions = {
        message: msg,
        buttons: [
            {
                side: 'end',
                icon: 'close-outline',
                role: 'cancel'
            }
        ]
    };

    if (!stayOnScreen) {
        options.duration = 3000;
    }

    const toast = await toastCtrl.create(options);
    toast.present();
}
