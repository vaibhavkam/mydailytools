# Deploying MyDailyTools to AWS S3 + CloudFront

This site builds to a static `out/` folder. The cheapest production-grade host for that on AWS is **S3 (origin) + CloudFront (CDN) + Route 53 (DNS) + ACM (HTTPS)**. Estimated cost for a small site: **$1–5/month**.

---

## 1. Build locally

```bash
npm install
cp .env.example .env.local       # add AdSense / GA4 / Web3Forms keys (all optional)
npm run build                     # produces /out + /out/sitemap.xml
```

Deploy artifacts: `out/` directory + `out/sitemap.xml`.

---

## 2. One-time AWS setup (CLI)

Replace `mydailytool.com` and `us-east-1` with your domain and region. **Note:** ACM cert for CloudFront *must* be in `us-east-1` regardless of your bucket region.

```bash
# 2a. Create the S3 bucket (private — CloudFront will read via OAC, no public access).
aws s3api create-bucket \
  --bucket mydailytool.com \
  --region us-east-1

aws s3api put-public-access-block \
  --bucket mydailytool.com \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 2b. Request an ACM certificate in us-east-1.
aws acm request-certificate \
  --domain-name mydailytool.com \
  --subject-alternative-names www.mydailytool.com \
  --validation-method DNS \
  --region us-east-1

# Add the returned CNAME validation records to Route 53, then wait for ISSUED.
```

For the CloudFront distribution, the JSON config is verbose — use the Terraform template in `infra/main.tf` (see below) or click through the AWS console once. Key settings:

- **Origin**: your S3 bucket, accessed via **Origin Access Control (OAC)** — not legacy OAI.
- **Default root object**: `index.html`.
- **Custom error pages**: `403` and `404` → `/404.html` with HTTP 404.
- **Compression**: ON (Brotli + gzip).
- **HTTP versions**: HTTP/2 + HTTP/3.
- **Viewer protocol**: Redirect HTTP to HTTPS.
- **Cache policy**: Use `CachingOptimized` for `/_next/static/*` and create a separate **no-cache** policy for `*.html` and `sitemap.xml`.

After the distribution is created, attach the bucket policy that AWS suggests (it ties the bucket read permission to the specific CloudFront distribution ARN).

---

## 3. First deploy

```bash
# Sync HTML with no-cache (so updates go live instantly).
aws s3 sync out/ s3://mydailytool.com/ \
  --delete \
  --exclude "_next/static/*" \
  --cache-control "public, max-age=0, must-revalidate"

# Sync hashed assets with year-long cache (filenames change on each build).
aws s3 sync out/_next/static/ s3://mydailytool.com/_next/static/ \
  --cache-control "public, max-age=31536000, immutable"

# Invalidate HTML / sitemap so visitors see new content immediately.
aws cloudfront create-invalidation \
  --distribution-id E1ABCDEFGHIJ23 \
  --paths "/" "/index.html" "/*.html" "/sitemap.xml" "/robots.txt"
```

---

## 4. DNS

```bash
# Create the apex A-record alias to CloudFront in Route 53.
aws route53 change-resource-record-sets \
  --hosted-zone-id Z0123456789ABCDEFG \
  --change-batch file://route53-alias.json
```

`route53-alias.json`:

```json
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "mydailytool.com.",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "dXXXXXXXX.cloudfront.net.",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

`Z2FDTNDATAQYW2` is the CloudFront-fixed zone ID — same for every distribution.

---

## 5. Cost estimate (very small site, ~10k pageviews/mo)

| Service | Usage | Monthly |
| --- | --- | --- |
| S3 storage | ~30 MB | < $0.01 |
| S3 requests | 10k GETs | < $0.01 |
| CloudFront egress | ~3 GB | $0.25 |
| CloudFront requests | 100k | $0.10 |
| Route 53 hosted zone | 1 zone | $0.50 |
| ACM cert | — | Free |
| **Total** | | **~$1/mo** |

Scales roughly linearly: 1M pageviews ≈ $25–40/mo on this stack.

---

## 6. Terraform (optional, recommended)

See `infra/main.tf` — one `terraform apply` provisions bucket, OAC, CloudFront, ACM, and Route 53 records.

---

## 7. CI/CD with GitHub Actions

See `.github/workflows/deploy.yml` — pushes to `main` build and deploy automatically. Set these repo secrets:

- `AWS_ROLE_ARN` — IAM role with S3 + CloudFront write permissions (use OIDC, not long-lived keys).
- `S3_BUCKET` — `mydailytool.com`
- `CF_DISTRIBUTION_ID` — CloudFront distribution ID
- `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_WEB3FORMS_KEY` — public env vars baked into the build.

---

## 8. Post-deploy checklist

- [ ] `https://mydailytool.com` resolves and serves over HTTPS.
- [ ] `www.mydailytool.com` redirects to apex (or vice versa — pick one).
- [ ] `/sitemap.xml` and `/robots.txt` return 200.
- [ ] Open the homepage in Lighthouse — target Performance ≥ 95, SEO 100.
- [ ] **Google Search Console**: add the property, verify by DNS TXT, submit `sitemap.xml`.
- [ ] **Bing Webmaster Tools**: same — add and submit sitemap.
- [ ] **Google Analytics 4**: create property, copy ID into `.env.local`, redeploy.
- [ ] **Google AdSense**: apply only after the site has a few weeks of organic traffic and the listed pages pass review (rejected sites need to wait 30+ days to retry, so don't apply too early).
- [ ] Add `og.png` (1200×630 social card) to `/public`.
- [ ] Convert `favicon.svg` to `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (referenced in `site.webmanifest`).

### Backlink strategy (10 ideas)

1. Submit to AlternativeTo and Slant under existing tool listings.
2. Answer Stack Overflow / Reddit questions where one of your tools is the obvious solution; link from your bio, not the answer.
3. Post each tool category to Product Hunt — one per quarter.
4. Cross-link from a personal blog / GitHub README.
5. Wikipedia external-links sections (only when a tool is genuinely the best free option for a topic).
6. Submit to free-tool roundups: GeeksforGeeks, freeCodeCamp news, hackernoon.
7. Open-source the `lib/tools.ts` registry on GitHub — repo backlinks are very high quality.
8. Create one comparison post on dev.to per month ("X tools vs Y tools").
9. Reach out to bloggers who already wrote "best free [category]" posts — offer a free tool review.
10. Embed copyable tool links in tutorial-site comments (only where genuinely useful).

### Content marketing plan for ranking

- **Months 1–2**: Ship the 5 working tools, then convert 2 stub tools per week to full implementations, prioritized by Google Trends search volume.
- **Months 3–4**: Add a `/blog` route. Write one 1500-word article per week tied to a tool ("How JSON formatting works under the hood", "Password entropy explained"). Internal-link from articles to tool pages.
- **Months 5+**: Track Search Console queries; for each tool ranking on page 2, expand the FAQ section to capture more long-tail terms.
