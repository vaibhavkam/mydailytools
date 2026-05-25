# Runbook

Operations playbook for MyDailyTool. Read [INFRA.md](INFRA.md) for the topology this assumes.

## When to use this doc

You suspect something is broken. Start here, not by guessing.

## Site is down — first 60 seconds

Run these in order. The first one that returns a normal response tells you where the problem is.

```bash
# 1. Domain resolves?
dig +short mydailytool.com
# Expected: 4 IPs in 13.x or 18.x range (CloudFront edges)
# If empty: Route 53 problem (rare) or domain-registration lapse

# 2. CloudFront responding?
curl -I https://mydailytool.com/
# Expected: HTTP/2 200, server: CloudFront
# If 502/503/504: CloudFront origin fetch failing (likely S3 issue)
# If timeout: CloudFront propagation issue or DNS not resolving for you

# 3. S3 bucket has the files?
aws s3 ls s3://mydailytool.com/ | head -5
# Expected: index.html, _next, tools, blog, ...
# If "Access Denied": check IAM credentials (see "Authentication" below)
# If empty: build artifact never uploaded — re-run deploy

# 4. CloudFront distribution healthy?
aws cloudfront get-distribution --id E2XXH01ZE4SICS --query "Distribution.Status" --output text
# Expected: Deployed
# If InProgress: a recent change is propagating (5–10 min)
# If Disabled: someone disabled it (check console)

# 5. Cert valid?
echo | openssl s_client -servername mydailytool.com -connect mydailytool.com:443 2>/dev/null | openssl x509 -noout -enddate
# Expected: notAfter > today + 30 days
# If expired/expiring soon: ACM auto-renew failed (check ACM TXT validation records)
```

## Common failure modes

### Tool URL returns 404

Symptom: `https://mydailytool.com/tools/foo/` shows your custom 404 page.

Cause possibilities, in order of likelihood:

1. **The tool doesn't exist.** Check `lib/tools.ts` — is `foo` in the registry?
2. **Build skipped that route.** Run `npm run build` locally; check `out/tools/foo/index.html` exists.
3. **CloudFront Function broken.** The `mydailytool-rewrite` function rewrites `/foo/` → `/foo/index.html`. If detached or buggy, S3 returns 403, CloudFront converts to 404.

Verify the function:

```bash
aws cloudfront get-distribution-config --id E2XXH01ZE4SICS \
  --query "DistributionConfig.DefaultCacheBehavior.FunctionAssociations" --output json
```

Should list `arn:aws:cloudfront::314138869784:function/mydailytool-rewrite`. If `Quantity: 0`, re-attach (see [INFRA.md](INFRA.md) deploy section).

### Currency converter shows wrong / stale rates

Two possible scenarios:

**(a) Build-time rates are old.** The daily 02:30 UTC cron may have failed. Check:

```bash
unset GITHUB_TOKEN
gh run list --workflow=deploy.yml --limit 5
```

Look for the most recent scheduled run. If it failed, click into it for the error. To force a fresh deploy:

```bash
gh workflow run deploy.yml
```

**(b) User clicked "Refresh" and Frankfurter is down.** Clientside fetch from `api.frankfurter.dev` failed. The page falls back to build-time rates with a warning banner. Frankfurter outages are usually <1 hour; nothing to do on our side.

### Contact form submission fails

Symptom: form shows "Invalid form_id/access_key" or similar error.

Cause: `NEXT_PUBLIC_WEB3FORMS_KEY` GitHub secret is missing or wrong.

```bash
unset GITHUB_TOKEN
gh secret list | grep WEB3FORMS
# Expected: NEXT_PUBLIC_WEB3FORMS_KEY  <recent timestamp>

# To rotate:
gh secret set NEXT_PUBLIC_WEB3FORMS_KEY --body "PASTE-UUID-FROM-WEB3FORMS-DASHBOARD"
gh workflow run deploy.yml
```

### GA4 not recording visits

Open `https://mydailytool.com` in a browser → view source → search for `G-4MB75MYFSR`.

- **Found in `<script>` tags**: GA4 is wired. Check GA4 dashboard's **Reports → Realtime** with an active browser session. If Realtime is empty, the GA4 property might be filtered (Internal traffic, Developer traffic) or the data stream is paused.
- **Not found**: the secret didn't make it into the build. Verify with `gh secret list | grep GA4` and trigger a redeploy.

### CloudFront still shows old content after deploy

Invalidations cover `/`, `*.html`, `sitemap.xml`, `robots.txt`. JavaScript and CSS use content-hashed filenames so they're never stale-cached.

If a specific page still shows old HTML after a deploy:

```bash
# Force-invalidate that path
aws cloudfront create-invalidation --distribution-id E2XXH01ZE4SICS --paths "/tools/specific-tool/*"
```

If your **local browser** still shows the old version, it's the browser cache. Cmd-Shift-R bypasses it.

### Email not arriving

Test mail to `hello@mydailytool.com` doesn't show in `mydailytool.kamble@gmail.com`.

```bash
# Verify MX still points at ImprovMX
dig +short MX mydailytool.com
# Expected:
#   10 mx1.improvmx.com.
#   20 mx2.improvmx.com.

# Verify SPF still includes ImprovMX
dig +short TXT mydailytool.com
# Expected to include: "v=spf1 include:spf.improvmx.com ~all"
```

If MX or SPF is missing, re-apply via Route 53 (see [INFRA.md](INFRA.md)).

