*** Settings ***
Library           Browser
Resource          resources/auth_keywords.robot

Suite Setup       Login As Test User And Open Page    /profile
Suite Teardown    Close Browser    ALL

*** Variables ***
${BASE_URL}       http://localhost:8080

*** Test Cases ***
Profile Header Is Visible
    [Documentation]    Verify the Profile page header is rendered.
    # h1 "Profile"
    Wait For Elements State    text=Profile    visible    timeout=10s


Profile Shows Account Information Section
    [Documentation]    Verify that the main profile info section (e.g. Name field) is visible.
    # The UI uses a Label "Name" for the main field – we assert that.
    ${el}=    Get Element    text=Name
    Should Not Be Equal    ${el}    ${None}


Profile Shows Notification Settings
    [Documentation]    Verify the notification settings card is visible.
    # The heading in your React code is exactly "Notification Setting"
    Wait For Elements State    text=Notification Setting    visible    timeout=10s