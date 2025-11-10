import { Page, Locator } from '@playwright/test';

export class UtilPlaywright {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Keyboard Functions
    async pressEnter(): Promise<void> {
        await this.page.keyboard.press('Enter');
    }

    async pressArrowUp(): Promise<void> {
        await this.page.keyboard.press('ArrowUp');
    }

    async pressArrowDown(): Promise<void> {
        await this.page.keyboard.press('ArrowDown');
    }

    async pressArrowLeft(): Promise<void> {
        await this.page.keyboard.press('ArrowLeft');
    }

    async pressArrowRight(): Promise<void> {
        await this.page.keyboard.press('ArrowRight');
    }

    // Returns the text content of a pseudo element ::before so you can assert against it
    async getTheBeforeContentOfPseudoElement(elementLocator: Locator): Promise<string | null> {
        return await elementLocator.evaluate((element) => {
            const computedStyle = window.getComputedStyle(element, '::before');
            return computedStyle.content;
        });
    }

    async waitForSeconds(seconds: number): Promise<void> {
        await this.page.waitForTimeout(seconds * 1000);
    }
    async mouseScrollDown500px() {
        await this.page.mouse.wheel(0, 500);

    }



}