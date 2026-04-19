---
name: seo-audit
description: Run SEO audit on current project or all projects. Checks robots.txt, sitemap, hreflang, meta descriptions, OG tags, canonical URLs, structured data, and more. Runs code analysis and live URL verification. Use when user says "SEO audit", "check SEO", "seo-audit", or wants to find/fix SEO issues.
---

# SEO Audit Skill

## Overview

This skill performs a comprehensive SEO audit in two phases:

1. **Code Analysis (C01–C20):** Static checks on the codebase using Glob, Grep, and Read. No network required.
2. **Live URL Checks (L01–L08):** Runtime verification using WebFetch and curl against the deployed domain.

**Two operating modes:**

- **Single-project mode:** Run when the current working directory is a Next.js project (contains `package.json` with `next` dependency, or has `src/app/` or `app/` directory). Audits that project only.
- **Cross-project mode:** Run when the user says "audit all", "check all projects", or when the cwd is the `claude-cowork` parent directory. Audits every project listed in `seo-config.json` and produces a summary table.

---

## Setup

### Step 1: Load seo-config.json

Check for the config file in this order:
1. `{cwd}/seo-config.json`
2. `{cwd}/../seo-config.json`
3. `/Users/avwedemeyer/Library/Mobile Documents/com~apple~CloudDocs/claude cowork/seo-config.json`

Read the first one found with Read. If none found, tell the user and stop.

The config is a JSON object where keys are project directory names and values are project configs. Example shape:
```json
{
  "gastro-critic": {
    "domain": "gastro-critic.com",
    "www": false,
    "defaultLocale": "de",
    "locales": ["de", "en", "es"],
    "localePrefix": "always"
  }
}
```

### Step 2: Determine Mode

- **Single-project:** Detect project name from the current directory name (`basename $PWD`). Look up that key in seo-config.json. If not found, ask the user which project config to use.
- **Cross-project:** If the user requested "all" or cwd is the parent, iterate over every key in seo-config.json and run all checks for each project. Collect results for the summary table.

### Step 3: Resolve Project Root

For single-project mode, the project root is the cwd.
For cross-project mode, resolve each project root as `{parent_dir}/{project_key}`. Verify it exists before running checks.

---

## Code Analysis Checks

Run all 20 checks for each project. Record each result as PASS, FAIL, or WARN with a short message.

---

### C01 — robots file exists

Use Glob to search for:
- `{root}/src/app/robots.ts`
- `{root}/src/app/robots.tsx`
- `{root}/app/robots.ts`
- `{root}/app/robots.tsx`
- `{root}/public/robots.txt`

**PASS** if any of these exist.
**FAIL** if none exist. Suggest: "Create `src/app/robots.ts` using the Next.js Metadata API."

---

### C02 — sitemap file exists

Use Glob to search for:
- `{root}/src/app/sitemap.ts`
- `{root}/src/app/sitemap.tsx`
- `{root}/app/sitemap.ts`
- `{root}/app/sitemap.tsx`

**PASS** if any exist.
**FAIL** if none exist. Suggest: "Create `src/app/sitemap.ts` that exports a `sitemap()` function returning all public URLs."

---

### C03 — sitemap completeness

Use Glob to count `page.tsx` and `page.ts` files under `{root}/src/app/[locale]/` or `{root}/app/[locale]/`, excluding `(auth)`, `admin`, `api`, and `_` prefixed directories.

Read the sitemap file. Count the number of URL entries it returns (look for `url:` or `loc:` occurrences, or count array entries in the `return` statement).

**PASS** if sitemap entry count >= page count (after dividing by number of locales).
**WARN** if sitemap has fewer entries than expected. Note: "Possible missing pages in sitemap — verify manually."
**FAIL** if sitemap has 0 entries or returns an empty array.

---

### C04 — metadataBase exists

Use Grep with pattern `metadataBase` across `{root}/src/app/[locale]/layout.tsx`, `{root}/src/app/layout.tsx`, `{root}/app/[locale]/layout.tsx`, `{root}/app/layout.tsx`.

