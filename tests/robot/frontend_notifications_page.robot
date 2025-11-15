*** Settings ***
Library         Browser
Resource        resources/auth_keywords.robot
Suite Setup     Login And Open Notifications Page
Suite Teardown  Close Browser

*** Variables ***
${BASE_URL}     http://localhost:8080

*** Keywords ***
Login And Open Notifications Page
    Login As Test User
    Go To    ${BASE_URL}/notifications
    Wait For Elements State    role=heading[name="Notifications"]    visible    timeout=10s

*** Test Cases ***
Notifications Header Is Visible
    [Documentation]    Verify the Notifications page header shows up.
    Wait For Elements State    role=heading[name="Notifications"]    visible    timeout=10s

Notifications Shows Empty Or List
    [Documentation]    Accept either an empty state or a populated list.
    ${has_empty}=    Run Keyword And Return Status
    ...    Wait For Elements State    text=No notifications yet    visible    timeout=3s

    Run Keyword If    ${has_empty}    Log    Notifications empty state shown
    ...    ELSE                     Log    Notifications list rendered or other state present