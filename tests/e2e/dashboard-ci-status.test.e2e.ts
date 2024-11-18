// @watch start
// web_src/js/components/DashboardRepoList.vue
// @watch end

import {expect} from '@playwright/test';
import {test, login_user, load_logged_in_context} from './utils_e2e.ts';

test.beforeAll(async ({browser}, workerInfo) => {
  await login_user(browser, workerInfo, 'user2');
});

test('Correct link and tooltip', async ({browser}, workerInfo) => {
  const context = await load_logged_in_context(browser, workerInfo, 'user2');
  const page = await context.newPage();
  const response = await page.goto('/?repo-search-query=test_workflows');
  expect(response?.status()).toBe(200);

  const repoStatus = page.locator('.dashboard-repos .repo-owner-name-list > li:nth-child(1) > a:nth-child(2)');
  // wait for network activity to cease (so status was loaded in frontend)
  await page.waitForLoadState('networkidle'); // eslint-disable-line playwright/no-networkidle
  await expect(repoStatus).toHaveAttribute('href', '/user2/test_workflows/actions', {timeout: 10000});
  await expect(repoStatus).toHaveAttribute('data-tooltip-content', 'Failure');
});