import { expect, test as setup } from "@playwright/test";
import { LoginPage as LoginPagePOM } from "../pages/LoginPage";
import path from "path";

setup("Saucedemo Login Form", async ({ page }) => {
  const storageStatePath = process.env.STORAGE_STATE_PATH_SAUCE;
  if (!storageStatePath) {
    throw new Error("STORAGE_STATE_PATH_SAUCE environment variable is missing");
  }
  const authFile = path.resolve(process.cwd(), storageStatePath);
  if (!authFile) {
    throw new Error("SAUCEDEMO_STORAGE_STATE environment variable is missing");
  }
  const username = process.env.SAUCEDEMO_USER;
  if (!username) {
    throw new Error("SAUCEDEMO_USER environment variable is missing");
  }
  const password = process.env.SAUCEDEMO_PASS;
  if (!password) {
    throw new Error("SAUCEDEMO_PASS environment variable is missing");
  }

  const baseUrl = process.env.SAUCEDEMO_BASE_URL;
  if (!baseUrl) {
    throw new Error("SAUCEDEMO_BASE_URL environment variable is missing");
  }

  const loginPage = new LoginPagePOM(page);
  await loginPage.goToSaucedemo();
  await loginPage.loginForm(username, password);
  await expect(page).toHaveURL(`${baseUrl}/inventory.html`);
  await page.context().storageState({ path: authFile });
});
