import { Page, Locator, Expect } from '@playwright/test';
import { PolimerBasePom } from './polimerbase.pom';

export class OutwareBasePage extends PolimerBasePom {

    protected page: Page;
    protected expect: Expect;
    protected url: string;
    readonly pageTitleElement: Locator;

    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = '';
        this.page = page;
        this.expect = expect;
        this.pageTitleElement = this.page.locator('shop-list header h1');
    }

    async verifyPageTitle(text: string | RegExp): Promise<void> {
        await this.expect(this.pageTitleElement).toHaveText(text);
    }
}