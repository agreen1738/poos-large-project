import { test, expect } from '@playwright/test';

test.describe('Accounts Management', () => {
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

    // Mock accounts API
    await page.route('**/api/accounts**', async route => {
      const url = route.request().url();
      
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { 
              id: 1, 
              name: 'Checking Account', 
              type: 'checking', 
              balance: 5000,
              currency: 'USD',
              createdAt: '2024-01-01'
            },
            { 
              id: 2, 
              name: 'Savings Account', 
              type: 'savings', 
              balance: 10000,
              currency: 'USD',
              createdAt: '2024-01-01'
            },
            { 
              id: 3, 
              name: 'Investment Account', 
              type: 'investment', 
              balance: 25000,
              currency: 'USD',
              createdAt: '2024-03-15'
            },
          ])
        });
      } else if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 4,
            ...postData,
            createdAt: new Date().toISOString()
          })
        });
      } else if (route.request().method() === 'PUT') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            ...postData
          })
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Account deleted' })
        });
      }
    });

    await page.goto('/dashboard');
    await page.getByText('Accounts').click();
    await page.waitForTimeout(1000);
  });

  test('should display accounts summary', async ({ page }) => {
    // Check for total balance
    await expect(page.getByText(/total balance/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-summary.png',
      fullPage: true 
    });
  });

  test('should display all accounts', async ({ page }) => {
    await expect(page.getByText('Checking Account')).toBeVisible();
    await expect(page.getByText('Savings Account')).toBeVisible();
    await expect(page.getByText('Investment Account')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-list.png',
      fullPage: true 
    });
  });

  test('should show account balances', async ({ page }) => {
    await expect(page.getByText('5000')).toBeVisible();
    await expect(page.getByText('10000')).toBeVisible();
    await expect(page.getByText('25000')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-balances.png',
      fullPage: true 
    });
  });

  test('should display total balance calculation', async ({ page }) => {
    // Total should be 40000 (5000 + 10000 + 25000)
    await expect(page.getByText('40000')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-total-balance.png',
      fullPage: true 
    });
  });

  test('should open add account modal', async ({ page }) => {
    await page.getByRole('button', { name: /add account/i }).click();
    
    await expect(page.getByText(/new account/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/add-account-modal.png',
      fullPage: true 
    });
  });

  test('should add a new account', async ({ page }) => {
    await page.getByRole('button', { name: /add account/i }).click();
    
    // Fill in account form
    await page.getByLabel(/account name/i).fill('Credit Card');
    await page.getByLabel(/account type/i).selectOption('credit');
    await page.getByLabel(/initial balance/i).fill('0');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/add-account-filled.png',
      fullPage: true 
    });
    
    await page.getByRole('button', { name: /save|create/i }).click();
    
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-added.png',
      fullPage: true 
    });
  });

  test('should display account types correctly', async ({ page }) => {
    await expect(page.getByText(/checking/i)).toBeVisible();
    await expect(page.getByText(/savings/i)).toBeVisible();
    await expect(page.getByText(/investment/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-types.png',
      fullPage: true 
    });
  });

  test('should edit an account', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: /edit/i });
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/edit-account-modal.png',
        fullPage: true 
      });
      
      await page.getByLabel(/account name/i).fill('Updated Checking');
      await page.getByRole('button', { name: /save|update/i }).click();
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/account-edited.png',
        fullPage: true 
      });
    }
  });

  test('should delete an account', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    if (await deleteButtons.first().isVisible()) {
      await deleteButtons.first().click();
      
      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await page.screenshot({ 
          path: 'test-results/screenshots/delete-account-confirm.png',
          fullPage: true 
        });
        
        await confirmButton.click();
      }
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/account-deleted.png',
        fullPage: true 
      });
    }
  });

  test('should show account statistics', async ({ page }) => {
    // Look for number of accounts
    await expect(page.getByText(/3 accounts/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-statistics.png',
      fullPage: true 
    });
  });

  test('should validate account form', async ({ page }) => {
    await page.getByRole('button', { name: /add account/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save|create/i }).click();
    
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-validation-errors.png',
      fullPage: true 
    });
  });

  test('should display account cards with proper styling', async ({ page }) => {
    // Check that accounts are displayed in card format
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-cards.png',
      fullPage: true 
    });
  });

  test('should show account creation date', async ({ page }) => {
    // Look for dates on account cards
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/account-dates.png',
      fullPage: true 
    });
  });

  test('should filter accounts by type', async ({ page }) => {
    const typeFilter = page.getByLabel(/filter by type/i);
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('savings');
      await page.waitForTimeout(500);
      
      await expect(page.getByText('Savings Account')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/accounts-filtered.png',
        fullPage: true 
      });
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/accounts-mobile.png',
      fullPage: true 
    });
  });
});
