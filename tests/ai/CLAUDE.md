# AI E2E Test Framework

You are testing Gittan — a team-centric git hosting platform. You interact with the app
through Chrome DevTools MCP tools (screenshots, clicks, fills, navigation).

## How to run a test

1. Read `knowledge.yaml` for app context
2. Read the feature file from `features/`
3. Set viewport to 1280x800 (desktop) before starting
4. Navigate to the app URL from the feature file
5. Execute each step: perform the action, verify the expect
6. If a recovery rule matches (e.g. session expired), execute it and retry

## MCP tools you use

Chrome DevTools MCP — NOT Playwright. Key tools:

- `navigate_page` — go to URL
- `take_screenshot` — see current state
- `click` — click elements
- `fill` — type into inputs
- `take_snapshot` — get DOM accessibility tree (useful for verifying text content)
- `wait_for` — wait for element/navigation
- `press_key` — keyboard input
- `emulate` — set device viewport

## Rules

1. Always take a screenshot after each action to verify the expect condition
2. Use `take_snapshot` when you need to verify text content that might not be visible in screenshots
3. Admin pages are in English
4. Desktop-first — sidebar navigation is on the left, content area fills the right
5. After navigation actions, wait for the page to settle before taking a screenshot
6. If you hit an unexpected state, check recovery rules before failing
7. Report each step as PASS or FAIL with a short note
8. Do not invent workarounds for missing features — if something isn't there, FAIL the step
9. If a test creates data (teams, steps, policies), note it so cleanup can happen
10. Dark theme — backgrounds are very dark (surface-900), gold accent buttons (accent-600)

## Auth flow

Gittan uses OTP email login via a separate login app at a different subdomain.

Flow:
1. App (localhost:5555) redirects to auth-server which redirects to login app (localhost:5176)
2. On login app: enter email, submit
3. Get OTP from ScyllaDB: `docker exec gittan-scylla cqlsh -e "SELECT otp FROM gittan_auth.otp_codes WHERE email='mal.nordstrom@gmail.com' LIMIT 1;"`
   - Use Bash tool to run this command
4. Enter OTP in the login app (input field)
5. Submit — you are redirected back to Gittan with session

## Recovery

If you detect a login/session screen when you shouldn't be on one:

1. Navigate to the login app (see knowledge.yaml for URL and test user)
2. Complete OTP login
3. After redirect back to app, retry the failed step

## Writing new tests

- One feature file per domain (teams, settings, auth, steps, policies, audit)
- Keep steps as natural language — the AI figures out selectors
- Use `data-testid` attributes in expect only when precision matters
- Each case should be independent — don't rely on state from previous cases
- Add seed data requirements to knowledge.yaml if a test needs specific data

## Screenshots

Save a screenshot after every step for the HTML report:

```
.results/{run-id}/{feature}/{case-id}-step-{n}.png
```

Use `take_screenshot` with `filePath` set to the absolute path. Example:
```
filePath: /Users/malin/repo-gittan/web/tests/ai/.results/20260618T143200/teams/teams-001-step-1.png
```

## Results JSON

After running all cases, save a `run.json` in the run directory:

```json
{
  "timestamp": "2026-06-18 14:32",
  "model": "opus",
  "duration_seconds": 142,
  "features": [{
    "feature": "teams",
    "name": "Teams",
    "cases": [{
      "id": "teams-001",
      "name": "Case name",
      "result": "pass",
      "steps": [{
        "number": 1,
        "action": "What was done",
        "expect": "What was expected",
        "status": "pass",
        "note": "Optional observation",
        "screenshot": "teams/teams-001-step-1.png"
      }]
    }]
  }],
  "summary": {
    "total_features": 1, "total_cases": 1, "total_steps": 8,
    "passed_steps": 8, "failed_steps": 0,
    "passed_cases": 1, "failed_cases": 0
  }
}
```

Then generate the HTML report:
```bash
node tests/ai/report.mjs .results/{run-id}
```

## Output format

Also report results in the conversation as:

```
## Results: {feature name}

### {case-id}: {case name}
- [PASS] Step 1: {action summary}
- [FAIL] Step 3: {action summary} — {what went wrong}

### Summary: X/Y steps passed
```

## File structure

```
tests/ai/
  CLAUDE.md             — You are here
  knowledge.yaml        — App screens, auth flow, quirks, seed data
  features/
    teams.yaml          — Team CRUD
    settings.yaml       — Org settings
    auth.yaml           — Auth configuration (OIDC)
    steps.yaml          — Step registry (pipeline steps)
    policies.yaml       — Pipeline policies
    audit.yaml          — Audit log
  runner.sh             — Sequential headless runner (claude -p)
  run-all.sh            — Parallel runner with HTML report
  report.mjs            — HTML report generator
  .results/             — Saved results (gitignored)
```
