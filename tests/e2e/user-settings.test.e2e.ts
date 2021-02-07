// @watch start
// templates/user/settings/**.tmpl
// web_src/css/{form,user}.css
// @watch end

import {expect} from '@playwright/test';
import {test, save_visual, login_user, login} from './utils_e2e.ts';
import {validate_form} from './shared/forms.ts';

test.beforeAll(async ({browser}, workerInfo) => {
  await login_user(browser, workerInfo, 'user2');
});

test('User: Profile settings', async ({browser}, workerInfo) => {
  const page = await login({browser}, workerInfo);
  await page.goto('/user/settings');

  await page.getByLabel('Full name').fill('SecondUser');
  await page.locator('#pronouns-dropdown').click();
  await page.getByRole('option', {name: 'she/her'}).click();
  await page.getByPlaceholder('Tell others a little bit').fill('I am a playwright test running for several seconds.');
  await page.getByPlaceholder('Tell others a little bit').press('Tab');
  await page.getByLabel('Website').fill('https://forgejo.org');
  await page.getByPlaceholder('Share your approximate').fill('on a computer chip');
  await page.getByLabel('User visibility').click();
  await page.getByLabel('Visible only to signed-in').click();
  await page.getByLabel('Hide email address Your email').uncheck();
  await page.getByLabel('Hide activity from profile').check();

  await validate_form({page}, 'fieldset');
  await save_visual(page);
  await page.getByRole('button', {name: 'Update profile'}).click();
  await expect(page.getByText('Your profile has been updated.')).toBeVisible();
  await page.getByRole('link', {name: 'public activity'}).click();
  await expect(page.getByText('Your activity is only visible')).toBeVisible();
  await save_visual(page);

  await page.goto('/user2');
  await expect(page.getByText('SecondUser')).toBeVisible();
  await expect(page.getByText('on a computer chip')).toBeVisible();
  await expect(page.locator('li').filter({hasText: 'user2@example.com'})).toBeVisible();
  await expect(page.locator('li').filter({hasText: 'https://forgejo.org'})).toBeVisible();
  await expect(page.getByText('I am a playwright test')).toBeVisible();
  await save_visual(page);

  await page.goto('/user/settings');
  await page.locator('#pronouns-dropdown').click();
  await page.getByRole('option', {name: 'Custom'}).click();
  await page.getByLabel('Custom pronouns').fill('rob/ot');
  await page.getByLabel('User visibility').click();
  await page.getByLabel('Visible to everyone').click();
  await page.getByLabel('Hide email address Your email').check();
  await page.getByLabel('Hide activity from profile').uncheck();
  await expect(page.getByText('Your profile has been updated.')).toBeHidden();
  await validate_form({page}, 'fieldset');
  await save_visual(page);
  await page.getByRole('button', {name: 'Update profile'}).click();
  await expect(page.getByText('Your profile has been updated.')).toBeVisible();

  await page.goto('/user2');
  await expect(page.getByText('SecondUser')).toBeVisible();
  await expect(page.locator('li').filter({hasText: 'user2@example.com'})).toBeHidden();
  await page.goto('/user2?tab=activity');
  await expect(page.getByText('Your activity is visible to everyone')).toBeVisible();
});