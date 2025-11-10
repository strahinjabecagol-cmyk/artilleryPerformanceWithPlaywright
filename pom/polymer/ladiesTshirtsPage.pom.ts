import { Expect, Locator, Page } from "@playwright/test";
import { OutwareBasePage } from "./outwareBasepage.pom.js";

export class LadiesTshirtsPage extends OutwareBasePage {
    readonly ladiesChromeTshirtElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/list/ladies_tshirts';
        //selectors

        //elements
        this.ladiesChromeTshirtElement = this.page.getByAltText('Ladies Chrome T-Shirt');

    }
    //functions

    async clickLadiesChromeTshirtElement() {
        await this.ladiesChromeTshirtElement.click();

    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }
}


