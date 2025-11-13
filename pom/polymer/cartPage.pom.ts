import { Expect, Locator, Page } from "@playwright/test";
import { PolimerBasePom } from "./polimerbase.pom.js";

export class CartPage extends PolimerBasePom {

    readonly pageTitleElement: Locator;
    readonly vestrimHoodie: Locator;
    readonly ladiesPulover: Locator;
    readonly omiTechT: Locator;
    readonly ladiesChromeT: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/cart';
        //selectors

        //elements
        this.pageTitleElement = this.page.getByRole('heading', { name: 'Your Cart' });
        this.vestrimHoodie = this.page.getByTitle('Vastrm Hoodie');
        this.ladiesPulover = this.page.getByTitle('Ladies Pullover L/S Hood');
        this.omiTechT = this.page.getByTitle('Omi Tech Tee');
        this.ladiesChromeT = this.page.getByTitle('Ladies Chrome T-Shirt');
    }
    //functions

    async checkIfvestrimHoddieExist() {
        await this.expect(this.vestrimHoodie).toBeVisible();


    }
    async checkIfladiesPuloverExist() {
        await this.expect(this.ladiesPulover).toBeVisible();


    }
    async checkIomiTechTExist() {
        await this.expect(this.omiTechT).toBeVisible();

    }

    async checkIfladiesChromeTExist() {
        await this.expect(this.ladiesChromeT).toBeVisible();

    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }


    async clickCheckoutButton() {
        await this.page.getByRole('link', { name: 'Checkout' }).click();
    }

    async fillinCheckoutForm(name: string, email: string, phone: string, address: string, city: string, zip: string, state: string,) {
        await this.page.getByLabel('Name').fill(name);
        await this.page.getByLabel('Email').fill(email);
        await this.page.getByRole('textbox', { name: 'Phone Number Account' }).fill(phone);
        await this.page.getByRole('textbox', { name: 'Card Number' }).fill('4242 4242 4242 4242');
        await this.page.getByRole('textbox', { name: 'CVV' }).fill('123');
        await this.page.getByRole('textbox', { name: 'Address Shipping Address' }).fill(address);
        await this.page.getByRole('textbox', { name: 'City Shipping Address' }).fill(city);
        await this.page.getByRole('textbox', { name: 'Zip/Postal Code Shipping' }).fill(zip);
        await this.page.getByRole('textbox', { name: 'State/Province Shipping' }).fill(state);



    }

    async placeTheOrder() {
        await this.page.getByRole('button', { name: 'Place Order' }).click();
    }

    async clickFinishButton() {
        this.page.getByRole('link', { name: 'Finish' }).click();
    }
}


