  @120602  
Feature: This is the procedure testing

  Scenario: End to end testing
    Then User navigates to "https://wwwqa.ventanillaunica.gob.mx/vucem/Ingreso.html"
    And User waits for "2" seconds
    And User add "leqi8101314s7" in "certificate_field" on "login_page"
    And User add "LEQI8101314S7_1012231707.key" in "key_field" on "login_page"
    And User enter "delfin40" in "password_field" on "login_page"
    And User clicks "login_button" on "login_page"
    And User waits for "2" seconds
    And User selects "Persona Moral" in "selection_tab" on "selectionrole_page"
    And User clicks "btn_accept" on "selectionrole_page"
    And User waits for "2" seconds
    And User clicks "cuposDeImportaciónExportación" on "trámitesDisponibles_page"
    And User clicks "registroDeEmpresaComercialIndustriaFronteriza" on "trámitesDisponibles_page"
    And User clicks "registroComoEmpresaFronteraPersonasFísicas" on "trámitesDisponibles_page"
    # Paso 1
    # Step 1
    And User clicks "continuar_btn" on "solicitante_tab"
    # Step 2
    And User waits for "2" seconds
    And User selects "CHIHUAHUA" in "estoda_selection_tab" on "daltosEmpresa_tab"
    And User selects "CIUDAD JUAREZ" in "representation_selection" on "daltosEmpresa_tab"
    And User selects "COMERCIO" in "tipoDeEmpresa" on "daltosEmpresa_tab"
    And User enter "1122" in "documentName" on "daltosEmpresa_tab"
    And User clicks "continuar_btn" on "daltosEmpresa_tab"
    # Paso 2
    And User clicks "continuar_btn" on "daltosEmpresa_tab"
    # Paso 3
    And User clicks "continuar_btn" on "daltosEmpresa_tab"
    # Paso 4
    And User clicks "continuar_btn" on "daltosEmpresa_tab"
    Then User verifies "folio_number" on "daltosEmpresa_tab" is visible