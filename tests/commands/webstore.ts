import { expect } from '@playwright/test';

export async function buyLumia(page: any) {
    await page.goto('https://www.demoblaze.com/index.html');
    await page.getByRole('link', { name: 'Nokia lumia' }).click();
    await expect(page.locator('h2')).toContainText('Nokia lumia 1520');
    await page.getByRole('link', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'Nokia lumia' })).toContainText('Nokia lumia 1520', { timeout: 15000 });
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.getByRole('textbox', { name: 'Total: 820 Name:' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Country:' }).fill('Test Country');
    await page.getByRole('textbox', { name: 'City:' }).fill('Test City');
    await page.getByRole('textbox', { name: 'Credit card:' }).fill('1234 5678 9012 3456');
    await page.getByRole('textbox', { name: 'Month:' }).fill('12');
    await page.getByRole('textbox', { name: 'Year:' }).fill('2025');
    await page.getByRole('button', { name: 'Purchase' }).click();
    await expect(page.locator('.sweet-alert > h2')).toContainText('Thank you for your purchase!');
    await page.getByRole('button', { name: 'OK' }).click();

}