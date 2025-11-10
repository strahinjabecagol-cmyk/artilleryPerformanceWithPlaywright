import { test as base, expect } from '@playwright/test';
// import { CalculatorPom } from './pom/calc/calcPage.pom';
// import { MenuPage } from './pom/coffe/menuPage.pom';
// import { CartPage } from './pom/coffe/cartpage.pom';
// import { ToDoLiBasePage } from './pom/toDoLi/toDoLi.pom';
// import { DynamicTablePage } from './pom/dynamicTablePage/dynamicTablePage.pom';
// import { OnboardingModalPage } from './pom/onboarding/onboardingPage.pom';
import { HomePage } from './pom/polymer/homePage.pom';
import { LadiesOutwarePage } from './pom/polymer/ladiesOutwarePage.pom';
import { MensOutwarePage } from './pom/polymer/mensOutwarePage.pom';
import { VastrimHoodiePage } from './pom/polymer/vastrimHoodie.pom';
import { LadiesPulloverlsHoodPage } from './pom/polymer/ladiesPuloverlsHood.pom'
import { MensTshirtsPage } from './pom/polymer/mensTshirtsPage.pom'
import { OmiTechTeePage } from './pom/polymer/omiTechTee.pom';
import { LadiesTshirtsPage } from './pom/polymer/ladiesTshirtsPage.pom';
import { LadiesChromeTshirtPage } from './pom/polymer/ladiesChromeTshirtPage.pom';
import { CartPage as PolymerCartPage } from './pom/polymer/cartPage.pom'
// import { RateStarsPage } from './pom/starts/rateStars.pom';
// import { ShadowDomPage } from './pom/shadowDom/shadowDom.pom';
// import { TagsPage } from './pom/tags/tagsPage.pom';
// import { VerifyAccountPage } from './pom/verifyAcc/verifyAccount.pom';
// import { PdfDownloadExamplePage } from './pom/PDFstuff/examplePdf.pom';
// import { UtiPDFhandler } from './utilities/utilPdfHandler';
// import { Smallpdf } from './pom/PDFstuff/smallpdf.pom';
// import { QrCodePage } from './pom/qrCOdeStuff/qrCodepage.pom';
// import { UtilQrCode } from './utilities/utilQrCode';
// import { SbecagolToDo } from './pom/sbecagolTodo/sbecagolToDo.ppom';
// import { SbecagolCalculatorPom } from './pom/calc/sbecagolCalculator.pom';

// Extend the base test with custom fixtures
export const test = base.extend<{
    // calculatorPage: CalculatorPom;
    // coffeMenyPage: MenuPage;
    // coffeCartPage: CartPage;
    // toDoLiBasePage: ToDoLiBasePage;
    // dynamicTablePage: DynamicTablePage;
    // onboardingModalPage: OnboardingModalPage;
    polymerHomePage: HomePage;
    ladiesOutwaraPage: LadiesOutwarePage;
    mensOutwarePage: MensOutwarePage;
    vastrimHoodiePage: VastrimHoodiePage;
    ladiesPuloverlsHoodPage: LadiesPulloverlsHoodPage;
    mensTshirtspage: MensTshirtsPage;
    omiTechTeePage: OmiTechTeePage;
    ladiesTshirtsPage: LadiesTshirtsPage;
    ladiesChromeTshirtPage: LadiesChromeTshirtPage;
    polymerCartPage: PolymerCartPage;
    // rateStarsPage: RateStarsPage;
    // shadowDomPage: ShadowDomPage;
    // tagsPage: TagsPage;
    // verifyAccountPage: VerifyAccountPage;
    // pdfDownloadExamplePage: PdfDownloadExamplePage
    // utilPdfHandler: UtiPDFhandler;
    // smallpdf: Smallpdf;
    // qrCodePage: QrCodePage;
    // utilQrCode: UtilQrCode;
    // sbecagolToDo: SbecagolToDo;
    // sbecagolCalculator: SbecagolCalculatorPom;
}>({
    // calculatorPage: async ({ page }, use) => {
    //     await use(new CalculatorPom(page, expect));
    // },
    // coffeMenyPage: async ({ page }, use) => {
    //     await use(new MenuPage(page, expect));
    // },
    // coffeCartPage: async ({ page }, use) => {
    //     await use(new CartPage(page, expect));
    // },
    // toDoLiBasePage: async ({ page }, use) => {
    //     await use(new ToDoLiBasePage(page, expect));
    // },
    // dynamicTablePage: async ({ page }, use) => {
    //     await use(new DynamicTablePage(page, expect));
    // },
    // onboardingModalPage: async ({ page }, use) => {
    //     await use(new OnboardingModalPage(page, expect));
    // },
    polymerHomePage: async ({ page }, use) => {
        await use(new HomePage(page, expect));
    },
    ladiesOutwaraPage: async ({ page }, use) => {
        await use(new LadiesOutwarePage(page, expect));
    },
    mensOutwarePage: async ({ page }, use) => {
        await use(new MensOutwarePage(page, expect));
    },
    vastrimHoodiePage: async ({ page }, use) => {
        await use(new VastrimHoodiePage(page, expect));
    },
    ladiesPuloverlsHoodPage: async ({ page }, use) => {
        await use(new LadiesPulloverlsHoodPage(page, expect));
    },
    mensTshirtspage: async ({ page }, use) => {
        await use(new MensTshirtsPage(page, expect));
    },
    omiTechTeePage: async ({ page }, use) => {
        await use(new OmiTechTeePage(page, expect));
    },
    ladiesTshirtsPage: async ({ page }, use) => {
        await use(new LadiesTshirtsPage(page, expect));
    },
    ladiesChromeTshirtPage: async ({ page }, use) => {
        await use(new LadiesChromeTshirtPage(page, expect));
    },
    polymerCartPage: async ({ page }, use) => {
        await use(new PolymerCartPage(page, expect));
    },
    // rateStarsPage: async ({ page }, use) => {
    //     await use(new RateStarsPage(page, expect));
    // },
    // shadowDomPage: async ({ page }, use) => {
    //     await use(new ShadowDomPage(page, expect));
    // },
    // tagsPage: async ({ page }, use) => {
    //     await use(new TagsPage(page, expect));
    // },
    // verifyAccountPage: async ({ page }, use) => {
    //     await use(new VerifyAccountPage(page, expect));
    // },
    // pdfDownloadExamplePage: async ({ page }, use) => {
    //     await use(new PdfDownloadExamplePage(page, expect));
    // },
    // utilPdfHandler: async ({ page }, use) => {
    //     await use(new UtiPDFhandler());
    // },
    // smallpdf: async ({ page }, use) => {
    //     await use(new Smallpdf(page, expect));
    // },
    // qrCodePage: async ({ page }, use) => {
    //     await use(new QrCodePage(page, expect));
    // },
    // utilQrCode: async ({ page }, use) => {
    //     await use(new UtilQrCode(page));
    // },
    // sbecagolToDo: async ({ page }, use) => {
    //     await use(new SbecagolToDo(page, expect));
    // },
    // sbecagolCalculator: async ({ page }, use) => {
    //     await use(new SbecagolCalculatorPom(page, expect));
    // },
});

export { expect } from '@playwright/test';