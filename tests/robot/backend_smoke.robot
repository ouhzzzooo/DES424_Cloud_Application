*** Settings ***
Library    RequestsLibrary

*** Variables ***
${BASE_URL}    http://localhost:8080

*** Test Cases ***
Frontend Root Returns 200
    Create Session    acttrack    ${BASE_URL}
    ${resp}=    Get On Session    acttrack    /
    Should Be Equal As Integers    ${resp.status_code}    200