@espanol @certificate
Feature: Certificate Upload Feature

  Scenario: Upload a certificate file
    Given User navigates to "upload_page"
    When User add "sample.cert" in "file_input" on "upload_page"
    And User clicks "upload_button" on "upload_page"
    Then User should see success message

  Scenario: Upload a key file
    Given User navigates to "upload_page"
    When User add "sample.key" in "file_input" on "upload_page"
    And User clicks "upload_button" on "upload_page"
    Then User should see success message 