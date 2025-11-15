*** Settings ***
Library    Browser

Suite Setup       Open Invalid Page
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}    http://localhost:8080

*** Keywords ***
Open Invalid Page
    New Browser    chromium    headless=${TRUE}
    New Page       ${BASE_URL}/this-page-does-not-exist
    # Wait for the NotFound content to render
    Wait For Elements State    text=Oops! Page not found    visible    timeout=10s

*** Test Cases ***
Not Found Header Is Visible :: Verify the 404 / NotFound header is rendered
    ${heading}=    Get Text    role=heading[name="404"]
    Should Be Equal    ${heading}    404

Not Found Has Dashboard Link :: Verify we offer a way back via button
    Wait For Elements State    role=link[name="Return to Home"]    visible    timeout=10s
    # Just ensure the button is clickable; no strict assertion on navigation
    Click    role=link[name="Return to Home"]
    Log    Clicked Return to Home from 404 page.