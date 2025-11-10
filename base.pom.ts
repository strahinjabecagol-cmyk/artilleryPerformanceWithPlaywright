import { UtilPlaywright } from "./utilities/utilPlaywright";
import { Page, Expect } from '@playwright/test';

export class BasePom extends UtilPlaywright {
    protected page: Page;
    protected expect: Expect;
    protected url: string;

    constructor(page: Page, expect: Expect) {
        super(page);
        this.page = page;
        this.expect = expect;
        this.url = '';
    }

    async goto(): Promise<void> {
        await this.page.goto(this.url, { waitUntil: "domcontentloaded" });
    }

    async waitForPageToLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }
}
