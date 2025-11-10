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

}


