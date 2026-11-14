import test, { expect } from "@playwright/test";
import { CartPage, InventoryPage } from "../pages";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CheckoutErrorMessage } from "../../../tools/types";

const formValidationCases = [
  { firstName: "", lastName: "", zipCode: "", expectedError: "Error: First Name is required" },
  { firstName: "x", lastName: "", zipCode: "", expectedError: "Error: Last Name is required" },
  { firstName: "x", lastName: "x", zipCode: "", expectedError: "Error: Postal Code is required" },
];

test.describe("Checkout Page", () => {
  let inventoryPagePOM: InventoryPage;
  let cartPagePOM: CartPage;
  let checkoutPagePOM: CheckoutPage;
  let totalPrice = 0;
  let firstItemName: string;
  test.beforeEach(async ({ page }) => {
    totalPrice = 0;
    inventoryPagePOM = new InventoryPage(page);
    cartPagePOM = new CartPage(page);
    checkoutPagePOM = new CheckoutPage(page);
    //Go to inventory page and check title
    await inventoryPagePOM.goTo();
    await inventoryPagePOM.urlCheck();
    await inventoryPagePOM.checkTitle();
    // Add 4 items to cart and take first item name for remove in the cart section
    firstItemName = await inventoryPagePOM.findIndexOfItemName(0);
    totalPrice += await inventoryPagePOM.addItemsToCartByCount(4);
    await inventoryPagePOM.shoppingCart();
    // Cart page check
    await cartPagePOM.urlCheck();
    await cartPagePOM.itemCheckByCount(4);
    totalPrice -= await cartPagePOM.removeItemByName(firstItemName);
    await cartPagePOM.itemCheckByCount(3);
    //Go to checkout
    await cartPagePOM.goToCheckout();
    await checkoutPagePOM.urlCheck();
  });
  for (const data of formValidationCases) {
    test(`Form Validation - ${data.expectedError}`, { tag: "@form-validation" }, async () => {
      await checkoutPagePOM.fillInformationForm(data.firstName, data.lastName, data.zipCode);
      await checkoutPagePOM.clickContinue();
      await checkoutPagePOM.errorCheck(data.expectedError as CheckoutErrorMessage);
    });
  }

  test("Navigate to Checkout Overview with valid information", async () => {
    await checkoutPagePOM.fillInformationForm("John", "Doe", "35000");
    await checkoutPagePOM.clickContinue();
    await checkoutPagePOM.paymentUrlCheck();
    await checkoutPagePOM.verifySubtotalPrice(totalPrice);
    await checkoutPagePOM.finish();
    await checkoutPagePOM.finishSuccessCheck();
  });
});
