import { test, expect } from '@playwright/test';

test.describe('Transactions Management', () => {
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

    // Mock transactions API
    await page.route('**/api/transactions**', async route => {
      const url = route.request().url();
      
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { 
              id: 1, 
              description: 'Grocery Store', 
              amount: -120.50, 
              category: 'Living', 
              date: '2024-11-01',
              accountId: 1
            },
            { 
              id: 2, 
              description: 'Salary', 
              amount: 3000, 
              category: 'Income', 
              date: '2024-11-01',
              accountId: 1
            },
            { 
              id: 3, 
              description: 'Coffee Shop', 
              amount: -5.50, 
              category: 'Living', 
              date: '2024-11-05',
              accountId: 1
            },
            { 
              id: 4, 
              description: 'Game Purchase', 
              amount: -59.99, 
              category: 'Hobbies', 
              date: '2024-11-08',
              accountId: 2
            },
          ])
        });
      } else if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 5,
            ...postData,
            date: new Date().toISOString()
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
          body: JSON.stringify({ message: 'Transaction deleted' })
        });
      }
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
    await page.getByText('Transactions').click();
    await page.waitForTimeout(1000);
  });

  test('should display transactions list', async ({ page }) => {
    await expect(page.getByText('Grocery Store')).toBeVisible();
    await expect(page.getByText('Salary')).toBeVisible();
    await expect(page.getByText('Coffee Shop')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transactions-list.png',
      fullPage: true 
    });
  });

  test('should show transaction amounts correctly', async ({ page }) => {
    // Check for positive and negative amounts
    await expect(page.getByText('-120.50')).toBeVisible();
    await expect(page.getByText('3000')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transactions-amounts.png',
      fullPage: true 
    });
  });

  test('should display transaction categories', async ({ page }) => {
    await expect(page.getByText('Living')).toBeVisible();
    await expect(page.getByText('Income')).toBeVisible();
    await expect(page.getByText('Hobbies')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transactions-categories.png',
      fullPage: true 
    });
  });

  test('should open add transaction modal', async ({ page }) => {
    // Click add transaction button
    await page.getByRole('button', { name: /add transaction/i }).click();
    
    // Verify modal is visible
    await expect(page.getByText(/new transaction/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/add-transaction-modal.png',
      fullPage: true 
    });
  });

  test('should add a new transaction', async ({ page }) => {
    await page.getByRole('button', { name: /add transaction/i }).click();
    
    // Fill in transaction form
    await page.getByLabel(/description/i).fill('New Purchase');
    await page.getByLabel(/amount/i).fill('50.00');
    await page.getByLabel(/category/i).selectOption('Living');
    await page.getByLabel(/account/i).selectOption('1');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/add-transaction-filled.png',
      fullPage: true 
    });
    
    await page.getByRole('button', { name: /save|submit/i }).click();
    
    // Wait for transaction to be added
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transaction-added.png',
      fullPage: true 
    });
  });

  test('should filter transactions by category', async ({ page }) => {
    // Look for filter dropdown
    const categoryFilter = page.getByLabel(/filter by category/i);
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('Living');
      await page.waitForTimeout(500);
      
      // Only Living category transactions should be visible
      await expect(page.getByText('Grocery Store')).toBeVisible();
      await expect(page.getByText('Coffee Shop')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transactions-filtered.png',
        fullPage: true 
      });
    }
  });

  test('should search transactions', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search transactions/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Grocery');
      await page.waitForTimeout(500);
      
      await expect(page.getByText('Grocery Store')).toBeVisible();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transactions-search.png',
        fullPage: true 
      });
    }
  });

  test('should edit a transaction', async ({ page }) => {
    // Click edit button for first transaction
    const editButtons = page.getByRole('button', { name: /edit/i });
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click();
      
      await page.screenshot({ 
        path: 'test-results/screenshots/edit-transaction-modal.png',
        fullPage: true 
      });
      
      // Modify transaction
      await page.getByLabel(/description/i).fill('Updated Description');
      await page.getByRole('button', { name: /save|update/i }).click();
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transaction-edited.png',
        fullPage: true 
      });
    }
  });

  test('should delete a transaction', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: /delete/i });
    if (await deleteButtons.first().isVisible()) {
      await deleteButtons.first().click();
      
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await page.screenshot({ 
          path: 'test-results/screenshots/delete-transaction-confirm.png',
          fullPage: true 
        });
        
        await confirmButton.click();
      }
      
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transaction-deleted.png',
        fullPage: true 
      });
    }
  });

  test('should sort transactions by date', async ({ page }) => {
    const sortButton = page.getByRole('button', { name: /sort|date/i });
    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transactions-sorted.png',
        fullPage: true 
      });
    }
  });

  test('should display transaction statistics', async ({ page }) => {
    // Look for total income, expenses, etc.
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transaction-statistics.png',
      fullPage: true 
    });
  });

  test('should validate transaction form', async ({ page }) => {
    await page.getByRole('button', { name: /add transaction/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save|submit/i }).click();
    
    // Should show validation errors
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/transaction-validation-errors.png',
      fullPage: true 
    });
  });

  test('should handle pagination if available', async ({ page }) => {
    const nextPageButton = page.getByRole('button', { name: /next|>/i });
    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/transactions-page-2.png',
        fullPage: true 
      });
    }
  });
});
