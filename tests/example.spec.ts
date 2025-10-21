// @ts-check
import { test, expect } from '@playwright/test';
import { findSomething } from './commands/findSomething';

test('has title', async ({ page }) => {
  await findSomething(page);
  
});

