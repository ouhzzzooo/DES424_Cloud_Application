*** Settings ***
Library           Browser

Suite Setup       Open App In Browser
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:8080

*** Keywords ***
Open App In Browser
    New Browser    chromium    headless=${TRUE}
    New Page       ${BASE_URL}

*** Test Cases ***
App Loads And Shows Title
    ${title}=    Get Title
    Should Contain    ${title}    ActTrack

Login Section Is Visible
    Wait For Elements State    text=Sign in    visible    timeout=10s