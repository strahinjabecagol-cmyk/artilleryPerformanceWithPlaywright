import { Page, Locator } from '@playwright/test';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';

export class UtilQrCode {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getQRcodeText(locator: Locator) {
        let qrCodeBuffer = await locator.screenshot();
        const image = await Jimp.read(qrCodeBuffer);
        const { data, width, height } = image.bitmap;
        const code = jsQR(new Uint8ClampedArray(data), width, height);

        if (!code) {
            throw new Error('Failed to decode QR code');
        }

        //console.log('Decoded QR text:', code.data);
        return code.data;
    }



}