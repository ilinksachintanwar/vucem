@economia @google @search @web
Feature: Google Search

  @smoke @critical
  Scenario: Search for Playwright on Google using submit form
    Given User navigates to "google"
    And User enters "Playwright" in "search_box_1" on "solicitante_tab"
    And User submits form using "search_box" on "google"
    # Then User verifies search results contain "Playwright"

  # Scenario: Search for Playwright automation
  #   Given User navigates to "google"
  #   And User enters "Playwright automation" in "search_box" on "google"
  #   And User submits form using "search_box" on "google"
  #   # Then User verifies search results contain "Playwright"
