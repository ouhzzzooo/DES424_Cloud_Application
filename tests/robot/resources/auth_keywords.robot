*** Settings ***
Library    Browser

*** Variables ***
${BASE_URL}       http://localhost:8080
${TEST_EMAIL}     ouh@test.com
${TEST_PASSWORD}  ouh123

*** Keywords ***
Login As Test User
    [Documentation]    Open browser, go to /auth, and log in as the test user.
    New Browser    chromium    headless=${TRUE}
    New Page       ${BASE_URL}/auth

    Wait For Elements State    id=signin-email    visible    timeout=10s
    Fill Text    id=signin-email       ${TEST_EMAIL}
    Fill Text    id=signin-password    ${TEST_PASSWORD}

    # This is the real submit button (not the "Sign In" tab)
    Click    role=button[name="Sign In"]

    # Wait until dashboard is loaded
    Wait For Elements State    text=Home Dashboard    visible    timeout=10s


Login As Test User And Open Page
    [Documentation]    Login and then navigate to a specific path (e.g. /profile).
    [Arguments]    ${path}
    Login As Test User
    Go To    ${BASE_URL}${path}
    # Ensure main app shell is visible
    Wait For Elements State    text=ActTrack    visible    timeout=10s