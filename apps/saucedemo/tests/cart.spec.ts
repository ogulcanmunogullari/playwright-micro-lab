import test, { expect } from "@playwright/test";
import { InventoryPage, CartPage } from "../pages";

test.describe("Cart", () => {
  let inventoryPagePOM: InventoryPage;
  let cartPagePOM: CartPage;

  test.beforeEach(async ({ page }) => {
    inventoryPagePOM = new InventoryPage(page);
    cartPagePOM = new CartPage(page);
    await inventoryPagePOM.goTo();
    await inventoryPagePOM.checkTitle();
  });
  test("E2E Shopping Cart User Flow", async ({ page }) => {
    const itemName1 = await inventoryPagePOM.findIndexOfItemName(0);
    const itemName2 = await inventoryPagePOM.findIndexOfItemName(1);

    await inventoryPagePOM.addItemToCartByName(itemName1);
    await inventoryPagePOM.addItemToCartByName(itemName2);

    await inventoryPagePOM.shoppingCart();
    await cartPagePOM.urlCheck();

    await cartPagePOM.itemCheckByCount(2);
    await cartPagePOM.itemCheckByName(itemName1);
    await cartPagePOM.itemCheckByName(itemName2);

    await cartPagePOM.removeItemByName(itemName1);
    await cartPagePOM.itemCheckByCount(1);
    await cartPagePOM.removeItemByName(itemName2);
    await cartPagePOM.emptyCartCheck();

    await cartPagePOM.continueShopping();
    await inventoryPagePOM.urlCheck();
    await inventoryPagePOM.addItemToCartByName(itemName1);
    await inventoryPagePOM.shoppingCart();
    await cartPagePOM.urlCheck();
    await cartPagePOM.goToCheckout();
  });
});
