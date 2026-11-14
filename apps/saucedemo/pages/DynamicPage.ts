import { Locator, Page } from "@playwright/test";

export class DynamicPage {
  private readonly page: Page;
  readonly spinner: Locator;
  readonly cards: Locator;
  readonly sliderDots: Locator;
  readonly activeDot: Locator;
  readonly activeCardTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator(".dynamic_catalog_spinner");
    this.cards = page.locator(".dynamic_catalog_card");
    this.sliderDots = page.locator(".dynamic_catalog_slider_dot");
    this.activeDot = page.locator(".dynamic_catalog_slider_dot.active");
    this.activeCardTitle = page.locator(".dynamic_catalog_card_name");
  }

  async goToSpinner() {
    await this.page.goto("/dynamic-catalog-spinner.html");
  }
  async goToLazyLoad() {
    await this.page.goto("/dynamic-catalog-lazy-load.html");
  }
  async goToSlider() {
    await this.page.goto("/dynamic-catalog-slider.html");
  }
  async scrollDown() {
    await this.page.mouse.wheel(0, 2000);
  }
}