**PASS** if found in any layout file.
**FAIL** if not found. Suggest: "Add `metadataBase: new URL('https://{domain}')` to the root layout metadata export."

---

### C05 — metadataBase domain matches config

If C04 passed, Read the layout file containing `metadataBase`. Extract the URL string from the `new URL(...)` call.

**PASS** if the extracted URL matches the domain in seo-config.json (accounting for www preference).
**FAIL** if domain differs. Suggest: "Update metadataBase to `https://{config.domain}` to match seo-config.json."
**WARN** if URL contains a placeholder like `process.env.NEXT_PUBLIC_SITE_URL` — note that the env var must be set correctly in Vercel.

---

### C06 — html lang dynamic not hardcoded

Read `{root}/src/app/[locale]/layout.tsx` or `{root}/app/[locale]/layout.tsx`.

Look for `<html lang=`. Check whether the value is dynamic (e.g., `lang={locale}`, `lang={params.locale}`) or hardcoded (e.g., `lang="de"`, `lang="en"`).

**PASS** if dynamic.
**FAIL** if hardcoded. Suggest: "Use `<html lang={locale}>` where `locale` comes from the layout params."

---

### C07 — hreflang alternates on all pages

Use Grep with pattern `alternates` across all `page.tsx` files under `{root}/src/app/[locale]/` or `{root}/app/[locale]/`.

Count files that contain `alternates` vs total page files.

**PASS** if all page files (except catch-all `[...slug]` and layouts) contain `alternates`.
**WARN** if some pages lack `alternates`. List the missing files.
**FAIL** if no pages contain `alternates`.

---

### C08 — hreflang prefix consistency with localePrefix config

Read the config `localePrefix` value. Then use Grep with pattern `alternates` + context lines across page files to sample the hreflang URLs.

- If `localePrefix: "always"` — all hreflang hrefs must include the locale prefix (e.g., `/de/`, `/en/`). Default locale must also include the prefix.
- If `localePrefix: "as-needed"` — the default locale hreflang href must NOT include the prefix (e.g., `/` not `/de/`). Other locales include their prefix.

**PASS** if URLs match the prefix strategy.
**FAIL** if default locale URL includes prefix when `as-needed` (or vice versa). Suggest the correct URL pattern.
**WARN** if unable to determine prefix from grep results — flag for manual check.

---

### C09 — canonical URLs are absolute

Use Grep with pattern `canonical` across layout and page files.

Extract canonical URL strings. Check if they start with `https://` or `http://` (or are dynamically constructed from an absolute base).

**PASS** if all canonical refs are absolute.
**FAIL** if any canonical URL is relative (starts with `/`). Suggest: "Canonical URLs must be absolute. Use `${baseUrl}/${locale}/path` or metadataBase."

---

### C10 — canonical domain matches config domain

If C09 passed, extract the domain from canonical URL strings found via Grep.

**PASS** if domain matches seo-config.json domain.
**FAIL** if domain differs (e.g., points to staging or old domain). Suggest: "Update canonical to use `{config.domain}`."

---

### C11 — OG tags complete

Use Grep with pattern `openGraph` across layout and page files.

For each file containing openGraph, check for presence of: `title`, `description`, `type`, `url`.

**PASS** if all four are present in the root layout (they cascade to pages).
**WARN** if some are missing from layout but present in individual pages.
**FAIL** if `openGraph` block is absent from layout and most pages. Suggest: "Add a complete openGraph block to the root layout."

---

### C12 — OG image present

Use Grep with pattern `openGraph.*image|images.*openGraph|opengraph-image` across layout files and check for `opengraph-image.png` or `opengraph-image.jpg` using Glob in `{root}/src/app/` or `{root}/app/`.

