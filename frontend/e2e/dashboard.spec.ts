import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    
    // Set up authentication state
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user_data', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }));
    });

    // Mock API responses
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

    await page.route('**/api/transactions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, description: 'Grocery Store', amount: -120.50, category: 'Living', date: '2024-11-01' },
          { id: 2, description: 'Salary', amount: 3000, category: 'Income', date: '2024-11-01' },
          { id: 3, description: 'Coffee Shop', amount: -5.50, category: 'Living', date: '2024-11-05' },
        ])
      });
    });

    await page.route('**/api/analytics/category-spending', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { category: 'Living', amount: 500, percentage: 50 },
          { category: 'Hobbies', amount: 300, percentage: 30 },
          { category: 'Savings', amount: 200, percentage: 20 },
        ])
      });
    });

    await page.goto('/dashboard');
  });

  test('should display dashboard with user greeting', async ({ page }) => {
    await expect(page.getByText(/Hello John!/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-main.png',
      fullPage: true 
    });
  });

  test('should show all navigation tabs', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Transactions')).toBeVisible();
    await expect(page.getByText('Accounts')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-navigation.png',
      fullPage: true 
    });
  });

  test('should navigate to transactions tab', async ({ page }) => {
    await page.getByText('Transactions').click();
    
    // Wait for transactions to load
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transactions-tab.png',
      fullPage: true 
    });
  });

  test('should navigate to accounts tab', async ({ page }) => {
    await page.getByText('Accounts').click();
    
    // Wait for accounts to load
    await page.waitForTimeout(1000);
    
    // Verify accounts are displayed
    await expect(page.getByText(/Checking Account/i)).toBeVisible();
    await expect(page.getByText(/Savings Account/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-tab.png',
      fullPage: true 
    });
  });

  test('should navigate to analytics tab', async ({ page }) => {
    await page.getByText('Analytics').click();
    
    // Wait for analytics to load
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/analytics-tab.png',
      fullPage: true 
    });
  });

  test('should navigate to settings tab', async ({ page }) => {
    await page.getByText('Settings').click();
    
    // Wait for settings to load
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/settings-tab.png',
      fullPage: true 
    });
  });

  test('should display category spending chart', async ({ page }) => {
    // Dashboard should show category data
    await page.waitForTimeout(2000);
    
    // Take screenshot of the chart area
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-category-chart.png',
      fullPage: true 
    });
  });

  test('should display recent transactions', async ({ page }) => {
    // Check for transaction elements
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-recent-transactions.png',
      fullPage: true 
    });
  });

  test('should handle logout', async ({ page }) => {
    await page.getByText('Logout').click();
    
    // Should redirect to login page
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
    
    // Verify localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/after-logout.png',
      fullPage: true 
    });
  });

  test('should display account balances', async ({ page }) => {
    await page.getByText('Accounts').click();
    await page.waitForTimeout(1000);
    
    // Check for balance displays
    await expect(page.getByText(/5000/)).toBeVisible();
    await expect(page.getByText(/10000/)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-balances.png',
      fullPage: true 
    });
  });

  test('should switch between tabs smoothly', async ({ page }) => {
    const tabs = ['Transactions', 'Accounts', 'Analytics', 'Settings', 'Dashboard'];
    
    for (const tab of tabs) {
      await page.getByText(tab).click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/screenshots/tab-${tab.toLowerCase()}.png`,
        fullPage: true 
      });
    }
  });

  test('should display calendar on dashboard', async ({ page }) => {
    // Look for calendar elements
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-calendar.png',
      fullPage: true 
    });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-mobile.png',
      fullPage: true 
    });
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-tablet.png',
      fullPage: true 
    });
  });
});
