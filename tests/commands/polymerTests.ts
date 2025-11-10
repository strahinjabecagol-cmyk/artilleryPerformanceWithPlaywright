import { test, expect, Page } from '@playwright/test'
import { HomePage } from '../../pom/polymer/homePage.pom';
import { MensOutwarePage } from '../../pom/polymer/mensOutwarePage.pom';
import { VastrimHoodiePage } from '../../pom/polymer/vastrimHoodie.pom';    
import { LadiesOutwarePage } from '../../pom/polymer/ladiesOutwarePage.pom';
import { LadiesPulloverlsHoodPage } from '../../pom/polymer/ladiesPuloverlsHood.pom';
import { MensTshirtsPage } from '../../pom/polymer/mensTshirtsPage.pom';
import { OmiTechTeePage } from '../../pom/polymer/omiTechTee.pom';
import { LadiesChromeTshirtPage } from '../../pom/polymer/ladiesChromeTshirtPage.pom';
import { CartPage } from '../../pom/polymer/cartPage.pom';
import { LadiesTshirtsPage } from '../../pom/polymer/ladiesTshirtsPage.pom';

export async function polymerShopE2e(test: any, page: Page) {
    // Initialize all page objects
    const polymerHomePage = new HomePage(page, expect);
    const mensOutwarePage = new MensOutwarePage(page, expect);
    const vastrimHoodiePage = new VastrimHoodiePage(page, expect);
    const ladiesOutwaraPage = new LadiesOutwarePage(page, expect);
    const ladiesPuloverlsHoodPage = new LadiesPulloverlsHoodPage(page, expect);
    const mensTshirtspage = new MensTshirtsPage(page, expect);
    const omiTechTeePage = new OmiTechTeePage(page, expect);
    const ladiesTshirtsPage = new LadiesTshirtsPage(page, expect);
    const ladiesChromeTshirtPage = new LadiesChromeTshirtPage(page, expect);
    const polymerCartPage = new CartPage(page, expect);

    await test.step("Go to home page and verify that the all required categories are displayed", async () => {
        await polymerHomePage.goto();
        await polymerHomePage.checkIfTheMensOutwareLinkExist();
        await polymerHomePage.checkIfTheLadiesOutwareLinkExist();
        await polymerHomePage.checkIfTheMensTshirtsLinkExist();
        await polymerHomePage.checkIfTheLadiesTshirtsLinkExist();
        await polymerHomePage.checkIfTheMensOutwareSectionExist();
        await polymerHomePage.checkIfTheLadiesOutwareSectionExist();
        await polymerHomePage.checkIfTheMensTshirtsSectionExist();
        await polymerHomePage.checkIfTheLadiesTshirtsSectionExist();
    });

    await test.step("Go to Vastrim Hoodie page and add the hoodie to the cart", async () => {
        await polymerHomePage.clickMensOutwareLink();
        await mensOutwarePage.verifyThatThePageHasTitle();
        await mensOutwarePage.clickVastrmHoodie();
        await vastrimHoodiePage.verifyThatThePageHasTitle();
        await vastrimHoodiePage.changeSizeToXL();
        await vastrimHoodiePage.changeQuantityTo2();
        await vastrimHoodiePage.addToCart();
        await vastrimHoodiePage.verifyThatAddedToCartPopupHasDisplayed();
        await vastrimHoodiePage.dismissAddedToCartPopup();
    });

    await test.step("Go to ladies outware and add the Ladies pulover to the cart", async () => {
        await vastrimHoodiePage.clickLadiesOutwareLink();
        await ladiesOutwaraPage.verifyThatThePageHasTitle();
        await ladiesOutwaraPage.clickladiesPulover();
        await ladiesPuloverlsHoodPage.verifyThatThePageHasTitle();
        await ladiesPuloverlsHoodPage.changeSizeToXL();
        await ladiesPuloverlsHoodPage.changeQuantityTo2();
        await ladiesPuloverlsHoodPage.addToCart();
        await ladiesPuloverlsHoodPage.verifyThatAddedToCartPopupHasDisplayed();
        await ladiesPuloverlsHoodPage.dismissAddedToCartPopup();

    });

    await test.step("Go to mens T shirts and add omi tech Tee to the cart", async () => {
        await ladiesPuloverlsHoodPage.clickMensTshirtsLink();
        await mensTshirtspage.verifyThatThePageHasTitle();
        await mensTshirtspage.clickOmiTechTee();
        await omiTechTeePage.verifyThatThePageHasTitle();
        await omiTechTeePage.changeSizeToXL();
        await omiTechTeePage.changeQuantityTo2();
        await omiTechTeePage.addToCart();
        await omiTechTeePage.verifyThatAddedToCartPopupHasDisplayed();
        await omiTechTeePage.dismissAddedToCartPopup();

    });

    await test.step("Go to Ladies T shirts page and add the", async () => {
        await omiTechTeePage.clickLadiesTshirtsLink();
        await ladiesTshirtsPage.verifyThatThePageHasTitle();
        await ladiesTshirtsPage.clickLadiesChromeTshirtElement();
        await ladiesChromeTshirtPage.verifyThatThePageHasTitle();
        await ladiesChromeTshirtPage.changeSizeToXL();
        await ladiesChromeTshirtPage.changeQuantityTo2();
        await ladiesChromeTshirtPage.addToCart();
        await ladiesChromeTshirtPage.verifyThatAddedToCartPopupHasDisplayed();

    });

    await test.step("Go to cart and confirm tha all the items are present in the cart", async () => {
        await ladiesChromeTshirtPage.clickViewCartButtonOnPopup();
        await polymerCartPage.verifyThatThePageHasTitle();
        await polymerCartPage.checkIfvestrimHoddieExist();
        await polymerCartPage.checkIfladiesPuloverExist();
        await polymerCartPage.checkIomiTechTExist();
        await polymerCartPage.checkIfladiesChromeTExist();

    });
}

