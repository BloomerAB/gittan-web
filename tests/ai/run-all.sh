#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KNOWLEDGE_FILE="$SCRIPT_DIR/knowledge.yaml"
FEATURES_DIR="$SCRIPT_DIR/features"
RUN_ID="${RUN_ID:-$(date +%Y%m%dT%H%M%S)}"
RESULTS_DIR="$SCRIPT_DIR/.results/$RUN_ID"
DEFAULT_MODEL="${AI_TEST_MODEL:-sonnet}"
MAX_PARALLEL="${MAX_PARALLEL:-3}"

mkdir -p "$RESULTS_DIR"
echo "Run ID:    $RUN_ID"
echo "Results:   $RESULTS_DIR"
echo "Model:     $DEFAULT_MODEL"
echo "Parallel:  $MAX_PARALLEL"
echo ""

run_feature() {
  local feature_file="$1"
  local feature_name
  feature_name=$(basename "$feature_file" .yaml)
  local feature_dir="$RESULTS_DIR/$feature_name"
  mkdir -p "$feature_dir"
  local output_file="$feature_dir/output.txt"
  local json_file="$feature_dir/result.json"

  local prompt
  prompt=$(cat <<PROMPT_EOF
You are an AI E2E tester for Gittan. You have Chrome DevTools MCP tools.

RULES:
1. Set viewport to 1280x800 (desktop) before starting.
2. Execute each step's "action" using Chrome DevTools tools.
3. After EACH step, take_screenshot with filePath: $feature_dir/{case-id}-step-{n}.png — this is your PRIMARY verification.
4. AVOID take_snapshot unless text verification is impossible from screenshots. Each tool call costs ~5s of agent latency; minimize them.
5. If you hit a login page, perform OTP login using the recovery rules. Get OTP with:
   docker exec gittan-scylla cqlsh -e "SELECT otp FROM gittan_auth.otp_codes WHERE email='mal.nordstrom@gmail.com' LIMIT 1;"
   - Use Bash tool to run this command.
6. After OTP submit, you are redirected back to Gittan at localhost:5555.
7. Do not invent workarounds — if a feature is missing, mark step FAIL.

EFFICIENCY:
- Emit NO commentary or narration between tool calls. Just call tools.
- ONLY emit text in the final JSON block at the very end.
- One step = action, screenshot, verify visually, mark status. Move on.
- Do not over-verify with multiple snapshots/screenshots per step.

APP KNOWLEDGE:
$(cat "$KNOWLEDGE_FILE")

FEATURE FILE:
$(cat "$feature_file")

OUTPUT FORMAT — end your response with EXACTLY this JSON block (no additional text after):
\`\`\`json
{
  "feature": "$feature_name",
  "cases": [
    {
      "id": "case-id",
      "name": "case name",
      "result": "pass",
      "steps": [
        {"number": 1, "action": "...", "expect": "...", "status": "pass", "note": "", "screenshot": "$feature_name/{case-id}-step-1.png"}
      ]
    }
  ]
}
\`\`\`

Start now.
PROMPT_EOF
)

  echo "[$feature_name][$DEFAULT_MODEL] starting..."
  cd /Users/malin/repo-gittan/web
  if claude -p "$prompt" \
      --model "$DEFAULT_MODEL" \
      --output-format text \
      --permission-mode bypassPermissions \
      > "$output_file" 2>&1; then
    echo "[$feature_name] subprocess done"
  else
    echo "[$feature_name] subprocess failed (exit $?)"
  fi

  local json_block
  json_block=$(sed -n '/```json/,/```/p' "$output_file" | sed '1d;$d')
  if [ -n "$json_block" ]; then
    echo "$json_block" > "$json_file"
    echo "[$feature_name] result.json saved"
  else
    echo "[$feature_name] no JSON block found in output"
    echo '{"feature":"'$feature_name'","cases":[],"error":"no JSON in output"}' > "$json_file"
  fi
}

features=()
if [ $# -gt 0 ]; then
  for arg in "$@"; do
    features+=("$FEATURES_DIR/$arg.yaml")
  done
else
  features=("$FEATURES_DIR"/*.yaml)
fi

running=0
for feature in "${features[@]}"; do
  [ -f "$feature" ] || continue
  while [ $running -ge $MAX_PARALLEL ]; do
    wait -n
    running=$((running - 1))
  done
  run_feature "$feature" &
  running=$((running + 1))
done

wait
echo ""
echo "All features finished. Aggregating..."

python3 <<PYTHON
import json, os, glob
from datetime import datetime

results_dir = "$RESULTS_DIR"
features = []
total_cases = total_steps = passed_cases = passed_steps = failed_cases = failed_steps = 0

for json_file in sorted(glob.glob(f"{results_dir}/*/result.json")):
    with open(json_file) as f:
        data = json.load(f)
    if not data.get("cases"):
        continue
    feature_name = data.get("feature", "unknown")
    cases = data["cases"]
    feature_passed_cases = sum(1 for c in cases if c.get("result") == "pass")
    feature_failed_cases = len(cases) - feature_passed_cases
    feature_passed_steps = sum(sum(1 for s in c.get("steps", []) if s.get("status") == "pass") for c in cases)
    feature_failed_steps = sum(sum(1 for s in c.get("steps", []) if s.get("status") != "pass") for c in cases)
    features.append({"feature": feature_name, "name": feature_name.capitalize(), "cases": cases})
    total_cases += len(cases)
    total_steps += feature_passed_steps + feature_failed_steps
    passed_cases += feature_passed_cases
    failed_cases += feature_failed_cases
    passed_steps += feature_passed_steps
    failed_steps += feature_failed_steps

run = {
    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
    "run_id": "$RUN_ID",
    "model": "$DEFAULT_MODEL",
    "features": features,
    "summary": {
        "total_features": len(features),
        "total_cases": total_cases,
        "total_steps": total_steps,
        "passed_steps": passed_steps,
        "failed_steps": failed_steps,
        "passed_cases": passed_cases,
        "failed_cases": failed_cases,
    },
}
with open(f"{results_dir}/run.json", "w") as f:
    json.dump(run, f, indent=2)

print(f"\nSUMMARY: {passed_cases}/{total_cases} cases, {passed_steps}/{total_steps} steps")
PYTHON

cd "$SCRIPT_DIR"
if [ -f "report.mjs" ]; then
  node report.mjs ".results/$RUN_ID"
  echo "HTML report: $RESULTS_DIR/report.html"
fi
