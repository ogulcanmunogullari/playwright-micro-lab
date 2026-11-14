import { expect, Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;
  private readonly itemName: Locator;
  private readonly cart: Locator;
  private readonly continueButton: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.itemName = this.page.locator(".inventory_item_name");
    this.cart = this.page.locator(".cart_item");
    this.continueButton = this.page.getByRole("button", { name: "Continue Shopping" });
    this.checkoutButton = this.page.getByRole("button", { name: "Checkout" });
  }

  async urlCheck() {
    await expect(this.page).toHaveURL("/cart.html");
  }

  private async takeItemPrice(card: Locator) {
    const priceText = await card.locator(".inventory_item_price").textContent();
    return parseFloat(priceText?.replace("$", "").trim() ?? "0");
  }

  async itemCheckByCount(count: number) {
    const itemCount = this.cart;
    await expect(itemCount).toHaveCount(count);
  }
  async itemCheckByName(name: string) {
    const item = this.itemName.filter({ hasText: name });
    await expect(item).toBeVisible();
  }
  async removeItemByName(name: string): Promise<number> {
    const item = this.cart.filter({ has: this.page.getByText(name, { exact: true }) });
    const price = await this.takeItemPrice(item);
    await item.getByRole("button", { name: "Remove" }).click();
    return price;
  }
  async emptyCartCheck() {
    this.itemCheckByCount(0);
  }
  async continueShopping() {
    await this.continueButton.click();
  }
  async goToCheckout() {
    await this.checkoutButton.click();
  }
}
