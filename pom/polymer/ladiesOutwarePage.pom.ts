import { Page, Locator, Expect } from "@playwright/test"
import { OutwareBasePage } from "./outwareBasepage.pom";

export class LadiesOutwarePage extends OutwareBasePage {
    protected url: string;
    protected page: Page;
    protected expect: Expect;
    readonly ladiesPuloverElement: Locator;

    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/list/ladies_outerwear';
        this.page = page;
        this.expect = expect;
        //selectors

        //elements
        this.ladiesPuloverElement = this.page.getByAltText('Ladies Pullover L/S Hood');
    }
    //functions

    async clickladiesPulover() {
        await this.ladiesPuloverElement.click();

    }
        async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }
    
}


