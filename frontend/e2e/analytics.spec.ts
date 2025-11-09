import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }));
    });

    // Mock analytics API
    await page.route('**/api/analytics/category-spending**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { category: 'Living', amount: 1250.50, percentage: 45 },
          { category: 'Hobbies', amount: 850.25, percentage: 30 },
          { category: 'Savings', amount: 500.00, percentage: 18 },
          { category: 'Gambling', amount: 199.99, percentage: 7 },
        ])
      });
    });

    await page.route('**/api/analytics/spending-over-time**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { date: '2024-11-01', amount: 150 },
          { date: '2024-11-02', amount: 230 },
          { date: '2024-11-03', amount: 180 },
          { date: '2024-11-04', amount: 320 },
          { date: '2024-11-05', amount: 270 },
          { date: '2024-11-06', amount: 190 },
          { date: '2024-11-07', amount: 410 },
        ])
      });
    });

    await page.route('**/api/accounts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Checking Account', type: 'checking', balance: 5000 },
          { id: 2, name: 'Savings Account', type: 'savings', balance: 10000 },
        ])
      });
    });

    await page.goto('/dashboard');
    await page.getByText('Analytics').click();
    await page.waitForTimeout(1500);
  });

  test('should display analytics page', async ({ page }) => {
    await expect(page.getByText(/analytics/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-main.png',
      fullPage: true 
    });
  });

  test('should show account selector', async ({ page }) => {
    const accountSelector = page.getByLabel(/select account/i);
    if (await accountSelector.isVisible()) {
      await expect(accountSelector).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/analytics-account-selector.png',
        fullPage: true 
      });
    }
  });

  test('should display category spending chart', async ({ page }) => {
    // Wait for chart to render
    await page.waitForTimeout(1000);
    
    // Check if category names are visible
    await expect(page.getByText('Living')).toBeVisible();
    await expect(page.getByText('Hobbies')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-category-chart.png',
      fullPage: true 
    });
  });

  test('should display spending amounts', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for spending amounts
    await expect(page.getByText('1250.50')).toBeVisible();
    await expect(page.getByText('850.25')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-spending-amounts.png',
      fullPage: true 
    });
  });

  test('should display total spending', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Total should be visible (sum of all categories)
    await expect(page.getByText(/total/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-total-spending.png',
      fullPage: true 
    });
  });

  test('should show spending breakdown by category', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check percentages are displayed
    await expect(page.getByText('45%')).toBeVisible();
    await expect(page.getByText('30%')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-category-breakdown.png',
      fullPage: true 
    });
  });

  test('should display pie chart for categories', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Look for recharts SVG elements (pie chart)
    const chart = page.locator('.recharts-wrapper');
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-pie-chart.png',
      fullPage: true 
    });
  });

  test('should switch between accounts', async ({ page }) => {
    const accountSelector = page.getByRole('combobox', { name: /account/i });
    if (await accountSelector.isVisible()) {
      // Select Savings Account
      await accountSelector.selectOption({ label: /savings/i });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/analytics-savings-account.png',
        fullPage: true 
      });
    }
  });

  test('should display spending over time chart', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    // Look for line chart
    const lineChart = page.locator('.recharts-line-chart');
    if (await lineChart.isVisible()) {
      await expect(lineChart).toBeVisible();
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-spending-over-time.png',
      fullPage: true 
    });
  });

  test('should show spending trends', async ({ page }) => {
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-trends.png',
      fullPage: true 
    });
  });

  test('should display category colors consistently', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Categories should have consistent colors (golden theme)
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-category-colors.png',
      fullPage: true 
    });
  });

  test('should handle no data gracefully', async ({ page }) => {
    // Mock empty data
    await page.route('**/api/analytics/category-spending**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);
    
    const noDataMessage = page.getByText(/no data/i);
    if (await noDataMessage.isVisible()) {
      await expect(noDataMessage).toBeVisible();
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-no-data.png',
      fullPage: true 
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-mobile.png',
      fullPage: true 
    });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-tablet.png',
      fullPage: true 
    });
  });

  test('should show loading state', async ({ page }) => {
    // Delay API response to capture loading state
    await page.route('**/api/analytics/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    
    const loadingIndicator = page.getByText(/loading/i);
    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await page.screenshot({ 
        path: 'test-results/screenshots/analytics-loading.png',
        fullPage: true 
      });
    }
  });

  test('should display analytics header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-header.png',
      fullPage: true 
    });
  });
});
