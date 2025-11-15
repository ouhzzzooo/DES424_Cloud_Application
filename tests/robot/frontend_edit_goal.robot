*** Settings ***
Library           Browser
Resource          resources/auth_keywords.robot

Suite Setup       Login As Test User
Suite Teardown    Close Browser    ALL

*** Variables ***
${BASE_URL}       http://localhost:8080

*** Test Cases ***
Edit Goal Placeholder
    [Documentation]    Placeholder E2E: just verify Goals page loads after login.
    Go To    ${BASE_URL}/goals
    # Header in Goals.tsx is "My goals" (lowercase g)
    Wait For Elements State    text=My goals    visible    timeout=10s
    Pass Execution    Skipping detailed edit-goal verification (no stable goal id to edit yet).