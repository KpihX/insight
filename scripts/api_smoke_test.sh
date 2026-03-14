#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook}"
JQ_BIN="${JQ_BIN:-jq}"
CURL_BIN="${CURL_BIN:-curl}"

if ! command -v "$CURL_BIN" >/dev/null 2>&1; then
  echo "Missing required dependency: curl" >&2
  exit 1
fi

if ! command -v "$JQ_BIN" >/dev/null 2>&1; then
  echo "Missing required dependency: jq" >&2
  exit 1
fi

PASS_COUNT=0
FAIL_COUNT=0
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

divider() {
  printf '\n%s\n' "================================================================"
}

headline() {
  divider
  printf '%s\n' "$1"
  divider
}

status_label() {
  if [[ "$1" == "PASS" ]]; then
    printf '%s' "[PASS]"
  else
    printf '%s' "[FAIL]"
  fi
}

run_test() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected="$4"
  local assertion="$5"
  local body="${6:-}"

  local body_file="$TMP_DIR/body.json"
  local headers_file="$TMP_DIR/headers.txt"
  local curl_cmd
  local status
  local actual
  local outcome
  local curl_exit=0

  rm -f "$body_file" "$headers_file"

  if [[ -n "$body" ]]; then
    curl_cmd="$CURL_BIN -sS -X $method '$url' -H 'Content-Type: application/json' -d '$body' | $JQ_BIN"
    set +e
    "$CURL_BIN" -sS -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -D "$headers_file" \
      -o "$body_file" \
      -d "$body"
    curl_exit=$?
    set -e
  else
    curl_cmd="$CURL_BIN -sS '$url' | $JQ_BIN"
    set +e
    "$CURL_BIN" -sS -X "$method" "$url" \
      -D "$headers_file" \
      -o "$body_file"
    curl_exit=$?
    set -e
  fi

  if [[ "$curl_exit" -ne 0 ]]; then
    outcome="FAIL"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf '%s %s\n' "$(status_label "$outcome")" "$name"
    printf 'Method   : %s\n' "$method"
    printf 'URL      : %s\n' "$url"
    printf 'Expected : %s\n' "$expected"
    printf 'HTTP     : request failed\n'
    printf 'Check    : curl exit code %s\n' "$curl_exit"
    printf 'curl     : %s\n' "$curl_cmd"
    printf 'Response :\n'
    if [[ -s "$body_file" ]]; then
      "$JQ_BIN" . "$body_file" 2>/dev/null || sed -n '1,120p' "$body_file"
    else
      printf '%s\n' '{"error":"curl request failed before a response body was captured"}'
    fi
    printf '\n'
    return
  fi

  status="$(awk 'toupper($1) ~ /^HTTP/ {code=$2} END {print code}' "$headers_file")"
  actual="$("$JQ_BIN" -c "$assertion" "$body_file" 2>/dev/null || true)"

  if [[ "$actual" == "true" ]]; then
    outcome="PASS"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    outcome="FAIL"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi

  printf '%s %s\n' "$(status_label "$outcome")" "$name"
  printf 'Method   : %s\n' "$method"
  printf 'URL      : %s\n' "$url"
  printf 'Expected : %s\n' "$expected"
  printf 'HTTP     : %s\n' "${status:-unknown}"
  printf 'Check    : %s\n' "${actual:-false}"
  printf 'curl     : %s\n' "$curl_cmd"
  printf 'Response :\n'
  "$JQ_BIN" . "$body_file" 2>/dev/null || sed -n '1,120p' "$body_file"
  printf '\n'
}

headline "insight API smoke tests"
printf 'Base URL: %s\n' "$BASE_URL"

run_test \
  "Brief for teacher staff_1" \
  "GET" \
  "$BASE_URL/dashboard/brief?role=teacher&staff_id=staff_1" \
  "HTTP 200 and greeting personalized for Sarah Lee." \
  '.greeting == "Good morning, Sarah Lee." and (.stats | type == "object")'

run_test \
  "Brief for admin staff_4" \
  "GET" \
  "$BASE_URL/dashboard/brief?role=admin&staff_id=staff_4" \
  "HTTP 200 and greeting personalized for David Brown." \
  '.greeting == "Good morning, David Brown." and (.stats | type == "object")'

run_test \
  "Feed for teacher staff_1" \
  "GET" \
  "$BASE_URL/dashboard/feed?role=teacher&staff_id=staff_1" \
  "HTTP 200 and non-empty items array." \
  '(.items | type == "array") and ((.items | length) > 0)'

run_test \
  "Feed filtered on absence_report" \
  "GET" \
  "$BASE_URL/dashboard/feed?role=teacher&staff_id=staff_1&categories=absence_report" \
  "HTTP 200 and every card category equals absence_report." \
  '(.items | type == "array") and (all(.items[]?; .category == "absence_report"))'

run_test \
  "Detail for SEED-EVENT-0001" \
  "GET" \
  "$BASE_URL/dashboard/event?id=SEED-EVENT-0001" \
  "HTTP 200 and detail payload for Jane Doe / SEED-EVENT-0001." \
  '.id == "SEED-EVENT-0001" and .sender.name == "Jane Doe"'

run_test \
  "Mark SEED-EVENT-0001 handled" \
  "POST" \
  "$BASE_URL/dashboard/action" \
  "HTTP 200 and handled action succeeds." \
  '.success == true and .new_status == "handled"' \
  '{"event_id":"SEED-EVENT-0001","action":"handled","actor_id":"staff_1","note":"Handled during shell smoke test"}'

run_test \
  "Detail after handled" \
  "GET" \
  "$BASE_URL/dashboard/event?id=SEED-EVENT-0001" \
  "HTTP 200 and event status becomes handled." \
  '.id == "SEED-EVENT-0001" and .status == "handled"'

run_test \
  "Archive SEED-EVENT-0001" \
  "POST" \
  "$BASE_URL/dashboard/action" \
  "HTTP 200 and archive action succeeds." \
  '.success == true and .new_status == "archived"' \
  '{"event_id":"SEED-EVENT-0001","action":"archive","actor_id":"staff_1","note":"Archived during shell smoke test"}'

run_test \
  "Detail after archive" \
  "GET" \
  "$BASE_URL/dashboard/event?id=SEED-EVENT-0001" \
  "HTTP 200 and event status becomes archived." \
  '.id == "SEED-EVENT-0001" and .status == "archived"'

headline "summary"
printf 'Passed: %d\n' "$PASS_COUNT"
printf 'Failed: %d\n' "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
