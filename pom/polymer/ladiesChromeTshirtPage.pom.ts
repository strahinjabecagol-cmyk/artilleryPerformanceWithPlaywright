
import { Expect, Locator, Page } from "@playwright/test";
import { SingleItemBasePage } from "./singleItemBasePagePom";

export class LadiesChromeTshirtPage extends SingleItemBasePage {
    readonly pageTitleElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/detail/ladies_tshirts/Ladies+Chrome+T-Shirt';
        //selectors

        //elements
        this.pageTitleElement = this.page.getByRole('heading', { name: 'Ladies Chrome T-Shirt' });
    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }

}


