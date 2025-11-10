import { expect, Page } from '@playwright/test'
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

export async function goToPolymerHomePage(test: any, page: Page) {
    const polymerHomePage = new HomePage(page, expect);
    await polymerHomePage.goto();
};

export async function addVastrimHoodieToCart(test: any, page: Page) {
    const mensOutwarePage = new MensOutwarePage(page, expect);
    const vastrimHoodiePage = new VastrimHoodiePage(page, expect);
    await mensOutwarePage.clickVastrmHoodie();
    await vastrimHoodiePage.changeSizeToXL();
    await vastrimHoodiePage.changeQuantityTo2();
    await vastrimHoodiePage.addToCart();
    await vastrimHoodiePage.dismissAddedToCartPopup();
};

export async function addLadiesPuloverToCart(test: any, page: Page) {
    const vastrimHoodiePage = new VastrimHoodiePage(page, expect);
    const ladiesOutwaraPage = new LadiesOutwarePage(page, expect);
    const ladiesPuloverlsHoodPage = new LadiesPulloverlsHoodPage(page, expect);
    await vastrimHoodiePage.clickLadiesOutwareLink();
    await ladiesOutwaraPage.clickladiesPulover();
    await ladiesPuloverlsHoodPage.changeSizeToXL();
    await ladiesPuloverlsHoodPage.changeQuantityTo2();
    await ladiesPuloverlsHoodPage.addToCart();
    await ladiesPuloverlsHoodPage.dismissAddedToCartPopup();
};

export async function addOmiTechTeeToCart(test: any, page: Page) {
    const ladiesPuloverlsHoodPage = new LadiesPulloverlsHoodPage(page, expect);
    const mensTshirtspage = new MensTshirtsPage(page, expect);
    const omiTechTeePage = new OmiTechTeePage(page, expect);
    await ladiesPuloverlsHoodPage.clickMensTshirtsLink();
    await mensTshirtspage.verifyThatThePageHasTitle();
    await mensTshirtspage.clickOmiTechTee();
    await omiTechTeePage.verifyThatThePageHasTitle();
    await omiTechTeePage.changeSizeToXL();
    await omiTechTeePage.changeQuantityTo2();
    await omiTechTeePage.addToCart();
    await omiTechTeePage.verifyThatAddedToCartPopupHasDisplayed();
    await omiTechTeePage.dismissAddedToCartPopup();
};

export async function addLadiesChromeTeeToCart(test: any, page: Page) {
    const omiTechTeePage = new OmiTechTeePage(page, expect);
    const ladiesTshirtsPage = new LadiesTshirtsPage(page, expect);
    const ladiesChromeTshirtPage = new LadiesChromeTshirtPage(page, expect);
    await omiTechTeePage.clickLadiesTshirtsLink();
    await ladiesTshirtsPage.verifyThatThePageHasTitle();
    await ladiesTshirtsPage.clickLadiesChromeTshirtElement();
    await ladiesChromeTshirtPage.verifyThatThePageHasTitle();
    await ladiesChromeTshirtPage.changeSizeToXL();
    await ladiesChromeTshirtPage.changeQuantityTo2();
    await ladiesChromeTshirtPage.addToCart();
    await ladiesChromeTshirtPage.verifyThatAddedToCartPopupHasDisplayed();
};

export async function goToCartAndVerifyItems(test: any, page: Page) {
    const ladiesChromeTshirtPage = new LadiesChromeTshirtPage(page, expect);
    const polymerCartPage = new CartPage(page, expect);
    await ladiesChromeTshirtPage.clickViewCartButtonOnPopup();
    await polymerCartPage.verifyThatThePageHasTitle();
    await polymerCartPage.checkIfvestrimHoddieExist();
    await polymerCartPage.checkIfladiesPuloverExist();
    await polymerCartPage.checkIomiTechTExist();
    await polymerCartPage.checkIfladiesChromeTExist();
};
