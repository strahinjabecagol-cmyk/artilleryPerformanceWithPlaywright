import { Page, Locator, expect as PlaywrightExpect } from '@playwright/test';
import { PolimerBasePom } from './polimerbase.pom';

export class HomePage extends PolimerBasePom {
    url: string;
    mensOutwareLinkElement: Locator;
    ladiesOutwareLinkElement: Locator;
    mensTshirtsLinkElement: Locator;
    ladiesTshirtsLinkElement: Locator;
    mensOutwareSectionElement: Locator;
    ladiesOutwareSectionElement: Locator;
    mensTshirtsSectionElement: Locator;
    ladiesTshirtsSectionElement: Locator;

    constructor(page: Page, expect: typeof PlaywrightExpect) {
        super(page, expect);
        this.url = 'https://shop.polymer-project.org/';

        this.mensOutwareLinkElement = this.page.locator('shop-tabs shop-tab').first();
        this.ladiesOutwareLinkElement = this.page.locator('shop-tabs shop-tab').nth(1);
        this.mensTshirtsLinkElement = this.page.locator('shop-tabs shop-tab').nth(2);
        this.ladiesTshirtsLinkElement = this.page.locator('shop-tabs shop-tab').last();
        this.mensOutwareSectionElement = this.page.locator('shop-home div h2').first();
        this.ladiesOutwareSectionElement = this.page.locator('shop-home div h2').nth(1);
        this.mensTshirtsSectionElement = this.page.locator('shop-home div h2').nth(2);
        this.ladiesTshirtsSectionElement = this.page.locator('shop-home div h2').last();
    }

    async checkIfTheMensOutwareLinkExist(): Promise<void> {
        await this.expect(this.mensOutwareLinkElement).toBeVisible();
    }

    async checkIfTheLadiesOutwareLinkExist(): Promise<void> {
        await this.expect(this.ladiesOutwareLinkElement).toBeVisible();
    }

    async checkIfTheMensTshirtsLinkExist(): Promise<void> {
        await this.expect(this.mensTshirtsLinkElement).toBeVisible();
    }

    async checkIfTheLadiesTshirtsLinkExist(): Promise<void> {
        await this.expect(this.ladiesTshirtsLinkElement).toBeVisible();
    }

    async checkIfTheMensOutwareSectionExist(): Promise<void> {
        await this.expect(this.mensOutwareSectionElement).toBeVisible();
    }

    async checkIfTheLadiesOutwareSectionExist(): Promise<void> {
        await this.expect(this.ladiesOutwareSectionElement).toBeVisible();
    }

    async checkIfTheMensTshirtsSectionExist(): Promise<void> {
        await this.expect(this.mensTshirtsSectionElement).toBeVisible();
    }

    async checkIfTheLadiesTshirtsSectionExist(): Promise<void> {
        await this.expect(this.ladiesTshirtsSectionElement).toBeVisible();
    }

    async clickMensOutwareLink(): Promise<void> {
        await this.mensOutwareLinkElement.click();
    }
}