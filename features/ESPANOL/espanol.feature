@espanol
Feature: ESPANOL Feature

  Scenario: Basic ESPANOL scenario
    Given User navigates to "google"
    And User enters "ESPANOL" in "search_box" on "google"
    And User submits form using "search_box" on "google"
    Then User verifies search results contain "ESPANOL" 