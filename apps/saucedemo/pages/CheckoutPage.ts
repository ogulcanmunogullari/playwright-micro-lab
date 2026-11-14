import { expect, Locator, Page } from "@playwright/test";
import { CheckoutErrorMessage } from "../../../tools/types";

export class CheckoutPage {
  private readonly page: Page;
  private readonly continueButton: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly zipInput: Locator;
  private readonly errorMessageContainer: Locator;
  private readonly subtotalLabel: Locator;
  private readonly finishButton: Locator;
  private readonly successText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueButton = this.page.getByRole("button", { name: "Continue" });
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.zipInput = page.getByPlaceholder("Zip/Postal Code");
    this.errorMessageContainer = page.locator(".error-message-container");
    this.subtotalLabel = page.locator(".summary_subtotal_label");
    this.finishButton = this.page.getByRole("button", { name: "Finish" });
    this.successText = this.page.locator(".complete-header");
  }

  async urlCheck() {
    await expect(this.page).toHaveURL("/checkout-step-one.html");
  }

  async paymentUrlCheck() {
    await expect(this.page).toHaveURL("/checkout-step-two.html");
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillPostalCode(zip: string) {
    await this.zipInput.fill(zip);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async fillInformationForm(firstName: string, lastName: string, zip: string) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillPostalCode(zip);
  }

  async errorCheck(expectedError: CheckoutErrorMessage) {
    await expect(this.errorMessageContainer).toHaveText(expectedError);
  }

  async verifySubtotalPrice(expectedTotal: number) {
    await expect(this.subtotalLabel).toHaveText(`Item total: $${expectedTotal.toFixed(2)}`);
  }
  async finish() {
    await this.finishButton.click();
  }
  async finishSuccessCheck() {
    await expect(this.successText).toHaveText("Thank you for your order!");
  }
}