If DNS is correct but mail still bounces, log in at https://improvmx.com and check the dashboard for delivery errors. Free tier has a daily message limit (200/day) which can rate-limit you.

### GitHub Actions build fails

```bash
unset GITHUB_TOKEN
gh run list --workflow=deploy.yml --limit 3
gh run view <RUN_ID> --log-failed
```

Common causes (in order of frequency):

1. **`npm error: Exit handler never called`** — usually means `package-lock.json` got contaminated with private-registry URLs. Fix: ensure `~/.npmrc` doesn't override; project-level `.npmrc` should pin `registry=https://registry.npmjs.org/`. Regenerate the lockfile (`rm package-lock.json && npm install`).
2. **OIDC `AccessDenied`** — IAM trust policy mismatch. Most often the role's `sub` condition doesn't match the branch the workflow ran on. Check the role's trust policy; should include `repo:vaibhavkam/mydailytools:ref:refs/heads/main`.
3. **`prebuild` fails (Frankfurter)** — Frankfurter outage. Build still succeeds because `fetch-rates.mjs` falls back to existing `lib/rates.json`. If the file got corrupted, regenerate locally and commit.
4. **`aws s3 sync` fails** — usually IAM permissions changed. The role's inline policy needs `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the bucket.

### Domain expired

Check Route 53 Domains console. Set up auto-renew at first opportunity. Grace periods exist (~30 days for `.com`) but waiting is bad.

## Authentication

You'll often hit this:

```
zsh: command not found: aws
```

Then check `which aws`. If missing: `brew install awscli`.

```
You are not authorized to perform: ...
```

Run `aws sts get-caller-identity`. Should show:
```
"Arn": "arn:aws:iam::314138869784:user/mydailytool-deployer"
```

If wrong account: `aws configure` with the right access key.

```
gh: GITHUB_TOKEN environment variable is being used
```

Run `unset GITHUB_TOKEN` once per terminal session to use your interactive `gh auth login` credentials instead. The persistent fix: add `unset GITHUB_TOKEN` to a per-project shell hook, or alias `gh` to `env -u GITHUB_TOKEN gh`.

## How to deploy without GitHub Actions

If GitHub Actions is broken and you need to ship now:

```bash
cd /Users/vkamble/dev/mydailytools
nvm use 20
npm ci
npm run build

aws s3 sync out/ s3://mydailytool.com/ \
  --delete --exclude "_next/static/*" \
  --cache-control "public, max-age=0, must-revalidate"

aws s3 sync out/_next/static/ s3://mydailytool.com/_next/static/ \
  --cache-control "public, max-age=31536000, immutable"

aws cloudfront create-invalidation --distribution-id E2XXH01ZE4SICS \
  --paths "/" "/index.html" "/*.html" "/sitemap.xml" "/robots.txt"
```

Same end state as a green CI run. Use this only when CI is broken.

## How to roll back a bad deploy

S3 + CloudFront don't have a built-in "rollback" button. You roll back via git:

```bash
git revert HEAD --no-edit && git push     # auto-deploys the revert
```

If you need to be faster than the ~2-min auto-deploy, do a manual deploy of the previous commit:

```bash
git checkout HEAD~1
npm run build
# (paste the manual deploy commands from above)
git checkout main
```

If the badness is in S3 alone (e.g., a deploy uploaded broken HTML), redeploy from the most recent good commit. The build is deterministic given the same `lib/rates.json`; rates are baked in.

## Verifying after a deploy

Two-minute smoke test in browser:

1. `https://mydailytool.com/` — home loads, header has search/locale/theme/support buttons
2. `https://mydailytool.com/tools/json-formatter/` — tool page loads (verifies CloudFront Function rewrite)
3. `https://mydailytool.com/tools/mortgage-calculator/` — toggle locale to 🇮🇳 IN; labels switch to ₹ (verifies locale infra)
4. Cmd-K — opens command palette, search "json", first result is JSON Formatter
5. `https://mydailytool.com/sitemap.xml` — XML loads with ~190 URLs

All five should pass after every deploy. If one fails, check that step's failure mode in the sections above.

## Useful URLs

| Purpose | URL |
| --- | --- |
| Live site | https://mydailytool.com |
| GitHub repo | https://github.com/vaibhavkam/mydailytools |
| GitHub Actions | https://github.com/vaibhavkam/mydailytools/actions |
| Search Console | https://search.google.com/search-console |
| GA4 | https://analytics.google.com |
| AWS console (account 314138869784) | https://console.aws.amazon.com |
| ImprovMX dashboard | https://improvmx.com |
| Web3Forms dashboard | https://web3forms.com |
| Frankfurter (currency API) | https://frankfurter.dev |
| CloudFront direct | https://d3l6mdjszodgcz.cloudfront.net |

## Escalation

If you've worked through this doc and the site is still broken, the order to check:

1. **AWS Health Dashboard** (https://health.aws.amazon.com) — is `us-east-1` having issues?
2. **CloudFront status** — Twitter/X often beats the official status page
3. **Frankfurter status** (frankfurter.dev) — if rates are the problem
4. **ImprovMX status page** — if email is the problem

For account-level lockouts (lost access keys, MFA reset, billing issues), AWS Support is the only path. Pricing tier "Basic" includes only billing support; for technical support you'd need to upgrade to Developer ($29/mo) or higher for the duration of the incident.
