import { test, expect } from "@playwright/test";
import path from "path";

const storageStateEnv = process.env.STORAGE_STATE_PATH_HEROKUAPP;
if (!storageStateEnv) {
  throw new Error("STORAGE_STATE_PATH_HEROKUAPP environment variable is missing");
}

const herokuUser = process.env.HEROKU_USER;
if (!herokuUser) {
  throw new Error("HEROKU_USER environment variable is missing");
}

const herokuPass = process.env.HEROKU_PASS;
if (!herokuPass) {
  throw new Error("HEROKU_PASS environment variable is missing");
}

const authFile = path.resolve(process.cwd(), storageStateEnv);

test.describe("Herokuapp complete test in one page", () => {
  test.describe.configure({ mode: "serial" });

  test.use({
    httpCredentials: { username: "admin", password: "admin" },
  });

  test.beforeEach("go to web page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("Login Form", async ({ page }) => {
    await page.getByRole("link", { name: "Form Authentication" }).click();
    await expect(page).toHaveURL("/login");

    // Inputs empty test
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.locator("#flash-messages")).toContainText("Your username is invalid!");

    // Wrong input filling test
    await page.getByLabel("Username").click();
    await page.getByRole("textbox", { name: "username" }).fill("test123");
    await page.getByLabel("Password").click();
    await page.getByRole("textbox", { name: "password" }).fill("testpassword");
    await page.getByRole("button", { name: "Login" }).click();

    // True input filling test
    await page.getByLabel("Username").click();
    await page.getByRole("textbox", { name: "username" }).fill(herokuUser);
    await page.getByLabel("Password").click();
    await page.getByRole("textbox", { name: "password" }).fill(herokuPass);
    await page.getByRole("button", { name: "Login" }).click();

    // Auto login için cookie
    await page.context().storageState({ path: authFile });

    // After login page
    await expect(page).toHaveURL("/secure");
    await expect(page.locator("#flash-messages")).toContainText("You logged into a secure area!");
    await expect(page.getByRole("heading", { name: "Secure Area", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Welcome to the Secure Area/i })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page).toHaveURL("/login");
  });

  test.describe("Authenticated tests", () => {
    test.use({
      storageState: authFile,
    });

    test("Login Form Cookie", async ({ page }) => {
      await page.goto("/secure");
      // Cookie çalışmaz ise /login'e atar secure'de kalmaz
      await expect(page).toHaveURL("/secure");
    });

    test("Checkboxes", async ({ page }) => {
      await page.getByRole("link", { name: "Checkboxes" }).click();
      await expect(page).toHaveURL("/checkboxes");

      // DRY
      const checkbox1 = page.getByRole("checkbox").nth(0);
      const checkbox2 = page.getByRole("checkbox").nth(1);

      // Is Heading visible?
      await expect(page.getByRole("heading", { name: "Checkboxes" })).toBeVisible();

      // Are Checkboxes visible?
      await expect(checkbox1).toBeVisible();
      await expect(checkbox2).toBeVisible();

      // Control Checkboxes checked status
      await expect(checkbox1).not.toBeChecked();
      await expect(checkbox2).toBeChecked();

      // Change Checkboxes checked status
      await checkbox1.check();
      await expect(checkbox1).toBeChecked();
      await expect(checkbox2).toBeChecked();

      // Uncheck checkboxes one by one
      // 1
      await checkbox1.uncheck();
      await expect(checkbox1).not.toBeChecked();
      await expect(checkbox2).toBeChecked();

      // 2
      await checkbox2.uncheck();
      await expect(checkbox1).not.toBeChecked();
      await expect(checkbox2).not.toBeChecked();
    });

    test("Dropdown", async ({ page }) => {
      const dropdownLink = page.getByRole("link", { name: "Dropdown", exact: true });

      await dropdownLink.scrollIntoViewIfNeeded();
      await dropdownLink.click();
      await expect(page).toHaveURL("/dropdown");

      const dropdown = page.getByRole("combobox");
      await expect(dropdown).toBeVisible();

      await dropdown.selectOption("Option 1");
      await expect(dropdown).toHaveValue("1");

      await dropdown.selectOption("Option 2");
      await expect(dropdown).toHaveValue("2");
    });

    test("Browser Alerts", async ({ page }) => {
      await page.getByRole("link", { name: "JavaScript Alerts" }).click();
      await expect(page).toHaveURL("/javascript_alerts");

      // Locators (DRY)
      const jsAlert = page.getByRole("button", { name: "Click for JS Alert" });
      const jsConfirm = page.getByRole("button", { name: "Click for JS Confirm" });
      const jsPrompt = page.getByRole("button", { name: "Click for JS Prompt" });
      const resultText = page.locator("#result");

      await test.step("1. JS Alert - Accept", async () => {
        page.once("dialog", (dialog) => dialog.accept());
        await jsAlert.click();
        await expect(resultText).toHaveText("You successfully clicked an alert");
      });

      await test.step("2. JS Confirm - Accept & Dismiss", async () => {
        page.once("dialog", (dialog) => dialog.accept());
        await jsConfirm.click();
        await expect(resultText).toHaveText("You clicked: Ok");

        page.once("dialog", (dialog) => dialog.dismiss());
        await jsConfirm.click();
        await expect(resultText).toHaveText("You clicked: Cancel");
      });

      await test.step("3. JS Prompt - Dismiss & Accept with Text", async () => {
        page.once("dialog", (dialog) => dialog.dismiss());
        await jsPrompt.click();
        await expect(resultText).toHaveText("You entered: null");

        page.once("dialog", (dialog) => dialog.accept("Test 123"));
        await jsPrompt.click();
        await expect(resultText).toHaveText("You entered: Test 123");
      });
    });

    test("Dynamic Controls", async ({ page }) => {
      await page.getByRole("link", { name: "Dynamic Controls" }).click();
      await expect(page).toHaveURL("/dynamic_controls");

      // DRY
      const checkboxForm = page.locator("#checkbox-example");
      const inputForm = page.locator("#input-example");

      const checkbox = checkboxForm.getByRole("checkbox");
      const checkboxAddRemoveButton = checkboxForm.getByRole("button");

      const textbox = inputForm.getByRole("textbox");
      const textboxEnableDisableButton = inputForm.getByRole("button");

      const message = page.locator("#message");

      await test.step("Checkbox Remove/add", async () => {
        await expect(checkbox).toBeVisible();
        await checkboxAddRemoveButton.click();
        await expect(message).toHaveText("It's gone!");
        await expect(checkbox).toBeHidden();

        await checkboxAddRemoveButton.click();
        await expect(message).toHaveText("It's back!");
        await expect(checkbox).toBeVisible();
      });

      await test.step("Input Enable/Disable", async () => {
        await expect(textbox).toBeDisabled();
        await textboxEnableDisableButton.click();

        await expect(message).toHaveText("It's enabled!");
        await expect(textbox).toBeEnabled();

        await textboxEnableDisableButton.click();
        await expect(message).toHaveText("It's disabled!");
        await expect(textbox).toBeDisabled();
      });
    });

    test("Native HTTP Auth", async ({ page }) => {
      // Bilgileri httpCredentials'dan çekecek
      await page.getByRole("link", { name: "Digest Authentication " }).click();
      await expect(page).toHaveURL("/digest_auth");
      await expect(page.getByRole("paragraph")).toContainText("Congratulations! You must have the proper credentials.");
    });
  });
});
