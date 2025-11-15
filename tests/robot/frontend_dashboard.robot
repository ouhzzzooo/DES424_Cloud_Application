*** Settings ***
Resource          resources/auth_keywords.robot
Library           Browser

Suite Setup       Open Dashboard After Login
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:8080

*** Keywords ***
Open Dashboard After Login
    Login As Test User
    Go To    ${BASE_URL}/dashboard

*** Test Cases ***
Dashboard Header Is Visible
    Wait For Elements State    text=Home Dashboard    visible    timeout=10s

Dashboard Shows Activity Section
    Wait For Elements State    text=Activity    visible    timeout=10s

Dashboard View All Navigates To Goals
    Wait For Elements State    text=View All    visible    timeout=10s
    Click    text=View All
    Wait For Elements State    text=My goals    visible    timeout=10s