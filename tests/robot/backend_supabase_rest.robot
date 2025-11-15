*** Settings ***
Library    RequestsLibrary

*** Variables ***
${SUPABASE_URL}              https://otirjcxvwphevesfqbee.supabase.co
${SUPABASE_REST_URL}         ${SUPABASE_URL}/rest/v1
${SUPABASE_PUBLISHABLE_KEY}  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aXJqY3h2d3BoZXZlc2ZxYmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDMxNDIsImV4cCI6MjA3NjE3OTE0Mn0.CXZ34QnpduWNJHd9D7aQ9Cj3-Heuw0-bFqzHfeocMnc

*** Keywords ***
Create Supabase Session
    &{headers}=    Create Dictionary
    ...    apikey=${SUPABASE_PUBLISHABLE_KEY}
    ...    Authorization=Bearer ${SUPABASE_PUBLISHABLE_KEY}
    ...    Content-Type=application/json
    Create Session    supabase    ${SUPABASE_REST_URL}    headers=${headers}

*** Test Cases ***
Activity Types Table Is Reachable
    Create Supabase Session
    ${resp}=    Get On Session    supabase    url=/activity_types    params=select=*
    Should Be Equal As Integers    ${resp.status_code}    200

User Profiles Table Is Reachable
    Create Supabase Session
    ${resp}=    Get On Session    supabase    url=/user_profiles    params=select=*
    Should Be Equal As Integers    ${resp.status_code}    200