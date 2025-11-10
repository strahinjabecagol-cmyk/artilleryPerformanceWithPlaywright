import { Expect, Page, Locator } from "@playwright/test";
import { OutwareBasePage } from "./outwareBasepage.pom.js";

export class MensTshirtsPage extends OutwareBasePage {
    protected page: Page;
    protected expect: Expect;
    protected url: string;
    readonly omiTechTee: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/list/mens_tshirts';
        this.page = page;
        this.expect = expect;
        //selectors

        //elements

        this.omiTechTee = this.page.getByAltText('Omi Tech Tee');
    }
    //functions
    async clickOmiTechTee() {
        await this.omiTechTee.click();

    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }
}


