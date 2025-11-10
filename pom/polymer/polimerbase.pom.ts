import { UtilPlaywright } from "../../utilities/utilPlaywright"
import { Page, Expect, Locator } from '@playwright/test';

export class PolimerBasePom extends UtilPlaywright {
    protected page: Page;
    protected expect: Expect;
    protected url: string;

    constructor(page: Page, expect: Expect) {
        super(page);
        this.page = page;
        this.expect = expect;
        this.url = '';


    }

    async goto() {
        await this.page.goto(this.url, { waitUntil: "domcontentloaded" });

    }

    async waitForPageToLoad() {
        await this.page.waitForLoadState('networkidle');
    }
  



}