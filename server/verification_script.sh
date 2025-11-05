#!/bin/bash

# Backend Verification Script
# Tests all API endpoints and functionality

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 FlexCalling Backend Verification"
echo "===================================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to test with JSON validation
test_json_response() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_field=$4

    echo -n "Testing: $name... "
    
    response=$(curl -s -X $method "$BASE_URL$endpoint")
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
        echo "  → Found field: $expected_field"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  → Missing field: $expected_field"
        echo "  → Response: $response"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📡 1. HEALTH CHECKS"
echo "-------------------"
test_endpoint "Basic Health Check" "GET" "/health" "" "200"
test_endpoint "Database Health Check" "GET" "/health/db" "" "200"
echo ""

echo "🔑 2. TOKEN GENERATION"
echo "----------------------"
test_json_response "Generate Token for User 1" "GET" "/api/token" "data.token"
test_json_response "Generate Token with User ID" "GET" "/api/token?userId=123" "data.identity"
echo ""

echo "👤 3. USER OPERATIONS"
echo "---------------------"
test_json_response "Get User Profile" "GET" "/api/users/1" "data.name"
test_endpoint "Get Non-existent User" "GET" "/api/users/nonexistent" "" "404"

# Update user
USER_UPDATE='{"name":"John Updated","email":"updated@test.com"}'
test_endpoint "Update User Profile" "PUT" "/api/users/1" "$USER_UPDATE" "200"

# Update balance
BALANCE_UPDATE='{"balance":100.00}'
test_endpoint "Update User Balance" "PUT" "/api/users/1/balance" "$BALANCE_UPDATE" "200"

INVALID_BALANCE='{"balance":-10}'
test_endpoint "Reject Negative Balance" "PUT" "/api/users/1/balance" "$INVALID_BALANCE" "400"
echo ""

echo "📇 4. CONTACT OPERATIONS"
echo "------------------------"
test_json_response "Get All Contacts" "GET" "/api/contacts?userId=1" "data"

# Get first contact ID for further tests
FIRST_CONTACT_ID=$(curl -s "$BASE_URL/api/contacts?userId=1" | jq -r '.data[0].id')
echo "  → Using contact ID: $FIRST_CONTACT_ID"

test_json_response "Get Specific Contact" "GET" "/api/contacts/$FIRST_CONTACT_ID?userId=1" "data.name"
test_endpoint "Get Non-existent Contact" "GET" "/api/contacts/nonexistent?userId=1" "" "404"

# Create new contact
NEW_CONTACT=$(cat <<EOF
{
  "id": "test-contact-$(date +%s)",
  "name": "Test Contact",
  "phone": "+254799999999",
  "email": "test@example.com",
  "location": "Test City",
  "favorite": false,
  "avatarColor": "#FF5733"
}
EOF
)
test_endpoint "Create New Contact" "POST" "/api/contacts?userId=1" "$NEW_CONTACT" "201"

# Get the created contact ID
CREATED_CONTACT_ID=$(curl -s -X POST "$BASE_URL/api/contacts?userId=1" \
    -H "Content-Type: application/json" \
    -d "$NEW_CONTACT" | jq -r '.data.id')

# Update contact
CONTACT_UPDATE='{"name":"Updated Contact","favorite":true}'
test_endpoint "Update Contact" "PUT" "/api/contacts/$CREATED_CONTACT_ID?userId=1" "$CONTACT_UPDATE" "200"

# Delete contact
test_endpoint "Delete Contact" "DELETE" "/api/contacts/$CREATED_CONTACT_ID?userId=1" "" "200"
test_endpoint "Verify Contact Deleted" "GET" "/api/contacts/$CREATED_CONTACT_ID?userId=1" "" "404"
echo ""

echo "📞 5. CALL OPERATIONS"
echo "---------------------"
# Get pricing
test_json_response "Get Kenya Pricing" "GET" "/api/calls/pricing/+254712345678" "data.ratePerMinute"
test_json_response "Get Default Pricing" "GET" "/api/calls/pricing/+15551234567" "data.ratePerMinute"

# Initiate call
CALL_REQUEST='{"to":"+254712345678","from":"+19191234567"}'
test_endpoint "Initiate Outbound Call" "POST" "/api/calls" "$CALL_REQUEST" "200"

INVALID_CALL='{"to":"+254712345678"}'
test_endpoint "Reject Call Without Caller" "POST" "/api/calls" "$INVALID_CALL" "400"

# Get call history
test_json_response "Get Call History" "GET" "/api/calls/history?userId=1" "data"
test_json_response "Get Call History with Limit" "GET" "/api/calls/history?userId=1&limit=5" "data"

# Get call history for contact
test_json_response "Get Contact Call History" "GET" "/api/calls/history/contact/+254712345678?userId=1" "data"

# Save call record
CALL_RECORD=$(cat <<EOF
{
  "callSid": "CA$(date +%s)",
  "from": "+19191234567",
  "to": "+254712345678",
  "direction": "outgoing",
  "status": "completed",
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "endTime": "$(date -u -d '+2 minutes' +%Y-%m-%dT%H:%M:%SZ)",
  "duration": 120,
  "cost": 0.10,
  "ratePerMinute": 0.05
}
EOF
)
test_endpoint "Save Call History" "POST" "/api/calls/history?userId=1" "$CALL_RECORD" "201"
echo ""

echo "🔊 6. VOICE/TWIML OPERATIONS"
echo "----------------------------"
# Generate TwiML
TWIML_REQUEST='{"To":"+254712345678"}'
test_endpoint "Generate TwiML" "POST" "/api/voice/twiml" "$TWIML_REQUEST" "200"

test_endpoint "TwiML Without Destination" "POST" "/api/voice/twiml" "{}" "400"

# Status callback
STATUS_CALLBACK=$(cat <<EOF
{
  "CallSid": "CA123456789",
  "CallStatus": "completed",
  "CallDuration": "120",
  "From": "+19191234567",
  "To": "+254712345678"
}
EOF
)
test_endpoint "Handle Status Callback" "POST" "/api/voice/status" "$STATUS_CALLBACK" "200"
echo ""

echo "❌ 7. ERROR HANDLING"
echo "--------------------"
test_endpoint "Non-existent Route" "GET" "/api/nonexistent" "" "404"
echo ""

echo "📊 SUMMARY"
echo "=========="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
