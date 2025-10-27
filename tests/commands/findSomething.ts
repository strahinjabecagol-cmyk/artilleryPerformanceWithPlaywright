import { expect } from '@playwright/test';


export async function findSomething(page: any) {
    await page.goto('https://blazedemo.com/index.php');
    await page.locator('select[name="fromPort"]').selectOption('Philadelphia');
    await page.locator('select[name="toPort"]').selectOption('Berlin');
    await page.getByRole('button', { name: 'Find Flights' }).click();
}

export async function gotoPage(page: any) {
    await page.goto('https://blazedemo.com/index.php');

}
export async function selectPhillyFrom(page: any) {
    await page.locator('select[name="fromPort"]').selectOption('Philadelphia');

}
export async function selectBerlinTo(page: any) {
    await page.locator('select[name="toPort"]').selectOption('Berlin');

}
export async function clickFindFlights(page: any) {
    await page.getByRole('button', { name: 'Find Flights' }).click();

}

module.exports = { findSomething, gotoPage, selectPhillyFrom, selectBerlinTo, clickFindFlights };