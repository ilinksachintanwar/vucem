@espanol @fileUpload
Feature: File Upload Feature

  Scenario: Upload a valid file
    Given User navigates to "upload_page"
    When User uploads "sample.txt" file
    Then User should see success message

  Scenario: Upload an invalid file
    Given User navigates to "upload_page"
    When User uploads "invalid.exe" file
    Then User should see error message 