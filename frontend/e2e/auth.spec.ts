import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    // Take a screenshot of the login page
    await page.screenshot({ path: 'test-results/screenshots/login-page.png', fullPage: true });

    // Verify page elements
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for error messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    
    // Take screenshot of validation errors
    await page.screenshot({ 
      path: 'test-results/screenshots/login-validation-errors.png',
      fullPage: true 
    });
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/login-invalid-email.png',
      fullPage: true 
    });
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.getByText(/don't have an account/i).click();
    
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByText(/create account/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/register-page.png',
      fullPage: true 
    });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByText(/forgot password/i).click();
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByText(/reset password/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/forgot-password-page.png',
      fullPage: true 
    });
  });

  test('should attempt login with valid credentials', async ({ page, context }) => {
    // Mock the API response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe'
          }
        })
      });
    });

    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/login-filled-form.png',
      fullPage: true 
    });
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    await page.screenshot({ 
      path: 'test-results/screenshots/dashboard-after-login.png',
      fullPage: true 
    });
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Mock the API response with error
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid email or password'
        })
      });
    });

    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid/i)).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/login-invalid-credentials.png',
      fullPage: true 
    });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/password/i);
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Take screenshot with password hidden
    await passwordInput.fill('mysecretpassword');
    await page.screenshot({ 
      path: 'test-results/screenshots/password-hidden.png',
      fullPage: true 
    });
    
    // Click the toggle button
    await page.getByRole('button', { name: /show password/i }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Take screenshot with password visible
    await page.screenshot({ 
      path: 'test-results/screenshots/password-visible.png',
      fullPage: true 
    });
  });
});
