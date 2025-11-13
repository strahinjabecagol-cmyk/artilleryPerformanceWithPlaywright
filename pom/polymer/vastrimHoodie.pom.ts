
import { Expect, Page, Locator } from "@playwright/test";
import { SingleItemBasePage } from "./singleItemBasePagePom";

export class VastrimHoodiePage extends SingleItemBasePage {
    protected page: Page;
    protected expect: Expect;
    protected url: string;
    readonly pageTitleElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/detail/mens_outerwear/Vastrm+Hoodie';
        this.page = page;
        this.expect = expect;
        //selectors

        //elements
        this.pageTitleElement = this.page.getByRole('heading', { name: 'Vastrm Hoodie' });
    }

    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }

    
}


