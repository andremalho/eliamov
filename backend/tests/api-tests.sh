#!/bin/bash
set -e

BASE="http://localhost:3001"
PASS=0
FAIL=0

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

assert_status() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo -e "${GREEN}PASS${NC} $name (HTTP $actual)"
    ((PASS++))
  else
    echo -e "${RED}FAIL${NC} $name (expected $expected, got $actual)"
    ((FAIL++))
  fi
}

echo "=== eliaMov API Tests ==="
echo ""

# 1. Health check
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/health)
assert_status "Health check" "200" "$STATUS"

# 2. Register
RES=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"Test User $(date +%s)\",\"email\":\"test$(date +%s)@test.com\",\"password\":\"123456\",\"profileType\":\"female_user\"}")
STATUS=$(echo "$RES" | tail -1)
BODY=$(echo "$RES" | head -1)
assert_status "Register" "201" "$STATUS"
TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "Cannot continue without token"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

# 3. Get me
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/auth/me -H "$AUTH")
assert_status "GET /auth/me" "200" "$STATUS"

# 4. Onboarding steps
for STEP in 1 2 3 4; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH $BASE/auth/onboarding/step -H "$AUTH" -H 'Content-Type: application/json' -d "{\"step\":$STEP,\"data\":{\"name\":\"Test\"}}")
  assert_status "Onboarding step $STEP" "200" "$STATUS"
done

# 5. Cycle
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/cycle -H "$AUTH" -H 'Content-Type: application/json' -d '{"startDate":"2026-04-01","cycleLength":28,"periodLength":5}')
assert_status "POST /cycle" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/cycle -H "$AUTH")
assert_status "GET /cycle" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/cycle/current -H "$AUTH")
assert_status "GET /cycle/current" "200" "$STATUS"

# 6. Training
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/training/today -H "$AUTH")
assert_status "GET /training/today" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/training/library -H "$AUTH")
assert_status "GET /training/library" "200" "$STATUS"

# 7. Mood
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/mood -H "$AUTH" -H 'Content-Type: application/json' -d '{"date":"2026-04-12","energy":4,"mood":3,"pain":false}')
assert_status "POST /mood" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/mood -H "$AUTH")
assert_status "GET /mood" "200" "$STATUS"

# 8. Nutrition
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/nutrition -H "$AUTH" -H 'Content-Type: application/json' -d '{"date":"2026-04-12","meal":"lunch","description":"Frango e arroz","calories":450}')
assert_status "POST /nutrition" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/nutrition/goal -H "$AUTH")
assert_status "GET /nutrition/goal" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/nutrition/summary/daily?date=2026-04-12" -H "$AUTH")
assert_status "GET /nutrition/summary/daily" "200" "$STATUS"

# 9. Feed
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/feed/posts -H "$AUTH" -H 'Content-Type: application/json' -d '{"content":"Test post","postType":"free"}')
assert_status "POST /feed/posts" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/feed -H "$AUTH")
assert_status "GET /feed" "200" "$STATUS"

# 10. AI Chat
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/ai-engine/chat -H "$AUTH" -H 'Content-Type: application/json' -d '{"message":"O que devo treinar hoje?"}')
assert_status "POST /ai-engine/chat" "201" "$STATUS"

# 11. Insights
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/ai-engine/insights -H "$AUTH")
assert_status "GET /ai-engine/insights" "200" "$STATUS"

# 12. Gamification
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/gamification/stats -H "$AUTH")
assert_status "GET /gamification/stats" "200" "$STATUS"

# 13. Notifications
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/notifications -H "$AUTH")
assert_status "GET /notifications" "200" "$STATUS"

# 14. Weight loss assessment
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/weight-loss/assessment -H "$AUTH" -H 'Content-Type: application/json' -d '{"age":30,"biologicalSex":"F","weightKg":70,"heightCm":165,"targetWeightKg":60,"deadlineMonths":6,"activityFactor":1.55,"comorbidity":"none"}')
assert_status "POST /weight-loss/assessment" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/weight-loss/assessment -H "$AUTH")
assert_status "GET /weight-loss/assessment" "200" "$STATUS"

# 15. Content categories
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/content/categories -H "$AUTH")
assert_status "GET /content/categories" "200" "$STATUS"

# 16. Challenges
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/challenges -H "$AUTH")
assert_status "GET /challenges" "200" "$STATUS"

# 17. Calendar
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/calendar/connections -H "$AUTH")
assert_status "GET /calendar/connections" "200" "$STATUS"

# 18. FemaleZoneGuard test - register as trainer
TRES=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"Trainer Test\",\"email\":\"trainer$(date +%s)@test.com\",\"password\":\"123456\",\"profileType\":\"personal_trainer\"}")
TSTATUS=$(echo "$TRES" | tail -1)
TBODY=$(echo "$TRES" | head -1)
TTOKEN=$(echo "$TBODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -n "$TTOKEN" ]; then
  # Complete onboarding for trainer
  for STEP in 1 2; do
    curl -s -o /dev/null -X PATCH $BASE/auth/onboarding/step -H "Authorization: Bearer $TTOKEN" -H 'Content-Type: application/json' -d "{\"step\":$STEP,\"data\":{\"name\":\"Trainer\"}}"
  done

  TSTATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/feed -H "Authorization: Bearer $TTOKEN")
  assert_status "FemaleZoneGuard: trainer -> feed = 403" "403" "$TSTATUS"

  TSTATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE/cycle -H "Authorization: Bearer $TTOKEN")
  assert_status "FemaleZoneGuard: trainer -> cycle = 403" "403" "$TSTATUS"
fi

echo ""
echo "=== Results ==="
echo -e "${GREEN}PASS: $PASS${NC}"
echo -e "${RED}FAIL: $FAIL${NC}"
echo "Total: $((PASS + FAIL))"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
