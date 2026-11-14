import test, { expect } from "@playwright/test";
import { DynamicPage } from "../pages";

test.describe("Dynamic Catalog", () => {
  let dynamicPagePOM: DynamicPage;

  test.beforeEach(async ({ page }) => {
    dynamicPagePOM = new DynamicPage(page);
  });
  test("spinner", async () => {
    await dynamicPagePOM.goToSpinner();
    await expect(dynamicPagePOM.spinner).toBeVisible();
    await expect(dynamicPagePOM.spinner).toBeHidden();
    await expect(dynamicPagePOM.cards).not.toHaveCount(0);
    await expect(dynamicPagePOM.cards.first()).toBeVisible();
  });
  test("lazy load scroll test", async () => {
    await dynamicPagePOM.goToLazyLoad();
    const initialCount = await dynamicPagePOM.cards.count();

    await dynamicPagePOM.scrollDown();
    await expect(dynamicPagePOM.cards).not.toHaveCount(initialCount);
  });
  test("Slider", async () => {
    await dynamicPagePOM.goToSlider();

    //Slider Title Check
    const initialProduct = await dynamicPagePOM.activeCardTitle.textContent();
    await expect(dynamicPagePOM.activeCardTitle).not.toHaveText(initialProduct || "");
    //Dots Check
    await dynamicPagePOM.sliderDots.nth(0).click();
    const firstDotTitle = await dynamicPagePOM.activeCardTitle.textContent();
    await dynamicPagePOM.sliderDots.nth(1).click();
    await expect(dynamicPagePOM.activeCardTitle).not.toHaveText(firstDotTitle || "");
  });
});
