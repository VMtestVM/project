import assert from 'node:assert/strict';
import { Builder, By, until } from 'selenium-webdriver';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const driver = await new Builder().forBrowser('safari').build();

async function visibleText(locator) {
  const element = await driver.wait(until.elementLocated(locator), 10_000);
  await driver.wait(until.elementIsVisible(element), 10_000);
  return element.getText();
}

try {
  await driver.get(baseUrl);
  assert.equal(
    (await visibleText(By.css('h1'))).replace(/\s+/g, ' ').trim(),
    'Your next ride starts here.',
    'The rental page should load in Safari.',
  );

  await driver
    .findElement(By.xpath("//button[normalize-space()='Rent this bike']"))
    .click();
  assert.equal(await visibleText(By.css('.state-pill')), 'On your ride');

  await driver
    .findElement(By.xpath("//button[normalize-space()='Return this bike']"))
    .click();
  assert.equal(await visibleText(By.css('#receipt-title')), 'Your receipt');
  assert.match(await visibleText(By.css('.receipt dd:last-child')), /^€\s?1\.00$/);

  await driver.navigate().refresh();
  assert.equal(await visibleText(By.css('.state-pill')), 'Available');

  const capabilities = await driver.getCapabilities();
  console.log(
    `Native Safari smoke passed (${capabilities.get('browserVersion')}) at ${baseUrl}.`,
  );
} finally {
  await driver.quit();
}
