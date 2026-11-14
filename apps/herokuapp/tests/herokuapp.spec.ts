import { test, expect } from "@playwright/test";

test.describe("Herokuapp complete test in one page", async () => {
  test.use({
    httpCredentials: { username: "admin", password: "admin" },
    storageState: "playwright/.auth/herokuapp-user.json",
  });
  test.beforeEach("go to web page", async ({ page }) => {
    await page.goto("https://the-internet.herokuapp.com/");
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/");
  });
  test("Login Form", async ({ page }) => {
    await page.getByRole("link", { name: "Form Authentication" }).click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/login");

    //Inputs empty test
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.locator("#flash-messages")).toContainText("Your username is invalid!");
    //Wrong input filling test
    await page.getByLabel("Username").click();
    await page.getByRole("textbox", { name: "username" }).fill("test123");
    await page.getByLabel("Password").click();
    await page.getByRole("textbox", { name: "password" }).fill("testpassword");
    await page.getByRole("button", { name: "Login" }).click();

    //True input filling test
    await page.getByLabel("Username").click();
    await page.getByRole("textbox", { name: "username" }).fill("tomsmith");
    await page.getByLabel("Password").click();
    await page.getByRole("textbox", { name: "password" }).fill("SuperSecretPassword!");
    await page.getByRole("button", { name: "Login" }).click();
    //Auto login için cookie
    await page.context().storageState({ path: "playwright/.auth/herokuapp-user.json" });
    //After login page
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/secure");
    await expect(page.locator("#flash-messages")).toContainText("You logged into a secure area!");
    await expect(page.getByRole("heading", { name: "Secure Area", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Welcome to the Secure Area/i })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/login");
  });
  test("Login Form Cookie", async ({ page }) => {
    await page.goto("https://the-internet.herokuapp.com/secure");
    //Cookie çalışmaz ise /login'e atar secure'de kalmaz
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/secure");
  });
  test("Checkboxes", async ({ page }) => {
    await page.getByRole("link", { name: "Checkboxes" }).click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/checkboxes");
    //DRY
    const checkbox1 = page.getByRole("checkbox").nth(0); //using nth because checkboxes don't have labels
    const checkbox2 = page.getByRole("checkbox").nth(1); //using nth because checkboxes don't have labels
    //Is Heading visible?
    await expect(page.getByRole("heading", { name: "Checkboxes" })).toBeVisible();
    //Are Checkboxs visible?
    await expect(checkbox1).toBeVisible();
    await expect(checkbox2).toBeVisible();
    //Control Checkboxs checked status
    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).toBeChecked();
    //Change Checkboxs checked status
    await checkbox1.check();
    await expect(checkbox1).toBeChecked();
    await expect(checkbox2).toBeChecked();
    //Uncheck checkboxes one by one
    //1
    await checkbox1.uncheck();
    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).toBeChecked();
    //2
    await checkbox2.uncheck();
    await expect(checkbox1).not.toBeChecked();
    await expect(checkbox2).not.toBeChecked();
  });
  test("Dropdown", async ({ page }) => {
    const dropdownLink = page.getByRole("link", { name: "Dropdown", exact: true });

    await dropdownLink.scrollIntoViewIfNeeded();
    await dropdownLink.click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/dropdown");

    const dropdown = page.getByRole("combobox");
    await expect(dropdown).toBeVisible();

    await dropdown.selectOption("Option 1");
    await expect(dropdown).toHaveValue("1");

    await dropdown.selectOption("Option 2");
    await expect(dropdown).toHaveValue("2");
  });
  test("Browser Alerts", async ({ page }) => {
    await page.getByRole("link", { name: "JavaScript Alerts" }).click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/javascript_alerts");

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
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/dynamic_controls");

    // DRY
    const checkboxForm = page.locator("#checkbox-example");
    const inputForm = page.locator("#input-example");

    const checkbox = checkboxForm.getByRole("checkbox");
    const checkboxAddRemoveButton = checkboxForm.getByRole("button");

    const textbox = inputForm.getByRole("textbox");
    const textboxEnableDisableButton = inputForm.getByRole("button");

    const message = page.locator("#message");
    /*
     * SDET NOTE:
     * Uygulamanın DOM yapısı hatalı kurgulanmış. Butona her basıldığında var olan
     * #loading div'ini temizlemek yerine DOM'a sürekli yeni kopyalar ekliyor.
     * Bu "hayalet/çöp" elemanlar Playwright'ta Strict Mode ihlaline veya flaky
     * (dengesiz) testlere yol açtığı için spinner'ı beklemekten vazgeçtik.
     * Best Practice olarak doğrudan nihai durumu (mesajın belirmesini) bekliyoruz.
     */
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
    //Bilgileri httpCredentials'dan çekicek
    await page.getByRole("link", { name: "Digest Authentication " }).click();
    await expect(page).toHaveURL("https://the-internet.herokuapp.com/digest_auth");
    await expect(page.getByRole("paragraph")).toContainText("Congratulations! You must have the proper credentials.");
  });
});
