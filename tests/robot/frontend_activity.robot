*** Settings ***
Library    Browser
Resource   resources/auth_keywords.robot

Suite Setup       Setup Activity Page
Suite Teardown    Close Browser    ALL

*** Keywords ***
Setup Activity Page
    Login As Test User
    Go To    ${BASE_URL}/activity

*** Test Cases ***
Activity Header Is Visible
    [Documentation]    Verify the Activity page header shows after login.
    # Use ARIA role selector so we only match the main "Activity" heading
    Wait For Elements State    role=heading[name="Activity"]    visible    timeout=10s

Activity Has Time Range Tabs
    [Documentation]    Check that the Day/Week/Month tabs are rendered.
    Wait For Elements State    text=Day      visible    timeout=10s
    Wait For Elements State    text=Week     visible    timeout=10s
    Wait For Elements State    text=Month    visible    timeout=10s