**PASS** if OG image is defined (either as a file or in metadata).
**WARN** if OG image is referenced but file path cannot be confirmed.
**FAIL** if no OG image found. Note: "OG image requires a static asset — cannot be auto-fixed. Add `opengraph-image.png` to `src/app/` or define it in layout metadata."

---

### C13 — Twitter tags present

Use Grep with pattern `twitter` across layout files.

Check for `card`, `title`, `description`.

**PASS** if `twitter` metadata block with at least `card` is present in layout.
**WARN** if present but missing `title` or `description`.
**FAIL** if absent. Suggest: "Add `twitter: { card: 'summary_large_image', title: '...', description: '...' }` to layout metadata."

---

### C14 — meta description length 120–160 chars

Use Grep with pattern `description:` across layout and page files. Extract string values (skip dynamic variables).

For each extracted description string, measure character count.

**PASS** if all measurable descriptions are 120–160 chars.
**WARN** if 100–119 or 161–180 chars.
**FAIL** if <100 or >180 chars. Report file and line number. Suggest the correct length range.

---

### C15 — title length 30–60 chars

Use Grep with pattern `title:` across layout and page files. Extract static string values (skip templates with `%s`).

**PASS** if all measurable titles are 30–60 chars.
**WARN** if 25–29 or 61–70 chars.
**FAIL** if <25 or >70 chars. Report file and line. Suggest trimming or expanding.

---

### C16 — title doubling (brand name in both page title and template)

Use Grep with pattern `template:` and `default:` in layout title configs. Read the layout file to see the title template (e.g., `"%s | Brand Name"`).

Then grep page files for `title:` and check if any page title already contains the brand name.

**PASS** if no page title repeats the brand name that's already in the template.
**FAIL** if a page title like `"About — Brand Name"` is used with a template `"%s | Brand Name"`, producing `"About — Brand Name | Brand Name"`. Suggest removing the brand suffix from the page title string.

---

### C17 — structured data required fields

Use Grep with pattern `application/ld\+json` or `JsonLd` or `structuredData` across page and layout files.

For each structured data block found, Read the file and extract the JSON-LD. Check:
- `@context` is present and equals `"https://schema.org"`
- `@type` is present
- Required fields for the type (e.g., `Restaurant` needs `name`, `address`; `Article` needs `headline`, `author`, `datePublished`)

**PASS** if all found structured data blocks have required fields.
**WARN** if structured data exists but is incomplete. List missing fields.
**FAIL** if no structured data found and the site is a business/article site. Note: "Structured data cannot be auto-generated without content context — provide manually."

---

### C18 — no localhost:3000 in SEO files

Use Grep with pattern `localhost` across: layout files, sitemap files, robots files, and any file matching `*metadata*` or `*seo*`.

**PASS** if no matches.
**FAIL** if found. Report file and line. Suggest replacing with the production domain from seo-config.json.

---

### C19 — www/non-www consistency across all domain refs

Get `config.www` from seo-config.json (boolean: true = prefer www, false = prefer non-www).

Use Grep with pattern `https?://` across layout, sitemap, robots, and page files. Extract all domain references.

**PASS** if all domain refs consistently use www or non-www matching the config.
**FAIL** if mixed usage found. Report the inconsistent files and lines. Suggest normalizing to the canonical form.

---

### C20 — x-default doesn't duplicate a locale entry

Use Grep with pattern `x-default` across page files and layout files.

Read files containing `x-default` and check the hreflang array:
- `x-default` should point to the root URL (`https://{domain}/`) or the default-locale URL
- It must NOT be identical to one of the locale-specific hreflang entries
- It should not include a locale prefix

**PASS** if x-default is unique and points to the correct root/default URL.
**WARN** if x-default is missing from pages that have other alternates.
**FAIL** if x-default duplicates an existing locale entry or has a locale prefix. Suggest the correct x-default URL.

---

## Live URL Checks

Run these after code analysis. Each check fetches the live domain from seo-config.json. Use `https://{domain}` (or `https://www.{domain}` if `config.www` is true) as the base.

### L01 — robots.txt reachable

