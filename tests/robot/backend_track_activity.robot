*** Settings ***
Library    RequestsLibrary

*** Variables ***
${SUPABASE_FUNCTION_URL}     https://otirjcxvwphevesfqbee.supabase.co/functions/v1/track-activity
${SUPABASE_PUBLISHABLE_KEY}  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aXJqY3h2d3BoZXZlc2ZxYmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNDIsImV4cCI6MjA3NjE3OTE0Mn0.CXZ34QnpduWNJHd9D7aQ9Cj3-Heuw0-bFqzHfeocMnc

*** Keywords ***
Create Track Activity Session
    &{headers}=    Create Dictionary
    ...    apikey=${SUPABASE_PUBLISHABLE_KEY}
    ...    Authorization=Bearer ${SUPABASE_PUBLISHABLE_KEY}
    ...    Content-Type=application/json
    Create Session    track_activity    ${SUPABASE_FUNCTION_URL}    headers=${headers}

*** Test Cases ***
Track Activity Function Responds
    Create Track Activity Session

    &{payload}=    Create Dictionary
    ...    timestamp=2025-01-01T00:00:00Z
    ...    duration_seconds=120
    ...    activity=Walk
    ...    confidence=0.95
    ...    user=robot-test-user
    ...    device=robot-device

    ${resp}=    Post On Session    track_activity    /    json=${payload}    expected_status=any

    ${status}=    Set Variable    ${resp.status_code}
    Log To Console    track-activity status: ${status}