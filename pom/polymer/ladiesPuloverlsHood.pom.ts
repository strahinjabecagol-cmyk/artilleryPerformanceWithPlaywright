
import { SingleItemBasePage } from "./singleItemBasePagePom";
import { Page, Expect, Locator } from "@playwright/test"
export class LadiesPulloverlsHoodPage extends SingleItemBasePage {
    protected page: Page;
    protected expect: Expect;
    protected url: string;
    readonly pageTitleElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/detail/ladies_outerwear/Ladies+Pullover+L+S+Hood';
        this.page = page;
        this.expect = expect;
        //selectors

        //elements

        this.pageTitleElement = this.page.getByRole('heading', { name: 'Ladies Pullover L/S Hood' })
    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }

}


