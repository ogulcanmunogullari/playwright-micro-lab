import test, { expect } from "@playwright/test";
import { InventoryPage } from "../pages";
import { SortOptionT } from "../../../tools/types";

const sortOptions: SortOptionT[] = ["Name (A to Z)", "Name (Z to A)", "Price (low to high)", "Price (high to low)"];

test.describe("inventory", () => {
  let inventoryPagePOM: InventoryPage;

  test.beforeEach(async ({ page }) => {
    inventoryPagePOM = new InventoryPage(page);
    await inventoryPagePOM.goTo();
    await inventoryPagePOM.checkTitle();
  });

  test("access inventory page", async ({ page }) => {
    inventoryPagePOM.urlCheck();
  });

  for (const option of sortOptions) {
    test(`filter: ${option}`, async () => {
      await inventoryPagePOM.filter(option);
      expect(await inventoryPagePOM.filterCheck(option)).toBe(true);
    });
  }

  test("Add or remove cart by name", async () => {
    const itemName = await inventoryPagePOM.findIndexOfItemName(1);
    const itemName2 = await inventoryPagePOM.findIndexOfItemName(2);
    const itemName3 = await inventoryPagePOM.findIndexOfItemName(3);
    await inventoryPagePOM.addItemToCartByName(itemName);

    // Single
    await inventoryPagePOM.checkShoppingCartCount(1);
    await inventoryPagePOM.removeItemToCartByName(itemName);
    await inventoryPagePOM.checkShoppingCartCount(0);

    // More
    await inventoryPagePOM.addItemToCartByName(itemName2);
    await inventoryPagePOM.addItemToCartByName(itemName3);
    await inventoryPagePOM.checkShoppingCartCount(2);
    await inventoryPagePOM.removeItemToCartByName(itemName2);
    await inventoryPagePOM.checkShoppingCartCount(1);
  });

  test("Add to cart by count", async () => {
    await inventoryPagePOM.addItemsToCartByCount(4);
    await inventoryPagePOM.checkShoppingCartCount(4);
  });
});
