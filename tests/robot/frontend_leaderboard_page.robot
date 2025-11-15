*** Settings ***
Library    Browser
Resource   resources/auth_keywords.robot

Suite Setup       Login As Test User And Open Page    /leaderboard
Suite Teardown    Close Browser

*** Test Cases ***
Leaderboard Header Is Visible :: Verify the Leaderboard page header is shown
    ${heading}=    Get Text    role=heading[name="Leaderboard"]
    Should Be Equal    ${heading}    Leaderboard

Leaderboard Shows List Or Empty State :: Verify the leaderboard list or empty state
    # Try to read at least one row in the leaderboard table
    ${has_rows}=    Run Keyword And Return Status    Get Text    css=tbody tr

    IF    ${has_rows}
        Log    Leaderboard has at least one row.
    ELSE
        ${empty_text}=    Get Text    text=No leaderboard data
        Should Contain    ${empty_text}    No leaderboard data
    END