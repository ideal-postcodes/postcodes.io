#!/bin/bash

# Test script for postcodes.io API endpoints
# Usage: ./test_endpoints.sh [base_url]
# Default base_url: http://localhost:8000

BASE_URL="${1:-http://localhost:8000}"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"

    TOTAL=$((TOTAL + 1))

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "${BASE_URL}${endpoint}")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    # Check if response contains "status" field with expected value
    status_in_body=$(echo "$body" | grep -o '"status":[0-9]*' | head -1 | grep -o '[0-9]*')

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $name"
        echo -e "  Expected HTTP $expected_status, got HTTP $http_code"
        echo -e "  Response: $(echo "$body" | head -c 200)"
        FAILED=$((FAILED + 1))
    fi
}

echo "============================================"
echo "Postcodes.io API Endpoint Tests"
echo "Base URL: $BASE_URL"
echo "============================================"
echo ""

# ==========================================
# POSTCODE ENDPOINTS
# ==========================================
echo -e "${YELLOW}=== Postcode Endpoints ===${NC}"

# Lookup postcode
test_endpoint "Postcode lookup" "GET" "/postcodes/SW1A1AA" "" "200"

# Postcode lookup (not found)
test_endpoint "Postcode lookup (404)" "GET" "/postcodes/INVALID123" "" "404"

# Random postcode
test_endpoint "Random postcode" "GET" "/random/postcodes" "" "200"

# Random postcode with outcode filter
test_endpoint "Random postcode (filtered by outcode)" "GET" "/random/postcodes?outcode=SW1" "" "200"

# Postcode query
test_endpoint "Postcode query" "GET" "/postcodes?q=SW1A&limit=3" "" "200"

# Postcode autocomplete
test_endpoint "Postcode autocomplete" "GET" "/postcodes/SW1A1/autocomplete" "" "200"

# Nearest postcodes to postcode
test_endpoint "Nearest postcodes" "GET" "/postcodes/SW1A1AA/nearest" "" "200"

# Reverse geocode postcode
test_endpoint "Reverse geocode postcode" "GET" "/postcodes?lon=-0.127&lat=51.507" "" "200"

# Reverse geocode postcode with limit
test_endpoint "Reverse geocode postcode (with params)" "GET" "/postcodes?lon=-0.127&lat=51.507&limit=5&radius=500" "" "200"

# Validate postcode (valid)
test_endpoint "Validate postcode (valid)" "GET" "/postcodes/SW1A1AA/validate" "" "200"

# Bulk postcode lookup
test_endpoint "Bulk postcode lookup" "POST" "/postcodes" '{"postcodes":["SW1A1AA","M451FJ"]}' "200"

# Bulk postcode lookup with filter
test_endpoint "Bulk postcode lookup (filtered)" "POST" "/postcodes?filter=postcode,longitude,latitude" '{"postcodes":["SW1A1AA","M451FJ"]}' "200"

# Bulk reverse geocode
test_endpoint "Bulk reverse geocode" "POST" "/postcodes" '{"geolocations":[{"longitude":-0.127,"latitude":51.507},{"longitude":-2.298,"latitude":53.513}]}' "200"

echo ""

# ==========================================
# OUTCODE ENDPOINTS
# ==========================================
echo -e "${YELLOW}=== Outcode Endpoints ===${NC}"

# Lookup outcode
test_endpoint "Outcode lookup" "GET" "/outcodes/SW1A" "" "200"

# Outcode lookup (not found)
test_endpoint "Outcode lookup (404)" "GET" "/outcodes/ZZ99" "" "404"

# Nearest outcodes
test_endpoint "Nearest outcodes" "GET" "/outcodes/SW1A/nearest" "" "200"

# Reverse geocode outcode
test_endpoint "Reverse geocode outcode" "GET" "/outcodes?lon=-0.127&lat=51.507" "" "200"

echo ""

# ==========================================
# PLACE ENDPOINTS
# ==========================================
echo -e "${YELLOW}=== Place Endpoints ===${NC}"

# Place query
test_endpoint "Place query" "GET" "/places?q=London&limit=3" "" "200"

# Place lookup (using a known place code)
test_endpoint "Place lookup" "GET" "/places/osgb4000000074564391" "" "200"

# Random place
test_endpoint "Random place" "GET" "/random/places" "" "200"

echo ""

# ==========================================
# TERMINATED POSTCODE ENDPOINTS
# ==========================================
echo -e "${YELLOW}=== Terminated Postcode Endpoints ===${NC}"

# Terminated postcode lookup
test_endpoint "Terminated postcode lookup" "GET" "/terminated_postcodes/E1W1UU" "" "200"

# Terminated postcode (not found - using active postcode)
test_endpoint "Terminated postcode (404)" "GET" "/terminated_postcodes/SW1A1AA" "" "404"

echo ""

# ==========================================
# SCOTTISH POSTCODE ENDPOINTS
# ==========================================
echo -e "${YELLOW}=== Scottish Postcode Endpoints ===${NC}"

# Scottish postcode lookup
test_endpoint "Scottish postcode lookup" "GET" "/scotland/postcodes/EH12QZ" "" "200"

# Scottish postcode (not found)
test_endpoint "Scottish postcode (404 - not in SPD)" "GET" "/scotland/postcodes/SW1A1AA" "" "404"

echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "============================================"
echo "Test Summary"
echo "============================================"
echo -e "Total:  $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
