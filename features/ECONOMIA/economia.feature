@economia
Feature: ECONOMIA Feature

  Scenario: Basic ECONOMIA scenario
    Given User navigates to "google"
    And User enters "ECONOMIA" in "search_box" on "google"
    And User submits form using "search_box" on "google"
    Then User verifies search results contain "ECONOMIA" 