import { expect, Page, Locator } from "@playwright/test";
import { SortOptionT } from "../../../tools/types";

export class InventoryPage {
  private readonly page: Page;
  private readonly secondTitle: Locator;
  private readonly filterIcon: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly shoppingCartBadge: Locator;
  private readonly productCardContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.secondTitle = this.page.getByText("Products");
    this.filterIcon = this.page.locator(".product_sort_container");
    this.shoppingCartLink = page.locator(".shopping_cart_link");
    this.shoppingCartBadge = page.locator(".shopping_cart_badge");
    this.productCardContainer = this.page.locator(".inventory_item");
  }
  async goTo() {
    await this.page.goto("https://www.saucedemo.com/inventory.html");
  }
  async checkTitle() {
    await expect(this.secondTitle).toBeVisible();
  }
  async urlCheck() {
    await expect(this.page).toHaveURL("https://www.saucedemo.com/inventory.html");
  }
  async filter(sortText: SortOptionT) {
    await this.filterIcon.selectOption({ label: sortText });
  }

  private async getProductNames(): Promise<Array<string>> {
    return await this.productCardContainer.locator(".inventory_item_name").allInnerTexts();
  }

  private async getProductPrices(): Promise<Array<number>> {
    const priceTexts = await this.productCardContainer.locator(".inventory_item_price").allInnerTexts();
    return priceTexts.map((price) => Number(price.replace("$", "")));
  }

  async filterCheck(sortText: SortOptionT): Promise<boolean> {
    if (sortText === "Name (A to Z)") {
      const actual = await this.getProductNames();
      const expected = [...actual].sort((a, b) => a.localeCompare(b));
      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    if (sortText === "Name (Z to A)") {
      const actual = await this.getProductNames();
      const expected = [...actual].sort((a, b) => b.localeCompare(a));
      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    if (sortText === "Price (low to high)") {
      const actual = await this.getProductPrices();
      const expected = [...actual].sort((a, b) => a - b);
      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    if (sortText === "Price (high to low)") {
      const actual = await this.getProductPrices();
      const expected = [...actual].sort((a, b) => b - a);
      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    return false;
  }
  async shoppingCart() {
    await this.shoppingCartLink.click();
  }

  async checkShoppingCartCount(count: number) {
    if (count === 0) {
      await expect(this.shoppingCartBadge).not.toBeVisible();
    } else {
      await expect(this.shoppingCartBadge).toHaveText(count.toString());
    }
  }

  async addItemsToCartByCount(count: number): Promise<number> {
    let totalAddedPrice = 0;
    for (let i = 0; i < count; i++) {
      const card = this.productCardContainer.nth(i);
      totalAddedPrice += await this.takeItemPrice(card);
      await card.getByRole("button", { name: "Add to cart" }).click();
    }
    return totalAddedPrice;
  }

  async findIndexOfItemName(count: number) {
    const card = this.productCardContainer.nth(count);
    const itemName = await card.locator(".inventory_item_name").textContent();
    return itemName?.trim() ?? "";
  }

  private async takeItemPrice(card: Locator) {
    const priceText = await card.locator(".inventory_item_price").textContent();
    return parseFloat(priceText?.replace("$", "").trim() ?? "0");
  }

  async addItemToCartByName(itemName: string): Promise<number> {
    const card = this.productCardContainer.filter({ has: this.page.getByText(itemName, { exact: true }) });
    const price = await this.takeItemPrice(card);
    await card.getByRole("button", { name: "Add to cart" }).click();
    return price;
  }

  async removeItemToCartByName(itemName: string): Promise<number> {
    const card = this.productCardContainer.filter({ has: this.page.getByText(itemName, { exact: true }) });
    const price = await this.takeItemPrice(card);
    await card.getByRole("button", { name: "Remove" }).click();
    return price;
  }
}
