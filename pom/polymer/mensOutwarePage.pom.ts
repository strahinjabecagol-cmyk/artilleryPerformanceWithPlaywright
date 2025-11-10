import { OutwareBasePage } from "./outwareBasepage.pom.js";
import { Page, Expect, Locator } from "@playwright/test";

export class MensOutwarePage extends OutwareBasePage {
    protected page: Page;
    protected expect: Expect;
    protected url: string;
    readonly vastrmHoodie: Locator;
    readonly pageTitleElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/list/mens_outerwear';
        this.page = page;
        this.expect = expect;
        //selectors

        //elements

        this.vastrmHoodie = this.page.getByAltText('Vastrm Hoodie');
        this.pageTitleElement = this.page.getByText('Men\'s Outerwear').first();
    }
    //functions
    async clickVastrmHoodie() {
        await this.vastrmHoodie.click();

    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }
}


