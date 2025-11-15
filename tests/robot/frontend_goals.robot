*** Settings ***
Library    Browser
Resource   resources/auth_keywords.robot

Suite Setup     Open Goals Page Logged In
Suite Teardown  Close Browser

*** Variables ***
${BASE_URL}     http://localhost:8080

*** Keywords ***
Open Goals Page Logged In
    Login As Test User
    Go To    ${BASE_URL}/goals
    Wait For Elements State    text=My goals    visible    timeout=10s

*** Test Cases ***
Goals Page Header Is Visible
    Wait For Elements State    text=My goals    visible    timeout=10s

Goals Page Shows Add New Goal Button
    Wait For Elements State    text=Add new goal    visible    timeout=10s

Add New Goal Button Navigates To New Goal Page
    Click    text=Add new goal
    Wait For Elements State    text=ActTrack    visible    timeout=10s
    ${url}=    Get Url
    Should Contain    ${url}    /goals/new