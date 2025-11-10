
import { Expect, Page, Locator } from "@playwright/test";
import { SingleItemBasePage } from "./singleItemBasePagePom";

export class OmiTechTeePage extends SingleItemBasePage {
    protected page: Page;
    protected expect: Expect;
    readonly pageTitleElement: Locator;
    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/detail/mens_tshirts/Omi+Tech+Tee';
        this.page = page;
        this.expect = expect;

        //elements
        this.pageTitleElement = this.page.getByRole('heading', { name: 'Omi Tech Tee' });

    }
    async verifyThatThePageHasTitle() {
        await this.expect(this.pageTitleElement).toBeVisible();

    }
}


