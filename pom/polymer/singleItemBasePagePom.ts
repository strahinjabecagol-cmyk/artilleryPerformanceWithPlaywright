import { Page, Locator, Expect } from '@playwright/test';
import { PolimerBasePom } from './polimerbase.pom';

export class SingleItemBasePage extends PolimerBasePom {
    protected url: string;
    protected page: Page;
    protected expect: Expect;
    readonly sizeSelectorElement: Locator;
    readonly quantitySelectorElement: Locator;
    readonly addToCartElement: Locator;
    readonly addedToCartPopupTitleElement: Locator;
    readonly dismissAddedToCartPopupButtonElement: Locator;
    readonly ladiesOutwareLinkElement: Locator;
    readonly menTshirtsLinkElement: Locator;
    readonly ladiesTshirtsLinkElement: Locator;
    readonly viewCartPopupButtonElement: Locator;

    constructor(page: Page, expect: Expect) {
        super(page, expect);
        this.url = '';
        this.page = page;
        this.expect = expect;
        this.sizeSelectorElement = this.page.getByLabel('Size');
        this.quantitySelectorElement = this.page.getByLabel('Quantity');
        this.addToCartElement = this.page.getByRole('button', { name: 'Add this item to cart' });
        this.addedToCartPopupTitleElement = this.page.getByText('Added to cart');
        this.dismissAddedToCartPopupButtonElement = this.page.locator('paper-icon-button #closeBtn');
        this.ladiesOutwareLinkElement = this.page.getByRole('link', { name: 'Ladies Outerwear' });
        this.menTshirtsLinkElement = this.page.getByRole('link', { name: "Men's T-Shirts" });
        this.ladiesTshirtsLinkElement = this.page.getByRole('link', { name: 'Ladies T-Shirts' });
        this.viewCartPopupButtonElement = this.page.getByText('View Cart');
    }

    async changeSizeToXL(): Promise<void> {
        await this.sizeSelectorElement.selectOption('XL');
    }

    async changeQuantityTo2(): Promise<void> {
        await this.quantitySelectorElement.selectOption('2');
    }

    async addToCart(): Promise<void> {
        await this.addToCartElement.click();
    }

    async verifyThatAddedToCartPopupHasDisplayed(): Promise<void> {
        await this.expect(this.page.getByRole('dialog')).toContainText('Added to cart');
    }

    async dismissAddedToCartPopup(): Promise<void> {
        await this.page.getByRole('button', { name: 'Close dialog' }).click();
    }

    async clickLadiesOutwareLink(): Promise<void> {
        await this.page.mouse.wheel(0, -500); // Firefox hack
        await this.ladiesOutwareLinkElement.click();
    }

    async clickMensTshirtsLink(): Promise<void> {
        await this.page.mouse.wheel(0, -500); // Firefox hack
        await this.menTshirtsLinkElement.click();
    }

    async clickLadiesTshirtsLink(): Promise<void> {
        await this.page.mouse.wheel(0, -500); // Firefox hack
        await this.ladiesTshirtsLinkElement.click();
    }

    async clickViewCartButtonOnPopup(): Promise<void> {
        await this.page.mouse.wheel(0, -500); // Firefox hack
        await this.viewCartPopupButtonElement.click();
    }
}