Fetch `{baseUrl}/robots.txt` using WebFetch.

**PASS** if response is 200 and body contains `User-agent`.
**FAIL** if 404 or error. Suggest checking the robots.ts file and Vercel deployment.
**WARN** if response is 200 but body is empty or malformed.

---

### L02 — sitemap.xml reachable

Fetch `{baseUrl}/sitemap.xml` using WebFetch.

**PASS** if response is 200 and body contains `<urlset` or `<sitemapindex`.
**FAIL** if 404 or error. Suggest checking sitemap.ts and verifying Vercel build logs.
**WARN** if content-type is not `application/xml` or `text/xml`.

---

### L03 — homepage status

Run: `curl -sI -L "{baseUrl}" | head -20`

**PASS** if final HTTP status is 200.
**WARN** if redirect chain is longer than 2 hops.
**FAIL** if 4xx or 5xx. Report the status code.

---

### L04 — www redirect consistency

Run both:
- `curl -sI "https://www.{domain}" | head -5`
- `curl -sI "https://{domain}" | head -5`

**PASS** if:
- `config.www = true`: non-www redirects 301 to www
- `config.www = false`: www redirects 301 to non-www

**FAIL** if redirect is missing or goes the wrong direction. Note: "www redirect is configured in Vercel project settings — cannot be auto-fixed via code."
**WARN** if redirect is 302 instead of 301.

---

### L05 — locale redirect for as-needed localePrefix

Only run this check if `config.localePrefix === "as-needed"`.

Run: `curl -sI "{baseUrl}/{config.defaultLocale}/" | head -5`

**PASS** if response is 301 redirecting to `{baseUrl}/` (without locale prefix).
**FAIL** if 200 is returned at the locale-prefixed URL for the default locale (duplicate content risk). Note: "Configure next-intl with `localePrefix: 'as-needed'` and verify middleware."

---

### L06 — hreflang on live page correct

Fetch `{baseUrl}/` (or `{baseUrl}/{locale}/` for always-prefix) using WebFetch.

Extract all `<link rel="alternate" hreflang="..." href="...">` tags from the HTML.

**PASS** if:
- One entry per locale in config
- One x-default entry
- All hrefs are absolute and use the correct domain
- Locale codes match config locales

**FAIL** if entries are missing, malformed, or point to wrong domain.
**WARN** if x-default is missing.

---

### L07 — OG tags on live page

Fetch `{baseUrl}/` using WebFetch.

Extract: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`.

**PASS** if all five are present and non-empty.
**WARN** if og:image is missing (common and impactful).
**FAIL** if og:title or og:description is missing.

---

### L08 — canonical on live page

Fetch `{baseUrl}/` using WebFetch.

Extract `<link rel="canonical" href="...">`.

**PASS** if present, absolute, uses correct domain, and matches the current page URL.
**FAIL** if missing or points to wrong domain.
**WARN** if canonical points to a redirect target rather than the final URL.

---

## Output Format

After running all checks, display results in this exact format:

```
=== SEO Audit: {project} ===
Domain: {domain} | Locales: {locales joined with "/"} | Prefix: {localePrefix}

CODE ANALYSIS
  PASS  C01  robots.ts exists
  PASS  C02  sitemap.ts exists
  WARN  C03  Sitemap may be missing pages (found 8 entries, expected ~12)
  PASS  C04  metadataBase in root layout
  PASS  C05  metadataBase domain matches config
  PASS  C06  html lang is dynamic
  WARN  C07  3 pages missing hreflang alternates: blog/page.tsx, faq/page.tsx, contact/page.tsx
  PASS  C08  hreflang prefix consistent with localePrefix "always"
  PASS  C09  canonical URLs are absolute
  PASS  C10  canonical domain matches config
  PASS  C11  openGraph block complete in root layout
  WARN  C12  No OG image found (opengraph-image.png missing)
  PASS  C13  Twitter card present
  FAIL  C14  meta description too long: privacy/page.tsx line 22 (181 chars)
  PASS  C15  All titles within 30-60 chars
  FAIL  C16  Title doubling in about/page.tsx: "About Us — Brand" with template ""%s | Brand""
  PASS  C17  Structured data present with required fields
  PASS  C18  No localhost references
  PASS  C19  www/non-www consistent (non-www)
  PASS  C20  x-default correct

