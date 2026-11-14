import { expect, test as setup } from "@playwright/test";
import { LoginPage as LoginPagePOM } from "../pages/LoginPage";
import path from "path";

const authFile = path.join(process.cwd(), "playwright", ".auth", "saucedemo-user.json");

setup("Saucedemo Login Form", async ({ page }) => {
  const username = "standard_user";
  const password = "secret_sauce";
  const loginPage = new LoginPagePOM(page);
  await loginPage.goToSaucedemo();
  await loginPage.loginForm(username, password);
  await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
  await page.context().storageState({ path: authFile });
});
