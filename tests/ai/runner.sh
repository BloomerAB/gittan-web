#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KNOWLEDGE_FILE="$SCRIPT_DIR/knowledge.yaml"
FEATURES_DIR="$SCRIPT_DIR/features"
RESULTS_DIR="$SCRIPT_DIR/.results"
MODEL="${AI_TEST_MODEL:-sonnet}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

command -v claude >/dev/null 2>&1 || { echo "ERROR: claude CLI not found"; exit 1; }

mkdir -p "$RESULTS_DIR"

build_prompt() {
  local scenario_file="$1"
  cat <<'SYSTEM'
You are an AI E2E tester for Gittan. You have Chrome DevTools MCP tools available.

RULES:
1. Execute each step's "action" using Chrome DevTools browser tools
2. After each action, take a screenshot to verify the "expect" condition
3. Use take_snapshot for text verification when screenshots aren't precise enough
4. Set viewport to 1280x800 (desktop) before starting
5. Wait for navigation to complete after clicks that trigger page changes
6. If a recovery rule matches (e.g. login page), execute it and retry
7. Do not invent workarounds for missing features — if it's not there, FAIL

OUTPUT FORMAT — you MUST end your response with exactly this JSON block:
```json
{
  "scenario": "scenario name",
  "steps": [
    { "name": "step name", "status": "pass", "note": "" },
    { "name": "step name", "status": "fail", "error": "what went wrong" }
  ],
  "result": "pass or fail"
}
```

APP KNOWLEDGE:
SYSTEM
  cat "$KNOWLEDGE_FILE"
  echo ""
  echo "SCENARIO:"
  cat "$scenario_file"
}

run_scenario() {
  local scenario_file="$1"
  local name
  name=$(grep '^name:' "$scenario_file" | sed 's/^name: *//' | tr -d '"')
  local output_file="$RESULTS_DIR/$(basename "$scenario_file" .yaml).out"
  local json_file="$RESULTS_DIR/$(basename "$scenario_file" .yaml).json"

  echo -e "${BOLD}▸ $name${NC}"

  local prompt
  prompt="$(build_prompt "$scenario_file")"

  if ! claude -p "$prompt" --model "$MODEL" --output-format text --permission-mode bypassPermissions > "$output_file" 2>&1; then
    echo -e "  ${RED}✗ claude CLI failed${NC}"
    echo "  Output saved to: $output_file"
    return 1
  fi

  local json_result
  json_result=$(sed -n '/```json/,/```/p' "$output_file" | sed '1d;$d' || true)

  if [ -z "$json_result" ]; then
    json_result=$(grep -o '{[^}]*"result"[^}]*}' "$output_file" | tail -1 || true)
  fi

  if [ -z "$json_result" ]; then
    echo -e "  ${YELLOW}⚠ No structured result — check output${NC}"
    echo "  Output: $output_file"
    return 1
  fi

  echo "$json_result" > "$json_file"

  echo "$json_result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for step in data.get('steps', []):
    status = step.get('status', 'unknown')
    name = step.get('name', '?')
    if status == 'pass':
        print(f'  \033[0;32m✓\033[0m {name}')
    else:
        error = step.get('error', step.get('note', ''))
        print(f'  \033[0;31m✗\033[0m {name}')
        if error:
            print(f'    → {error}')
result = data.get('result', 'unknown')
if result == 'pass':
    print(f'  \033[0;32m■ PASS\033[0m')
else:
    print(f'  \033[0;31m■ FAIL\033[0m')
" 2>/dev/null || {
    echo -e "  ${YELLOW}⚠ Could not parse result JSON${NC}"
    echo "  Raw: $json_file"
  }

  echo ""

  local result
  result=$(echo "$json_result" | python3 -c "import sys,json; print(json.load(sys.stdin).get('result','fail'))" 2>/dev/null || echo "fail")
  [ "$result" = "pass" ]
}

# --- Main ---
pattern="${1:-}"
total=0
passed=0
failed=0

echo -e "${BOLD}Gittan AI Test Runner${NC}"
echo "Model: $MODEL"
echo ""

if [ -n "$pattern" ]; then
  files=("$FEATURES_DIR"/$pattern)
else
  files=("$FEATURES_DIR"/*.yaml)
fi

for scenario in "${files[@]}"; do
  [ -f "$scenario" ] || continue
  total=$((total + 1))
  if run_scenario "$scenario"; then
    passed=$((passed + 1))
  else
    failed=$((failed + 1))
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$failed" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}$passed/$total scenarios passed${NC}"
else
  echo -e "${RED}${BOLD}$failed/$total scenarios failed${NC} ($passed passed)"
fi

[ "$failed" -eq 0 ]