LIVE VERIFICATION
  PASS  L01  /robots.txt → 200, valid
  PASS  L02  /sitemap.xml → 200, valid XML
  PASS  L03  Homepage → 200 (1 redirect)
  PASS  L04  www → non-www 301 redirect
  SKIP  L05  (localePrefix is "always", not applicable)
  PASS  L06  Hreflang on live page: 3 locales + x-default
  WARN  L07  og:image missing on live homepage
  PASS  L08  Canonical correct on live page

Score: 22/28 passed | 2 failed | 4 warnings

Suggested fixes:
  1. [C14] Shorten meta description in privacy page (181 → max 160 chars)
     File: src/app/[locale]/privacy/page.tsx:22
  2. [C16] Remove brand name from page title in about/page.tsx (template already appends it)
     File: src/app/[locale]/about/page.tsx:8
```

After displaying the report, ask:

```
Apply fixes? [y/n]
```

If the user says yes, proceed with the Fix Strategy below.

---

## Cross-Project Summary

When running in cross-project mode, run all checks for each project, then display:

```
=== SEO Audit: All Projects ===

Project              Score    Failed  Warnings  Domain
─────────────────────────────────────────────────────────
gastro-critic        24/28    2       2         gastro-critic.com
project-two          21/28    4       3         example.com
project-three        28/28    0       0         another.com
─────────────────────────────────────────────────────────
Total                73/84    6       5

Fix all? [y/n/per-project]
```

- **y:** Apply all auto-fixable issues across all projects.
- **n:** Exit without changes.
- **per-project:** Show each project's fix prompt in sequence.

---

## Fix Strategy

### Auto-fixable checks

Apply fixes automatically with Edit tool for:

- **C01** — Create `src/app/robots.ts` with standard disallow-nothing + sitemap pointer template.
- **C02** — Create `src/app/sitemap.ts` with placeholder returning at least the homepage URL per locale.
- **C04** — Add `metadataBase: new URL('https://{domain}')` to the root layout metadata export.
- **C06** — Replace hardcoded `lang="xx"` with `lang={locale}` in the root layout `<html>` tag.
- **C08** — Fix hreflang href prefix in page alternates to match `localePrefix` config.
- **C09** — Replace relative canonical strings with absolute versions using the config domain.
- **C10** — Update canonical domain to match seo-config.json.
- **C14** — If description is too long and static, trim to 155 chars and append `…`. If too short, flag for manual expansion.
- **C16** — Remove the brand name suffix from the page title string where the template already adds it.
- **C18** — Replace `localhost:3000` (or any `localhost:*`) with the production domain from config.
- **C19** — Normalize all domain refs to www or non-www per config.
- **C20** — Fix x-default href to point to `https://{domain}/` without locale prefix.

### Manual guidance required

- **C12** (OG image): "Add `opengraph-image.png` (1200×630px) to `src/app/` directory. This cannot be auto-generated without a visual asset."
- **C17** (structured data): "Review the JSON-LD and add missing fields manually. Required fields depend on the schema type."

### Infrastructure only (code cannot fix)

- **L04** (www redirect): "Configure canonical domain redirect in Vercel project settings under Domains."
- **L05** (locale redirect): "Verify next-intl middleware config uses `localePrefix: 'as-needed'` and middleware is deployed."

### After applying fixes

1. Run `npm run build` in the project root using Bash. Check for errors.
2. Show a git diff summary of changed files.
3. Ask: "Commit fixes? [y/n]"
4. If yes, stage only the changed SEO files and create a commit with message: `fix: seo audit corrections (auto-fix)`
