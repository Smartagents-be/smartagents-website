# smartagents.be: GEO audit, violations and opportunities

> **TIME-CRITICAL (GEO-001): opt out in Cloudflare before 2026-09-15.**
>
> From that date, Cloudflare blocks Googlebot, Bingbot and Applebot on every zone that blocks AI training in any form, including the legacy "Block AI bots" toggle.
>
> Open Security → Settings (`https://dash.cloudflare.com/?to=/:account/:zone/security/settings`) and opt out **before 2026-09-15**. Do this before anything else in this document.

- **Date:** 2026-09-13 (revision 3, after critic rounds 1 and 2)
- **Audited commit:** `cbd2582` (`main`, merge of PR #25, the redesign). Live production serves this build, with three differences:
  1. Cloudflare's email rewriting (GEO-010).
  2. Cloudflare's managed robots.txt block prepended to the site's file (GEO-004).
  3. Stale old-site responses on some edges for removed paths (GEO-002).
- **Scope:**
  - the public site (`/nl/`, `/en/`, `/fr/`, 45 HTML pages)
  - the files bots read (`robots.txt`, `sitemap.xml`, `llms.txt`, `_redirects`, `_headers`)
  - the Cloudflare zone and the `*.pages.dev` host, as seen from outside
  - the old Eleventy site's URLs
  - off-site entity signals

  `/secured/` is out of scope except where it touches crawling.
- **Evidence sources** (session scratchpad):
  1. `geo-research.md`: GEO practice, weighted by evidence tier, plus a scoring rubric.
  2. `geo-inventory.md`: codebase and `dist/` inventory, with file:line evidence.
  3. `geo-live.md`: live production audit (curl captures, web searches).
  4. `geo-critic-round1.md`: adversarial review of revision 1.
  5. `geo-critic-round2.md`: adversarial review of revision 2.

     Every verdict from both rounds is applied, except where an item notes the writer's refinement. The orchestrator's round-2 decisions take precedence: GEO-041a is gated; GEO-031 and GEO-019 are deferred; GEO-025 sits wholly in Track A; the GEO-007a titles are reworked.
  6. **Fresh checks**, quoted where used:
     - the old site read directly from `git show cbd2582^1`: permalinks, `.eleventy.js`, `robots.txt`, `llms.txt`, `_headers`, the Organization schema include, assets, and the deleted posts in `5fe67fb`
     - a git-derived 88-URL live sweep (`scratchpad/old-urls-git-status.txt`)
     - re-curls of the stale edges and the `pages.dev` host
     - first-party docs re-fetched: Cloudflare's block-ai-bots, Pages headers and Pages redirects docs; Google's site-names, site-move, redirects, canonical, sitemap, title-link and favicon docs; IndexNow; Bing's July 2025 sitemaps post; Eleventy's `fileSlug`
     - measured title lengths
- **Corrections to the evidence files:**
  - `geo-live.md` §7.2 tested date-prefixed blog URLs that never existed. Eleventy strips the date from `fileSlug`. The corrected sweep has 88 URLs, of which about 77-78 end in 404 depending on the edge.
  - `geo-live.md` §2 says nine bots have two groups; it is **eight**.
  - `geo-live.md` §1.1 says "no `x-robots-tag` on any response"; that holds for current pages only.
- **Not done:** no source file was edited, and nothing in the dashboard was touched. Nothing here measures Google, ChatGPT, Perplexity, Claude or Copilot directly (see §7).

## Keys

### Evidence strength

| Label | Meaning |
|---|---|
| **T1** | First-party: the platform's own docs or blog (Google Search Central, Bing/Microsoft, OpenAI, Anthropic, Perplexity, Cloudflare, IndexNow). Authoritative on what a platform does; weak on what moves citations. |
| **T1b** | A named platform employee speaking outside a doc, or a second-hand report of one. |
| **T2** | Research. Peer-reviewed ranks above preprint, and preprints are marked. Engines are often simulated. |
| **T3** | Industry study (Ahrefs, SparkToro, Vercel/MERJ and similar): large N, mostly correlational. |
| **T4** | Opinion (agency or vendor blogs). Never the sole basis for a rating above Low. |
| **Observed** | Measured in this audit (curl, `dist/`, git, source). Proves the fault exists, not what it costs. |
| **Judgement** | Reasoning with no external source. |

### Impact

The effect on being crawled, indexed, correctly understood and cited by AI answer engines, discounted by evidence strength.

- **Critical:** observed or scheduled blocking or loss of crawl, index or citation eligibility.
- **High:** a material effect backed by T1 or direct observation.
- **Medium:** a plausible, moderate effect; or a strong effect backed only by T2/T3; or a prerequisite for measuring anything.
- **Low:** a small or speculative effect.
- **Hygiene:** not a GEO item (social previews, stray files, brand follow-ups). Listed separately and not counted in the tiers.

### Size

- **XS:** under 30 minutes.
- **S:** under 2 hours.
- **M:** half a day to a day.
- **L:** multiple days.
- **XL:** ongoing, or needs outside parties.

### Owner

- `code`: can be done in this repo.
- `dashboard`: Cloudflare, Search Console or Bing Webmaster Tools; needs the account holder.
- `off-site`: profiles, registries, earned media.
- `client-input`: needs facts, copy or a decision only the client can supply.
- `ops`: recurring operational work outside the repo, such as measurement runs.

An item can have more than one owner.

---

## 1. Summary

Sorted by impact (descending), then size (ascending). IDs are stable; split items carry a letter suffix. **Status:**
- **now:** in this pass's code plan (§2(a)).
- **hand-off:** dashboard or off-site (§2(b)).
- **client:** blocked on a client answer (§2(c)).
- **deferred:** kept, not in this pass.

**Done:**
- **Yes:** implemented in the working tree and checked against a `dist/` built after the last source change (2026-09-13). Still uncommitted and not deployed, so the live acceptance checks (curl) are not run yet.
- **Partly:** the code is in, but part of the item waits on the client.
- **No:** not started. Every dashboard, off-site and client item reads No because nothing in the repo shows it is done; change it by hand once the account holder or the client confirms.
- **Folded:** handled as part of another item.

| ID | Title | Impact | Size | Owner | Evidence | Status | Done |
|---|---|---|---|---|---|---|---|
| GEO-001 | Opt out of Cloudflare's 2026-09-15 change that blocks Googlebot/Bingbot for training-blocking zones; record bot settings and crawler logs | **Critical** | XS | dashboard | T1 + Observed | hand-off | **No** (due before 2026-09-15) |
| GEO-003 | Old-site URLs (about 77 of 88) end in 404 with no 301s | High | S | code, client-input | T1 + Observed | now (+client for 20 URLs) | **Partly:** 128 rules and the target check are in; the M365 rules await client review, and 20 URLs stay 404 until the client answers |
| GEO-005 | Search Console and Bing Webmaster Tools: verify, submit the sitemap, confirm the AI control, request recrawl | High | S | dashboard | T1 | hand-off | No |
| GEO-007a | Descriptive `<title>`s built from facts the site already states | High | S | code (client reviews wording) | T1 | now; **merge blocked on client review** | **Partly:** titles are in; not to deploy before the client replies |
| GEO-008 | No proof on the site: no clients, cases or attributable outcomes | High | L | client-input, code | T1 guidance, T3 | client | No |
| GEO-009 | Almost no earned third-party mentions | High | XL | off-site, client-input | T2 (preprint) + T3 | hand-off, client | No |
| GEO-002 | Some edges still serve old-site pages with a 200 | Medium | XS | dashboard | Observed | hand-off | No |
| GEO-004 | Managed robots.txt contradicts the site's robots.txt for eight training bots | Medium | XS | dashboard, client-input | T1 + Observed | client, then hand-off | No |
| GEO-006 | Off-site identity inconsistent: KBO has no website, LinkedIn "Smartagents.be", Kortessem in the old graph and llms.txt; many namesakes | Medium | S | off-site, client-input | Observed + Judgement | hand-off, client | No |
| GEO-014b | Team page is thin; founders' track record not on it | Medium | S | client-input | T1 guidance | client | No |
| GEO-015 | Articles have no visible author and are attributed to the Organization | Medium | S | client-input, code | T1 guidance | client | No |
| GEO-017 | Third-party pages describe the old positioning | Medium | S | off-site | T2 (preprint) + T3 + Observed | hand-off | No |
| GEO-018 | No Google Business Profile or Bing Places listing | Medium | S | off-site, client-input | T1 | client, then hand-off | No |
| GEO-021 | No repeatable NL/EN/FR prompt panel | Medium | M | ops, client-input | T3 (method) | hand-off, client | No |
| GEO-022 | No Sortlist or Clutch profiles | Medium | M | off-site, client-input | T3 + Observed | hand-off, client | No |
| GEO-023 | Four articles, the newest from June; no cadence | Medium | XL | client-input | T1 guidance, T2/T3 | client | No |
| GEO-007b | Homepage H1 slogan decision | Low | XS | client-input | Judgement | client | No |
| GEO-010 | Cloudflare Email Obfuscation rewrites the visible address | Low | XS | dashboard | T1 + Observed | hand-off | No |
| GEO-011 | `http://www` takes 3 hops; the root 302 is an open decision | Low | XS | dashboard, client-input | T1/T1b + Observed | hand-off, client | No |
| GEO-013a | Organization: add `iso6523Code` and a KBO `sameAs` | Low | XS | code | T1 (purpose); T3 null | now | **Yes** |
| GEO-013b | Organization `foundingDate` / `availableLanguage` need visible copy first | Low | XS | client-input | T1 (purpose) | client | No |
| GEO-014a | Person nodes lack `jobTitle` (folded into GEO-014b: only alt text states the role) | Low | XS | client-input | Judgement | folded | Folded (GEO-014b) |
| GEO-024 | `Service.inLanguage` claims the page language as the delivery language | Low | XS | code | Judgement | now | **Yes** |
| GEO-025 | `/favicon.ico` 404s and the only declared icon is SVG | Low | XS | code | T1 | now (Track A) | **Yes** |
| GEO-026 | Course PDFs are indexable with no canonical header | Low | XS | code | T1 | now | **Yes** |
| GEO-030 | Unverified Claude Partner Network claim | Low | XS | client-input | Observed (unverified) | client | No |
| GEO-041a | Kata video has no `VideoObject`; Google requires `uploadDate` | Low | XS | code, client-input | T1 | client (gated) | No |
| GEO-042 | `smartagents-website.pages.dev` serves the whole site, indexable | Low | XS | code | T1 + Observed | now | **Yes** |
| GEO-043 | `WebSite` has no `alternateName` (Google site-name fallback) | Low | XS | code | T1 | now | **Yes** |
| GEO-031 | `/xx/404/` answers 200, and every language gets the Dutch 404 | Low | S | code | T1 + Observed | **deferred** | No |
| GEO-032 | "AI voor business teams" has no `Course` node | Low | S | code | Judgement; T3 null | now | **Yes** |
| GEO-033 | "Hello AI era" has no body subheadings; no article cites a source | Low | S | client-input | T1 (Microsoft); T2 mixed | client | No |
| GEO-034 | No in-body contextual links between services, articles and team | Low | S | client-input, code | Judgement | client | No |
| GEO-037 | No lead self-attribution | Low | S | client-input, code | Judgement | client | No |
| GEO-039 | No Wikidata item | Low | S | off-site | T4 only | hand-off (later) | No |
| GEO-040 | "SmartSpace" is named with no current page, and collides with smartspace.ai | Low | S | client-input | Observed | client | No |
| GEO-016 | No IndexNow on deploy | Low | M | code, dashboard | T1 | **deferred** | No |
| GEO-019 | Honest `lastmod` for 27 of 42 sitemap URLs, plus a `dateModified` path (merges GEO-028) | Low | M | code | T1 | **deferred** | No |
| GEO-020 | No answer-first definitional passages on service pages | Low | M | client-input | T1 (Microsoft); T2 null | client | No |
| GEO-041b | Kata video: no transcript or captions; not on YouTube | Low | M | client-input, off-site | T1 generic, T3 | client | No |

**Merged:**
- GEO-012 (AI Crawl Control logs) → GEO-001.
- GEO-028 (`dateModified`) → GEO-019.

**Rejected (§6):** GEO-027, GEO-035, GEO-038.

**Hygiene, not counted (§4):**
- GEO-029: leftover `CNAME`, in this pass. **Done: Yes.**
- GEO-036: share images and `max-image-preview`, deferred. **Done: No.**
- GEO-041c: the kata poster names a language. **Done: No.**

**Counts:** Critical 1 · High 5 · Medium 10 · Low 24 · merged 2 · rejected 3 · hygiene 3. Of the Low items, 3 are deferred from this pass: GEO-016, GEO-019, GEO-031.

---

## 2. Implementation plan for this pass

> **Before any deploy:** the GEO-007a titles are in the working tree now, uncommitted. They must not reach `main` (production) or any deploy until the client has reviewed the wording. Ship the rest of this pass without them, or from a preview branch.

### (a) Code to implement now, in two parallel tracks

The two tracks share no source file. The one exception is `CLAUDE.md`: each track edits **only the bullets that document its own change**, and the user approves those edits. Each track runs `npm run build`, which renders and then runs `check-dist` and `check-contact`, before handing over. Track A owns every change to `scripts/check-dist.mjs`.

**Track A: routing, headers, head link, build outputs**

Files: `public/_redirects`, `public/_headers`, `public/CNAME`, `src/layouts/base.mjs`, `scripts/check-dist.mjs`, `scripts/make-social-images.mjs`, new `public/favicon.ico` and `public/favicon-96.png`, `CLAUDE.md` (its own bullets only).

1. **GEO-003:**
   - ~~Paste both redirect blocks into `public/_redirects` above `/pitch /secured/presentations/pitch/ 301`: 63 rules with a trailing slash, plus 56 explicit slashless page rules, 119 in all.~~ As implemented: 128 rules; see GEO-003's status line.
   - ~~Add the redirect-target check to `check-dist.mjs` §5b, to the spec in the item. It skips splat and placeholder targets and non-301 rules, strips `#fragment`, and resolves both directory and file targets.~~ As implemented, the check is stricter than this spec; see GEO-003's status line.
2. **GEO-042 + GEO-026:** both documented `pages.dev` noindex lines and the two PDF canonical headers, in `public/_headers`.
3. **GEO-029 (hygiene):** delete `public/CNAME`.
4. **GEO-025, whole item:**
   - `make-social-images.mjs` writes `favicon.ico` and `favicon-96.png`; commit both.
   - Add both to the `required` list in `check-dist.mjs` (~545).
   - Add `<link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png">` to `base.mjs`.
5. **CLAUDE.md (Track A bullets):**
   - "The routing table is generated" (`CLAUDE.md:142`): the authored `_redirects` now carries the old-site 301 map, with the new target check.
   - "The two raster brand images are generated, not exported" (`CLAUDE.md:307`): the script now also writes the favicons.

**Track B: graph and strings**

Files: `src/i18n/nl.json`, `src/i18n/en.json`, `src/i18n/fr.json`, `src/layouts/schema.mjs`, `src/pages/training.mjs`, `CLAUDE.md` (its own bullet only).

1. **GEO-007a:** paste the new `<id>.title` values verbatim from the table in the item. **Implementation can start now; merge is blocked on client review of the wording.**
2. **GEO-043 + GEO-013a:** `WebSite.alternateName`, `Organization.iso6523Code` and the KBO `sameAs`, in `schema.mjs`.
3. **GEO-024:** drop `Service.inLanguage` in `schema.mjs`.
4. ~~**GEO-014a:** `Person.jobTitle` in `schema.mjs`, plus one new i18n key `team.person.role` per language.~~ Folded into GEO-014b during implementation: no visible text on the team page states the role.
5. **GEO-032:** optional `facts` in `courseNode()` (`schema.mjs`), and a second `Course` plus the `hasOfferCatalog` reference from `training.mjs`.
6. **CLAUDE.md (Track B bullet):** "Every page states itself twice" (`CLAUDE.md:291`). Record `WebSite.alternateName`, `iso6523Code` and the KBO `sameAs`, the business-teams `Course`, and why `Service` no longer carries `inLanguage`.

**Coupling:** none left between the tracks. GEO-025's head link moved into Track A with its files.

**Deferred from this pass (items kept):**
- **GEO-019** (both halves): a hash check that fails locally would break `npm run dev`'s save loop on every copy edit until someone re-stamps. Warn-only lets dates go stale, and Google uses lastmod only when it is "consistently and verifiably… accurate", so the 15 honest dates would be at risk too. Low impact on a 42-URL site. The design for later is in the item.
- **GEO-031:** as planned it fails `check-dist`.
  - The 404 pages link `/xx/404/` in their canonical, their hreflang and the language switcher (`check-dist.mjs:265`, "broken internal link").
  - `isNotFound` (`:84`) matches only `404/index.html`, so the robots assertion (`:443-446`) would demand `index, follow`.
  - It spans `base.mjs`, `not-found.mjs`, `render.mjs` and `check-dist.mjs`, across both tracks, for a Low item. The lines are listed in the item.
- **GEO-041a:** Google requires `uploadDate`, so it ships only if the owner approves 2026-08-02 (§2(c)).
- **GEO-016:** IndexNow needs a dashboard webhook, and its changed-URL source was GEO-019.
- **GEO-011 root 301:** pending the question in (c).
- **GEO-036 (hygiene):** touches `base.mjs` (Track A) and a Track A check for a non-GEO gain.

### (b) Hand-offs for the account holder

- [ ] **GEO-001, before 2026-09-15:**
  - Security → Settings: opt out of the mixed-purpose change.
  - Record the legacy "Block AI bots" state, the per-category and per-crawler actions, and Bot Fight Mode.
  - Screenshot the settings.
  - Record a crawler-log baseline (GSC Crawl Stats, BWT crawl data, AI Crawl Control if the plan has it).
- [ ] **GEO-005:**
  - GSC Domain property via DNS TXT; submit the sitemap; confirm the AI control is Include; request indexing for 11 URLs; export the 404 list.
  - BWT: import from GSC, submit the sitemap, submit URLs, record the AI Performance baseline.
- [ ] **GEO-002:** Caching → Purge Everything, once. Re-run the stale check on 2026-09-20; open a ticket if 200s persist.
- [ ] **GEO-004:** after the client picks a training policy, turn managed robots.txt off (Option A) or keep it (Option B, which means a code change in `render.mjs`).
- [ ] **GEO-010:** Security → Settings → Email Address Obfuscation: Off.
- [ ] **GEO-011:** a single Redirect Rule `http*://www.smartagents.be/*` → `https://smartagents.be/${1}`, 301.
- [ ] **GEO-006:** KBO web address via My Enterprise; LinkedIn company display name and About; founders' LinkedIn headlines.
- [ ] **GEO-017:** email ClickForest; ask made-in.be to update the person page.
- [ ] **GEO-018:** GBP and Bing Places, if the client confirms eligibility.
- [ ] **GEO-022:** Sortlist and Clutch profiles.
- [ ] **GEO-009:** start the earned-mention log; pursue the Aviso+ recap.
- [ ] **GEO-021 (ops):** run the baseline panel after GEO-003 and GEO-005 land.
- [ ] **GEO-039 (optional, later):** Wikidata, only after two independent references exist.

### (c) Blocked on client facts: questions to ask

| Item | Exact question |
|---|---|
| GEO-003 | "The old site had `/aanpak/` and four method pages (ontwerp, ontwikkeling, implementatie, optimalisatie-support). Is there a current page that does the same job, or should they stay gone?" |
| GEO-003 | "The old `/customerzone/` was 'Uw persoonlijke klantenzone'. Should it point to the password area at /secured/, or stay gone?" |
| GEO-003 | "Should the old videos `smartagents.mp4` and `smartspace-demo.mp4` stay gone?" |
| GEO-003 | "The old Microsoft 365 Copilot training page **and its one-pager PDF** will redirect to /training/. Is that acceptable, given the current courses don't name M365?" |
| GEO-004 | "May AI companies (OpenAI, Anthropic, Google-Extended, Common Crawl…) use smartagents.be to *train* models? (Being cited in AI search is unaffected either way.)" |
| GEO-006 | "The old site said 'Based in Beringen and Kortessem, Belgium', and its structured data listed a Kortessem address. Is Kortessem still a location? And may we rename the LinkedIn page from 'Smartagents.be' to 'SmartAgents'?" |
| GEO-007a | "Here are the proposed page titles, built only from wording already on the site. Any wording you'd change? (We won't publish them before you reply.) Two choices in particular: (1) the homepage title either keeps the brand (`Training, AI staffing, AI-native SDLC en processen · SmartAgents`) or names the country instead (`Training, AI staffing, AI-native SDLC en processen in België`); the country helps tell you apart from the other SmartAgents companies. (2) The staffing title leads with the engineer (`AI-engineer staffing, coaching voor developers en business teams`), like the page's hero, or with the coaching (`Coaching voor developers en business teams, AI-engineer staffing`), which cannot be misread as staffing for developers." |
| GEO-007b | "Should the homepage H1 stay 'Digitale collega's die nooit slapen'? The phrase is also used by Syntra AB and Smart Lions." |
| GEO-008 | "Which engagements or kata sessions may we name, with what outcome, and is there a person willing to be quoted?" |
| GEO-009 | "Which real events, partners, podcasts or press would name you (for example an Aviso+ recap of the breakfast session)?" |
| GEO-011 | "In search results, do you want the homepage shown as smartagents.be or smartagents.be/nl/?" |
| GEO-013b | "May the team page say SmartAgents was founded on 21 April 2026 (the KBO start date)? In which languages do you take calls and meetings?" |
| GEO-014b | "Please confirm each founder's track record for the team page (Axel: founder of JArchitects 2002, CEO of We+ after the 2022 merger; Tom: ?)." |
| GEO-015 | "Who wrote each of the four articles: Axel, Tom, both, or 'the company'?" |
| GEO-018 | "Do you receive clients at Mijnschoolstraat 18, Beringen, or is it only the registered seat?" |
| GEO-020 | "In one or two sentences each: what is an AI-native SDLC, agentic engineering, and a kata, as you would explain them to a buyer?" |
| GEO-021 | "Who will run the quarterly prompt panel, and which 15 buyer questions (5 per language) matter most?" |
| GEO-022 | "Which two or three clients would leave a Clutch review?" |
| GEO-023 | "What publishing cadence can you sustain, and which first-hand topics come first?" |
| GEO-030 | "Is SmartAgents a member of the Claude Partner Network? If so, what is the directory URL?" |
| GEO-033 | "For factual claims in the four articles, which sources back them? May we add subheadings to 'Hello world, hello AI era'?" |
| GEO-034 | "May we add in-text links (for example from the kata page to the SDLC page, from the launch article to the team page)? Any wording preference?" |
| GEO-037 | "Would you ask 'how did you find us?' in the intake call, or as an optional field on the form?" |
| GEO-040 | "Is SmartAgents still offering SmartSpace? If not, may we add a dated note to the SmartSpace article?" |
| GEO-041a | "The kata video was first public on 2 August 2026, on the old site. Google requires an upload date in the video's structured data. May we state 2 August 2026 there, even though the page does not print it? If not, we drop the video markup." |
| GEO-041b | "Does the kata tour video have narration? If so, may we publish a transcript and captions, and a copy on YouTube?" |

---

## 3. Items

### GEO-001: Opt out of Cloudflare's 2026-09-15 change; record the bot settings and crawler logs (merges GEO-012)

**Impact** Critical · **Size** XS · **Owner** dashboard · **Evidence** T1 + Observed

**Finding.** The zone runs Cloudflare's AI Crawl Control features: the managed robots.txt block is injected into live `robots.txt` (GEO-004). Whether "Block AI bots" (legacy or per-category) is on cannot be seen from outside. The spoofed-UA test (17 UAs, all 200) is inconclusive, because Cloudflare identifies verified bots by IP (`geo-live.md` §3). Nobody records crawler logs today.

**Why it matters.**
- Cloudflare's block-ai-bots doc (T1, re-fetched 2026-09-13): "Mixed-purpose crawlers that combine Search and Training will also be blocked by all configurations to block AI training, including the legacy 'Block AI bots' option. Before September 15, all customers can opt out of these new defaults." https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
- Cloudflare blog (T1, 2026-07-01): "Multi-purpose crawlers such as Googlebot, Applebot, and BingBot will be blocked by customers who have selected to block Training (either through the new options… or through the legacy Block AI bots service)". https://blog.cloudflare.com/content-independence-day-ai-options/
- **Scheduled effect:** a zone with any Training block, the legacy toggle included, stops Googlebot, Bingbot and Applebot on 2026-09-15. That removes eligibility for Google Search, AI Overviews, AI Mode and Copilot grounding.
- A legacy block here is plausible: managed robots.txt is on, and Cloudflare changed new zones' default "to block AI crawlers" in July 2025.
- The separate new category defaults ("blocked on pages that display ads") apply to new domains only, and the site shows no ads.

**Fix.**
1. **Before 2026-09-15:** open Security → Settings (`https://dash.cloudflare.com/?to=/:account/:zone/security/settings`) and opt out of the change.
2. Record, with screenshots and the date:
   - the legacy "Block AI bots" state
   - the per-category actions (Search / Agent / Training) and per-crawler actions
   - the Bot Fight Mode / Super Bot Fight Mode action
   - any WAF rule on `cf.verified_bot_category` or bot score
3. Set Search and Agent to Allow. **Never block the Training *category*:** it now carries Googlebot and Bingbot. If the client chooses to block training (GEO-004 Option B), block **per crawler**.
4. **Crawler-log baseline (was GEO-012):** record requests, the 2xx/3xx/404 split, blocked counts and the top 404 paths for Googlebot and Bingbot (GSC Crawl Stats, BWT crawl data), and for GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot and PerplexityBot (AI Crawl Control → Metrics, if available on this plan; not verified). Repeat monthly.

**Acceptance check.**
- A dated screenshot shows the opt-out confirmed and Training not blocked at category level.
- GSC → Settings → Crawl stats shows host status OK after 2026-09-15.
- BWT → URL Inspection → Live URL on `https://smartagents.be/nl/` succeeds after 2026-09-15.
- A dated crawler-log baseline exists.

---

### GEO-003: Old-site URLs (about 77 of 88) end in 404 with no 301s

**Impact** High · **Size** S · **Owner** code, client-input · **Evidence** T1 + Observed

**Status after this pass:** done; the M365 page and PDF rules are pending client review. Differs from the Fix: 128 rules, not 63 plus 56. The PDF goes to `/nl/training/` as planned. Nine more rules cover old pictures with a true successor, which the Fix's list of eight files missed: the two portraits, the four post images, the two brand cards and `logo.svg`. Every old file with no successor is named in the `_redirects` comment. The `check-dist` check reads `dist/_redirects` and resolves every rule that names one URL, whatever its status (so the root `302` is checked too); splat, placeholder and external targets are skipped. It fails on a target missing from `dist/`, a target `#id` its page lacks (checked on HTML targets only, so `.pdf#page=2` passes; the id must be a real `id` attribute, not `data-id`), a malformed `#fragment` (reported, not a crash), a directory target without a trailing slash, and a static source that hides a `dist/` file (`/` is allow-listed, with its reason). Each failure mode was proven by injection against a scratch copy of `dist/`.

**Finding.** The URL list comes from the old `main` tree (`cbd2582^1`, Eleventy 3):
- every `permalink:` in the page templates
- blog posts at `/blog/{{ page.fileSlug }}/`, `/en/blog/…`, `/fr/blog/…` (`blog/posts/posts.11tydata.js:13`, `en/en.11tydata.js:3`, `fr/fr.11tydata.js:3`), where `fileSlug` drops the date prefix
- `/customerzone/` in three languages
- the old redirect sources `/services/training/c-level/` and `/en/services/training/c-level/` (old `_redirects:12-13`)
- eight public files under `/assets/`

That is 88 URLs. Round 2 rebuilt the list independently and matched it rule by rule.

Live sweep, 2026-09-13. The count depends on the edge: two runs gave `final 404: 77 / final 200: 11` and `78 / 10`.

```
200s: /, /en/, /fr/, /en/team/, /en/jobs/, /contact/ (301 -> /nl/#contact), /jobs/ and /team/ (via 302 catch-all)
stale edge copies on some runs (GEO-002): /fr/services/, /en/services/agentic-ai/, /assets/smartagents.mp4
404 1 /blog/smartagents-lancering/ -> https://smartagents.be/nl/blog/smartagents-lancering/
404 1 /services/training -> https://smartagents.be/nl/services/training
```

`public/_redirects:1-19` covers only `/`, `/contact`, `/pitch*` and `/presentations/*`. The index (sampled through a search tool) holds only old URLs (`geo-live.md` §7.1), and third-party links point at old URLs.

**Why it matters.**
- Google's site-move guide (T1, 2026-08-20): "We recommend that you use HTTP permanent redirects if possible, such as 301 and 308"; "301 and other permanent redirects don't cause a loss in PageRank"; "Keep the redirects for as long as possible, generally at least 1 year".
- It warns against sending many URLs to one irrelevant page ("might be treated as a soft 404") but allows consolidation: "if you have consolidated content previously hosted on multiple pages to a new single page, you can redirect the older URLs to that new, consolidated page." https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Vercel/MERJ (T3): ChatGPT's crawler spent "34.82% of its fetches on 404 pages".
- High rather than Critical: the new URLs are eligible. What is lost is the old URLs' signals and referrals.

**Fix, part 1: 63 rules with a trailing slash.** Paste into `public/_redirects` **above** `/pitch /secured/presentations/pitch/ 301`.
- Cloudflare Pages (T1): "Static redirects should appear before dynamic redirects", with a limit of 2,000 static rules, and "If there are multiple redirects for the same source path, the top-most redirect is applied".
- `build/render.mjs:438-479` keeps the authored block after the generated static rules and before the generated `/xx/*` and `/*` rules.
- Round 2 verified all 63 sources existed on the old site and all 63 targets resolve in `dist/`.

```
# ---- The old Eleventy site (main before cbd2582). Permanent: keep at least a year.
# Derived from `git show cbd2582^1` permalinks. See geo-audit-violations.md, GEO-003.

# Services overview -> the homepage section that lists the services (consolidated).
/services/                              /nl/#services                                            301
/en/services/                           /en/#services                                            301
/fr/services/                           /fr/#services                                            301

# Training
/services/training/                     /nl/training/                                            301
/en/services/training/                  /en/training/                                            301
/fr/services/training/                  /fr/formation/                                           301
/services/training/developers/          /nl/training/agentic-engineering-kata/                   301
/en/services/training/developers/       /en/training/agentic-engineering-kata/                   301
/fr/services/training/developers/       /fr/formation/kata-agentic-engineering/                  301
# The business learning path that "Ons aanbod" replaced (CLAUDE.md): consolidated into /training/.
/services/training/ai-introductie/      /nl/training/                                            301
/en/services/training/ai-introductie/   /en/training/                                            301
/fr/services/training/ai-introductie/   /fr/formation/                                           301
/services/training/management/          /nl/training/                                            301
/en/services/training/management/       /en/training/                                            301
/fr/services/training/management/       /fr/formation/                                           301
/services/training/c-level/             /nl/training/                                            301
/en/services/training/c-level/          /en/training/                                            301
/services/training/m365-copilot/        /nl/training/                                            301
/en/services/training/m365-copilot/     /en/training/                                            301
/fr/services/training/m365-copilot/     /fr/formation/                                           301

# Staffing. Agentic automation is now part of the staffing track (CLAUDE.md).
/services/staffing/                     /nl/ai-staffing/                                         301
/en/services/staffing/                  /en/ai-staffing/                                         301
/fr/services/staffing/                  /fr/ai-staffing/                                         301
/services/agentic-ai/                   /nl/ai-staffing/                                         301
/en/services/agentic-ai/                /en/ai-staffing/                                         301
/fr/services/agentic-ai/                /fr/ai-staffing/                                         301

# Process work: the old page's business side, and SmartScan, now phase 1 of the processes page.
/services/process-optimization/         /nl/ai-native-processen/                                 301
/en/services/process-optimization/      /en/ai-native-processes/                                 301
/fr/services/process-optimization/      /fr/processus-ai-native/                                 301
/services/smart-scan/                   /nl/ai-native-processen/                                 301
/en/services/smart-scan/                /en/ai-native-processes/                                 301
/fr/services/smart-scan/                /fr/processus-ai-native/                                 301

# SmartSpace product page -> the SmartSpace article
/products/smartspace/                   /nl/inzichten/smartspace/                                301
/en/products/smartspace/                /en/insights/smartspace/                                 301
/fr/products/smartspace/                /fr/analyses/smartspace/                                 301

# Blog -> Inzichten (Eleventy's fileSlug drops the date prefix)
/blog/                                  /nl/inzichten/                                           301
/en/blog/                               /en/insights/                                            301
/fr/blog/                               /fr/analyses/                                            301
/blog/smartagents-lancering/            /nl/inzichten/hello-ai-era/                              301
/en/blog/smartagents-lancering/         /en/insights/hello-ai-era/                               301
/fr/blog/smartagents-lancering/         /fr/analyses/hello-ai-era/                               301
/blog/smartspace-platform/              /nl/inzichten/smartspace/                                301
/en/blog/smartspace-platform/           /en/insights/smartspace/                                 301
/fr/blog/smartspace-platform/           /fr/analyses/smartspace/                                 301
/blog/wat-werkt-en-wat-niet/            /nl/inzichten/wat-werkt-en-wat-niet/                     301
/en/blog/wat-werkt-en-wat-niet/         /en/insights/what-works-and-what-doesnt/                 301
/fr/blog/wat-werkt-en-wat-niet/         /fr/analyses/ce-qui-fonctionne-et-ce-qui-ne-fonctionne-pas/ 301
/blog/ontbijtsessie-aviso/              /nl/inzichten/ontbijtsessie-aviso/                       301
/en/blog/ontbijtsessie-aviso/           /en/insights/breakfast-session-aviso/                    301
/fr/blog/ontbijtsessie-aviso/           /fr/analyses/petit-dejeuner-aviso/                       301

# Team, jobs, contact (/contact/ and /en/team/, /en/jobs/ already resolve)
/team/                                  /nl/team/                                                301
/jobs/                                  /nl/jobs/                                                301
/fr/team/                               /fr/equipe/                                              301
/fr/jobs/                               /fr/emplois/                                             301
/en/contact/                            /en/#contact                                             301
/fr/contact/                            /fr/#contact                                             301

# Old public files under /assets/ (today /assets/ holds only Vite's hashed output)
/assets/training_agentic_dev.pdf                   /media/SmartAgents_Agentic_Engineering_Onepager.pdf  301
/assets/SmartAgents_AI_Developers_Onepager.pdf     /media/SmartAgents_Agentic_Engineering_Onepager.pdf  301
/assets/SmartAgents_AI_Introductie_Onepager.pdf    /nl/training/                                        301
/assets/SmartAgents_AI_Management_Onepager.pdf     /nl/training/                                        301
/assets/SmartAgents_M365_Copilot_Onepager.pdf      /nl/training/                                        301
/assets/kata-agentic-engineering.mp4               /media/kata-agentic-engineering.mp4                  301
/assets/kata-agentic-engineering-poster.jpg        /media/kata-agentic-engineering-poster.jpg           301
```

**Fix, part 2: 56 explicit slashless page rules.** Cloudflare's redirects doc does not say whether `/services/training/` matches `/services/training`. Today the slashless form answers `302 → /nl/services/training → 404`. Rather than depend on undocumented matching, add an explicit slashless rule for every page rule above. That is deterministic, and 119 rules total is far below the 2,000 limit. The seven `/assets/` file rules have no slashless form. Paste directly below part 1:

```
# Slashless forms of the old page URLs (Pages does not document trailing-slash matching).
/services                               /nl/#services                                            301
/en/services                            /en/#services                                            301
/fr/services                            /fr/#services                                            301
/services/training                      /nl/training/                                            301
/en/services/training                   /en/training/                                            301
/fr/services/training                   /fr/formation/                                           301
/services/training/developers           /nl/training/agentic-engineering-kata/                   301
/en/services/training/developers        /en/training/agentic-engineering-kata/                   301
/fr/services/training/developers        /fr/formation/kata-agentic-engineering/                  301
/services/training/ai-introductie       /nl/training/                                            301
/en/services/training/ai-introductie    /en/training/                                            301
/fr/services/training/ai-introductie    /fr/formation/                                           301
/services/training/management           /nl/training/                                            301
/en/services/training/management        /en/training/                                            301
/fr/services/training/management        /fr/formation/                                           301
/services/training/c-level              /nl/training/                                            301
/en/services/training/c-level           /en/training/                                            301
/services/training/m365-copilot         /nl/training/                                            301
/en/services/training/m365-copilot      /en/training/                                            301
/fr/services/training/m365-copilot      /fr/formation/                                           301
/services/staffing                      /nl/ai-staffing/                                         301
/en/services/staffing                   /en/ai-staffing/                                         301
/fr/services/staffing                   /fr/ai-staffing/                                         301
/services/agentic-ai                    /nl/ai-staffing/                                         301
/en/services/agentic-ai                 /en/ai-staffing/                                         301
/fr/services/agentic-ai                 /fr/ai-staffing/                                         301
/services/process-optimization          /nl/ai-native-processen/                                 301
/en/services/process-optimization       /en/ai-native-processes/                                 301
/fr/services/process-optimization       /fr/processus-ai-native/                                 301
/services/smart-scan                    /nl/ai-native-processen/                                 301
/en/services/smart-scan                 /en/ai-native-processes/                                 301
/fr/services/smart-scan                 /fr/processus-ai-native/                                 301
/products/smartspace                    /nl/inzichten/smartspace/                                301
/en/products/smartspace                 /en/insights/smartspace/                                 301
/fr/products/smartspace                 /fr/analyses/smartspace/                                 301
/blog                                   /nl/inzichten/                                           301
/en/blog                                /en/insights/                                            301
/fr/blog                                /fr/analyses/                                            301
/blog/smartagents-lancering             /nl/inzichten/hello-ai-era/                              301
/en/blog/smartagents-lancering          /en/insights/hello-ai-era/                               301
/fr/blog/smartagents-lancering          /fr/analyses/hello-ai-era/                               301
/blog/smartspace-platform               /nl/inzichten/smartspace/                                301
/en/blog/smartspace-platform            /en/insights/smartspace/                                 301
/fr/blog/smartspace-platform            /fr/analyses/smartspace/                                 301
/blog/wat-werkt-en-wat-niet             /nl/inzichten/wat-werkt-en-wat-niet/                     301
/en/blog/wat-werkt-en-wat-niet          /en/insights/what-works-and-what-doesnt/                 301
/fr/blog/wat-werkt-en-wat-niet          /fr/analyses/ce-qui-fonctionne-et-ce-qui-ne-fonctionne-pas/ 301
/blog/ontbijtsessie-aviso               /nl/inzichten/ontbijtsessie-aviso/                       301
/en/blog/ontbijtsessie-aviso            /en/insights/breakfast-session-aviso/                    301
/fr/blog/ontbijtsessie-aviso            /fr/analyses/petit-dejeuner-aviso/                       301
/team                                   /nl/team/                                                301
/jobs                                   /nl/jobs/                                                301
/fr/team                                /fr/equipe/                                              301
/fr/jobs                                /fr/emplois/                                             301
/en/contact                             /en/#contact                                             301
/fr/contact                             /fr/#contact                                             301
```

How the targets were decided:
- Current slugs are from `src/pages/*.mjs` and `src/pages/insights/insights.mjs:40-92`.
- `training_agentic_dev.pdf` was the developers page's one-pager (`services/training/developers/developers.11tydata.js:8`, replaced 2026-08-31 in `ff3b5f6`). The kata page is the port of that page (CLAUDE.md).
- `ai-introductie` → `m365-copilot` was one learning path (old `i18n/nl.json:199`).
- `/xx/#services` and `/xx/#contact` are consolidation targets for an index page and a contact page.
- The M365 page **and** the M365 one-pager PDF are consolidated into `/training/`, subject to the client veto in §2(c). As implemented, `/nl/training/` receives 13 sources, `/en/training/` 10 and `/fr/formation/` 8 (counted from `public/_redirects`).

**Fix, part 3: the redirect-target check in `scripts/check-dist.mjs` §5b.** (Spec as first proposed; the implemented check is stricter, see the status line.) For every rule in the authored block of `dist/_redirects`:
1. Skip rules whose status is not `301`, such as `/ /nl/ 302`.
2. Skip targets containing `*` or a `:placeholder`, such as `/presentations/* /secured/presentations/:splat 301`.
3. Strip any `#fragment`.
4. A target ending in `/` must resolve to `<target>index.html` in `dist/`; any other target must resolve to that file, such as `/media/SmartAgents_Agentic_Engineering_Onepager.pdf`.
5. Otherwise, fail with "redirect target missing".

Existing rules then pass: `/contact` → `/nl/`, and `/pitch` → `dist/secured/presentations/pitch/index.html`.

**No real successor. These stay 404 until the client answers** (questions in §2(c)):
- `/aanpak/`, `/en/aanpak/`, `/fr/aanpak/` (the old 5-step build method)
- `/services/{ontwerp,ontwikkeling,implementatie,optimalisatie-support}/` in three languages (12 URLs)
- `/customerzone/`, `/en/customerzone/`, `/fr/customerzone/`. The old page was "Uw persoonlijke klantenzone" (old `i18n/nl.json:421`); candidate target `/secured/`.
- `/assets/smartagents.mp4`, `/assets/smartspace-demo.mp4`

**Known, pre-existing 404s:** four Dutch posts were deleted from the old site on 2026-06-05 (`5fe67fb`, "chore: add blogposts (3)"): `/blog/wat-is-een-agent/`, `/blog/rpa-vs-agents/`, `/blog/case-claes-logistics/`, `/blog/copilot-tips/`. They have 404'd since June and may appear in the GSC 404 export. They are not a regression and get no redirect. On the "Claes Logistics" case, see GEO-008.

**Acceptance check.** Rebuild the list from git and sweep it:

```sh
cd /Users/bassarrechia/code/smartagents-website && R='cbd2582^1'
{ git ls-tree -r "$R" --name-only | grep -E '\.njk$' | grep -vE '^(secured|customerzone|404)/' |
    while read f; do git show "${R}:${f}" | sed -n 's/^permalink: *//p' | head -1; done
  for l in "" en/ fr/; do
    for s in smartagents-lancering smartspace-platform wat-werkt-en-wat-niet ontbijtsessie-aviso; do echo "/${l}blog/$s/"; done
    echo "/${l}customerzone/"
  done
  printf '%s\n' /services/training/c-level/ /en/services/training/c-level/ \
    /assets/{SmartAgents_AI_Developers_Onepager,SmartAgents_AI_Introductie_Onepager,SmartAgents_AI_Management_Onepager,SmartAgents_M365_Copilot_Onepager,training_agentic_dev}.pdf \
    /assets/{kata-agentic-engineering,smartagents,smartspace-demo}.mp4
} | grep -v '\.xml$' | sort -u |
while read u; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://smartagents.be$u") $(curl -s -o /dev/null -L -w '%{http_code}' "https://smartagents.be$u") $u"
done | awk '{f[$2]++} $2=="404"{print "still 404:", $3} END{for (k in f) print "final", k, f[k]}'
```

- **Today:** about `final 404 77-78`, `final 200 10-11`, depending on the edge.
- **After:** only the 20 no-successor URLs are `still 404`.
- Slashless: `for u in /services/training /blog/smartspace-platform /fr/team; do curl -s -o /dev/null -w "%{http_code} $u\n" "https://smartagents.be$u"; done` prints `301` for each (today `302`).
- `npm run build` passes with the new target check.

---

### GEO-005: Search Console and Bing Webmaster Tools

**Impact** High · **Size** S · **Owner** dashboard · **Evidence** T1

**Finding.**
- `dist/` has no verification meta tag or file (`geo-inventory.md` §6).
- The old site ran GA (`G-LB7SHMLZ3R`), so an existing verification may exist; nobody on the repo side can confirm it.
- The index shows only old URLs and titles, for example "SmartAgents | AI & process automation solutions" for `/en/` (`geo-live.md` §7.1). The redesign went live on 2026-09-13.

**Why it matters.**
- Google (T1): "a page must be indexed and eligible to be shown in Google Search with a snippet" to appear in AI features. https://developers.google.com/search/docs/appearance/ai-features
- The Search generative AI control is Include by default, per property (https://support.google.com/webmasters/answer/16908024).
- GSC's generative AI report counts impressions only (https://support.google.com/webmasters/answer/16984139).
- Bing's AI Performance report gives citations and grounding queries (T1, https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview).
- The site-move guide: "Submit the new sitemap in Search Console."

**Fix.**
1. Add a GSC **Domain property** via DNS TXT in Cloudflare.
2. Submit `https://smartagents.be/sitemap.xml`.
3. Settings → Search generative AI: confirm **Include**.
4. URL Inspection → Request indexing for `/nl/`, `/en/`, `/fr/`, the four NL service pages, the kata page, `/nl/team/` and `/nl/inzichten/` (11 URLs).
5. After GEO-003 is live, export Pages → "Not found (404)". Ignore the four known pre-existing 404s (GEO-003); add any other path the git sweep missed.
6. In BWT: import from GSC, submit the sitemap, submit the same 11 URLs, and record the AI Performance baseline.

**Acceptance check.**
- GSC Sitemaps shows "Success" with 42 discovered URLs.
- The AI control reads Include.
- URL Inspection on `/nl/training/agentic-engineering-kata/` shows "URL is on Google" (days to weeks).
- BWT shows the sitemap processed.
- A dated GSC/BWT baseline is recorded. Trends need weeks of data.

---

### GEO-007a: Descriptive `<title>`s built from facts the site already states

**Impact** High · **Size** S · **Owner** code (client reviews wording) · **Evidence** T1 · **Status: implement now; merge blocked on client review**

**Status after this pass:** done in the working tree, pending client review; not to deploy before the client replies. Differs from the table below:
- The homepage title names all four services, shortened from their nav names: NL "Training, AI staffing, AI-native SDLC en processen · SmartAgents" (64), EN "… and processes · SmartAgents" (65), FR "Formation, AI staffing, SDLC et processus AI-native · SmartAgents" (65). "Belgische organisaties" no longer fits; `home.description` still names Belgium in all three languages.
- The French training, staffing and SDLC titles have their articles back. Staffing reads "AI engineer staffing, coaching des développeurs et équipes métier" (65), so that, as in NL and EN, only the coaching is for developers and business teams; an earlier "AI staffing et coaching pour les développeurs…" put the staffing under the same "pour" and was reverted after the implementation review.
- The default share card's `og:image:alt` is its own text, the wordmark plus `hero.claim`, not the page title.

**Finding.** From `src/i18n/*.json` (`<id>.title`):
- The homepage is `SmartAgents · Digitale collega's die nooit slapen`, which names neither the offer nor Belgium.
- Training, team, jobs and SDLC are bare labels (`Training · SmartAgents`, `Team · SmartAgents`, `Jobs · SmartAgents`, `AI-native SDLC · SmartAgents`). The acceptance check below counts 12 bare titles across the three languages today.
- The kata page's is the one descriptive **service** title.
- `pageMeta()` (`build/render.mjs:96-104`) is the only reader of `<id>.title`, which also becomes `og:title`. The nav uses `service.<key>.nav` and the heroes use `<id>.hero.title`, so neither moves.

**Why it matters.**
- Google's title-link guide (T1, 2025-12-10): "Write descriptive and concise text for your `<title>` elements. Avoid vague descriptors like 'Home'… distinct text that describes the content of the page". https://developers.google.com/search/docs/appearance/title-link
- AI Overviews and AI Mode retrieve through core ranking and query fan-out (T1). A title that names the offer and the country fits the long-tail queries a niche firm can win, and helps separate the brand from its namesakes (GEO-006).
- Identical NL/EN words such as "Training" are correct Dutch and not a fault (R13).

**Fix.** Paste these values verbatim. The rules they follow:
- Every phrase is taken from strings the site already prints or uses as metadata, named in the "Source" column. Nothing about the offer is new.
- Every title is 66 characters or fewer (measured).
- On the homepage, "Belgische organisaties" and its translations end by character 51.
- The " · SmartAgents" suffix is kept only for keys where all three languages stay within about 65 characters. Otherwise it is dropped for all three, because Google prints the site name separately in results (site-names doc).
- The staffing title lists the three tracks, so "voor developers en business teams" attaches only to the coaching.

The table below is the proposal as first written. The values that shipped differ where the status line above says so; `src/i18n/*.json` is authoritative.

| Key | NL (length) | EN (length) | FR (length) | Source |
|---|---|---|---|---|
| `home.title` | Training en AI staffing voor Belgische organisaties · SmartAgents (65) | Training and AI staffing for Belgian organisations · SmartAgents (64) | Formation et AI staffing pour organisations belges · SmartAgents (64) | `home.description` ("training, AI staffing en coaching… voor Belgische organisaties"), `service.training.nav`, `service.staffing.nav` |
| `training.title` | Training: AI voor business teams en agentic engineering (55) | Training: AI for business teams and agentic engineering (55) | Formation : IA pour équipes business et agentic engineering (59) | `service.training.nav`, `training.course.business.title`, `training.course.agentic.title` |
| `staffing.title` | AI-engineer staffing, coaching voor developers en business teams (64) | AI engineer staffing, coaching for developers and business teams (64) | AI engineer staffing, coaching des développeurs et équipes métier (65) | `staffing.track.engineer.title`, `staffing.track.developers.title`, `staffing.track.business.title` |
| `sdlc.title` | AI-native SDLC-transformatie voor softwareteams (47) | AI-native SDLC transformation for software teams (48) | Transformation SDLC AI-native pour équipes de développement (59) | `service.sdlc.title`, `sdlc.description` ("softwareteams" / "software teams" / "équipes de développement") |
| `processes.title` | AI-native businessprocessen en herbruikbare workflows (53) | AI-native business processes and reusable workflows (51) | Processus métier AI-native et workflows réutilisables (53) | `service.processes.title`, `processes.description` |
| `team.title` | Team: Axel Segers en Tom Haeldermans · SmartAgents (50) | Team: Axel Segers and Tom Haeldermans · SmartAgents (51) | Équipe : Axel Segers et Tom Haeldermans · SmartAgents (53) | `nav.team`, `team.description` |
| `jobs.title` | Jobs: werken bij SmartAgents (28) | Jobs: working at SmartAgents (28) | Emplois : travailler chez SmartAgents (37) | `nav.jobs`, `jobs.why.title` |
| `insights.index.title` | Inzichten: AI bij Belgische teams · SmartAgents (47) | Insights: AI in Belgian teams · SmartAgents (43) | Analyses : l'IA dans les équipes belges · SmartAgents (53) | `nav.insights`, `insights.index.description` |

Kata, articles and privacy stay as they are.

**Acceptance check.**

```sh
grep -oE '<title>(Training|Team|Jobs|Formation|Équipe|Emplois|AI-native SDLC|SDLC AI-native) · SmartAgents</title>' dist/*/index.html dist/*/*/index.html | wc -l   # today 12; after: 0
grep -o '<title>[^<]*nooit slapen' dist/nl/index.html | wc -l                                                                             # today 1; after: 0
node -e 'for (const l of ["nl","en","fr"]) { const s=require(`./src/i18n/${l}.json`); for (const k of ["home.title","training.title","staffing.title","sdlc.title","processes.title","team.title","jobs.title","insights.index.title"]) if ([...s[k]].length>66) console.log("too long:", l, k); }'   # after: prints nothing
```

---

### GEO-008: No proof on the site: no clients, cases or attributable outcomes

**Impact** High · **Size** L · **Owner** client-input, code · **Evidence** T1 guidance, T3

**Finding.** `geo-inventory.md` §4 finds no client names, case studies, testimonials, logos, quantified outcomes, certifications, partnerships or awards on the site. Net words: home 282, training 295, staffing 366, processes 288, team 145. The kata page (732) is the specific exception.

**Why it matters.**
- Google (T1) prefers first-hand, non-commodity content with visible trust signals: "trust is most important". https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Microsoft (T1): "Support claims with evidence".
- Chen et al. (T2, preprint): AI search favours earned sources, and a co-published client case is both on-site proof and an earned mention.
- C-SEO Bench (T2): rewording alone is ineffective. This item is about adding facts.

**Fix.** Needs the client's answer (§2(c)). Add a case block or page per engagement in three languages, in HTML, linked from the relevant service page, and ask the client to publish or link it too. No figure the client cannot source.

**Fabrication guard:** the old site briefly carried "Case: Claes Logistics bespaart 200 uur per maand" (`blog/posts/2026-05-28-case-claes-logistics.md`, deleted on 2026-06-05 in `5fe67fb`). It must **not** be revived as proof unless the client confirms it is a real, named engagement with that outcome.

**Acceptance check.** At least one service page links to a case with a named client or an attributable, quantified outcome. `grep -o '<client name>' -r dist/nl | wc -l` returns 1 or more.

---

### GEO-009: Almost no earned third-party mentions

**Impact** High · **Size** XL · **Owner** off-site, client-input · **Evidence** T2 (preprint) + T3

**Finding.**
- Third-party pages naming the company: KBO, Trendstop/Knack, one made-in.be article (21 April 2026), a ClickForest list, LinkedIn (`geo-live.md` §6.1-6.2).
- smartagents.be appeared in none of 8 NL/EN/FR buyer queries (§7.3).

**Why it matters.**
- Chen, Wang, Chen, Koudas (arXiv 2509.08919, **preprint**): "a systematic and overwhelming bias towards Earned media".
- Ahrefs, 75K brands (T3, correlational): branded web mentions ρ=0.664 with AI Overview visibility.
- Google (T1): "Seeking inauthentic 'mentions'… isn't as helpful as it might seem."

**Fix.** An authentic, ongoing programme (question in §2(c)):
- an Aviso+ recap page linking the article
- a made-in.be follow-up on the new offer
- Belgian trade press
- meetup and conference speaker pages
- podcasts
- client or partner pages (GEO-008)
- real partner directories (GEO-030)

Log every URL with its date and anchor text.

**Acceptance check.** The log exists and is reviewed quarterly. The count of distinct third-party domains naming SmartAgents together with Belgium/Beringen, or linking smartagents.be, rises quarter on quarter.

---

### GEO-002: Some edges still serve old-site pages with a 200

**Impact** Medium · **Size** XS · **Owner** dashboard · **Evidence** Observed

**Finding.** Re-curled 2026-09-13. Removed paths alternate by colo:

```
/fr/services/            200 (103 Early Hints first)  x-robots-tag: noindex  age=72180  -AMS
/fr/services/            404                          (no x-robots-tag)                -BRU
/en/services/agentic-ai/ 200                          x-robots-tag: noindex  age=22363  -AMS  (x6)
/assets/smartagents.mp4  200 video/mp4                (no x-robots-tag)      age=194730 -AMS  (x3; not reproduced by critic round 2: 5 x 404)
```

- Stale HTML carries old-site GA/GTM (`G-LB7SHMLZ3R`, `GTM-549SNV2X`) and Google Fonts (`geo-live.md` §7.4).
- It also carries the **current** `_headers` CSP, so the current Pages deployment serves it (critic F4).

**Why it matters.**
- **Index:** small. Every stale HTML copy is `x-robots-tag: noindex`.
- **Privacy:** the stale pages load Google Analytics, Tag Manager and Google Fonts for visitors, against the privacy notice ("Geen analytics, geen tracking", `src/i18n/nl.json:376`) and the no-third-party rule.
- **Redirects:** Cloudflare Pages says "Redirects are always followed, regardless of whether or not an asset matches", so GEO-003's 301s will win over the stale copies.

**Fix.** Caching → Configuration → **Purge Everything**, once. Pages caches a deployed asset "until your next deployment" with a one-week TTL, so the stale copies should age out by about 2026-09-20. Re-run the check then. If 200s persist, check Cache Rules and Tiered Cache, then open a ticket with the `cf-ray` IDs.

**Acceptance check.**

```sh
for u in /fr/services/ /en/services/agentic-ai/ /fr/team/ /assets/smartagents.mp4; do for i in $(seq 1 10); do
  curl -s -o /dev/null -D - "https://smartagents.be$u" | awk -v u="$u" 'tolower($1)=="age:"{a=$2} tolower($1)=="cf-ray:"{r=$2} /^HTTP/{s=$2} END{print u, s, "age="a, r}'
done; done | awk '$2=="200"' | wc -l      # 40 requests; today about half (critic round 2: 21 of 40); after: 0
```

Writer's refinement of critic F3: the stale HTML 200s are noindexed, but the one stale media 200 observed (`/assets/smartagents.mp4`) carried no `x-robots-tag`. It is an edge observation with no GEO consequence (an mp4 is not an indexable page), and round 2 could not reproduce it.

---

### GEO-004: Managed robots.txt contradicts the site's robots.txt for eight training bots

**Impact** Medium · **Size** XS · **Owner** dashboard, client-input · **Evidence** T1 + Observed

**Finding.** Live `robots.txt` (2747 B) is Cloudflare's managed block (`User-agent: *` with `Content-Signal: search=yes,ai-train=no,use=reference`, then `Disallow: /` groups) followed by the site's own 911-byte file, byte-identical to `dist/robots.txt` (`geo-live.md` §2).
- **Eight** bots get two opposite groups: Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Google-Extended, GPTBot, meta-externalagent.
- `CloudflareBrowserRenderingCrawler` is only in the managed block.
- The file has two `User-agent: *` groups.
- Search and retrieval agents are not in the managed block.

**Why it matters.**
- RFC 9309 says groups "MUST be combined" and allow wins a tie, and Google's parser merges groups, so Google-Extended resolves to Allow.
- Only vendors whose parsers stop at the first matching group would read `Disallow: /`, and none publish how they parse. The repo already assumes such parsers exist (`render.mjs:311-313`).
- At stake is training use only. Every T1 doc says training tokens do not affect citation. Hence Medium.
- The site cannot currently state one policy.

**Fix.** Needs the client's training decision (§2(c)).
- **Option A (the repo's current intent: allow).** Turn off managed robots.txt in AI Crawl Control. Optionally add `Content-Signal: search=yes, ai-input=yes, ai-train=yes` under `User-agent: *` in `robotsTxt()` (`build/render.mjs:336`). These are preferences only.
- **Option B (block training).** Keep the managed block, and remove the eight overlapping bots from `AI_CRAWLERS` (`render.mjs:318-334`). Keep the search and user agents. Block per crawler, never by Training category (GEO-001).
- Never block OAI-SearchBot, Claude-SearchBot, Claude-User or PerplexityBot. Do not enable Markdown for Agents (R14).

**Acceptance check.**

```sh
curl -s https://smartagents.be/robots.txt | grep -o 'Cloudflare Managed' | wc -l      # Option A: 0 (today 2)
curl -s https://smartagents.be/robots.txt | grep -o '^User-agent: GPTBot' | wc -l      # Option A or B: 1 (today 2)
```

---

### GEO-006: Off-site identity is inconsistent amid many namesakes

**Impact** Medium · **Size** S · **Owner** off-site, client-input · **Evidence** Observed + Judgement

**Finding.**
- **KBO/BCE** (`geo-live.md` §6.1): `Webadres: Geen gegevens opgenomen in KBO.` Email and phone are empty too.
- **LinkedIn**, as observed in `geo-live.md` §6.1 (LinkedIn blocks curl, so not re-verified): the company page title is `Smartagents.be | LinkedIn`, with an old tagline, and Axel Segers's headline reads "Smartagents.be".
- **Second location on the old site.** Until 2026-09-13 the old site stated a second location in three machine-readable places (`git show cbd2582^1`):
  - `llms.txt:3`, verbatim: "Based in Beringen and Kortessem, Belgium."
  - the Organization JSON-LD, `_includes/seo/organization-schema.njk:21`: `"addressLocality": "Kortessem"`, beside a Beringen address at `:15`
  - the footer, `footer.office.kortessem`: "Kortessem, België" (old `i18n/nl.json:125`)

  The new site names only Beringen.
- **Namesakes:** Be SmartAgents / SmartAgents.AI (Brazil), getsmartagents.com (US), Smartlead "SmartAgents", smartagents.com, Crunchbase "Smart Agents" (`geo-live.md` §6.3).

**Why it matters.**
- A registry, a profile and a previously crawled graph that disagree about name and location give an engine a weaker entity to resolve.
- The old Kortessem address was structured data crawlers were given until today.
- The only direct observation of confusion is one undisclosed search tool's summariser, which is a tool artefact. Hence Medium.

**Fix.**
1. **KBO:** add `https://smartagents.be/` via My Enterprise (https://economie.fgov.be/nl/themas/ondernemingen/kruispuntbank-van/my-enterprise).
2. **LinkedIn company page:** display name "SmartAgents"; tagline and About from `home.description`; website `https://smartagents.be/nl/`; location Beringen.
3. **Founders' headlines:** "SmartAgents".
4. **Kortessem:** confirm with the client (§2(c)). If it is no longer a location, make sure no profile or directory still lists it.

**Acceptance check.**

```sh
curl -s 'https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=1037114694&actionLu=Zoek' | grep -o 'smartagents\.be' | wc -l   # today 0; after >= 1
```

LinkedIn: check manually that the page title reads "SmartAgents".

---

### GEO-014b: Team page is thin; the founders' track record is not on it

**Impact** Medium · **Size** S · **Owner** client-input · **Evidence** T1 guidance

**Finding.**
- `dist/nl/team/` has 145 net words.
- Bios (`src/i18n/nl.json:344-346`): Axel "Ondernemer met meer dan 25 jaar ervaring in digitale transformatie…"; Tom "Technisch architect, gespecialiseerd in agentic AI-systemen…".
- Axel's history is already published copy in the launch article ("Van JArchitects tot We+") and on made-in.be, but not on the team page.

**Why it matters.** Google's Who/How/Why test (T1): "Is it self-evident to your visitors who authored your content?" For a firm under six months old, the founders' record is its main trust and recall anchor.

**Fix.** Needs confirmed career facts (§2(c)). Work them into the bio sentence in `team.person.*.body` in three languages. No separate role line or tag row, per CLAUDE.md's removal of the "De oprichters" pill and its tag-row rule. Once a bio sentence states the role, add `Person.jobTitle` in `founderNodes()` (`schema.mjs`) read from that same key (was GEO-014a).

**Acceptance check.**

```sh
node -e 'const h=require("fs").readFileSync("dist/nl/team/index.html","utf8");const m=h.slice(h.indexOf("<main"),h.indexOf("</main>")).replace(/<[^>]+>/g," ");console.log(m.split(/\s+/).filter(Boolean).length)'   # today 226 incl. contact block; after: >= 380
```

---

### GEO-015: Articles have no visible author and are attributed to the Organization

**Impact** Medium · **Size** S · **Owner** client-input, code · **Evidence** T1 guidance

**Finding.**
- `src/pages/insights/insights.mjs:364-376` prints title, lede, date and tags, but no byline.
- `articleNode()` sets `author: { '@id': ORGANISATION_ID }` (`schema.mjs:210`), and `schema.mjs:195-200` explains why.
- `base.mjs` emits `article:author` and `<meta name="author">` as "SmartAgents".
- The launch piece is written in the founders' first person.

**Why it matters.** Google's Who/How/Why guidance (T1). `geo-research.md` §15: "a named author, a short credential and a link to the team page".

**Fix.** Needs to know who wrote each article (§2(c)); the byline is the fact, so no code before that. Then:
- add `author: 'axel' | 'tom' | null` to `INSIGHTS`
- print a byline linked to the team page, with an `id` per the element-ids skill
- point `articleNode.author` at the founder's `@id`, with a minimal Person node
- update `article:author` and `meta name=author`, and the comment at `schema.mjs:195-200`

**Acceptance check.** `grep -o 'article-meta__author' dist/nl/inzichten/*/index.html | wc -l` returns 0 today and the number of attributed articles after.

---

### GEO-017: Third-party pages describe the old positioning

**Impact** Medium · **Size** S · **Owner** off-site · **Evidence** T2 (preprint) + T3 + Observed

**Finding.**
- ClickForest's "Best AI agent agencies in Belgium (2026)" lists SmartAgents as "Autonomous AI agents that reason, plan, and execute complex tasks alongside your team".
- made-in.be (21 April 2026) describes the old three pillars and has a person page, made-in.be/personen/axel-segers/ (`geo-live.md` §6.2).
- The old `llms.txt` served until 2026-09-13 described the old offer (GEO-006).

**Why it matters.** Engines lean on third-party sources to describe a brand (GEO-009). Stale descriptions make answers describe services the site no longer offers, and branded-answer accuracy is a rubric metric (§7, C).

**Fix.**
- Email ClickForest asking them to update the listing text and link `https://smartagents.be/nl/`.
- Ask made-in.be to update the person page. A dated news story is better answered with a new story (GEO-009).
- Check Trendstop's activity text.

**Acceptance check.** Re-fetching the ClickForest listing shows the current services. Requests are logged with dates.

---

### GEO-018: No Google Business Profile or Bing Places listing

**Impact** Medium · **Size** S (+ verification wait) · **Owner** off-site, client-input · **Evidence** T1

**Finding.** No GBP or Bing Places listing was found (`geo-live.md` §6.1). The seat is Mijnschoolstraat 18, 3580 Beringen, and the kata is given at the client's office (`schema.mjs:151-160`).

**Why it matters.**
- Google's AI optimization guide (T1): "Using products like… Google Business Profiles can help your products and services to be visible in both AI responses and other Google Search results."
- Bing recommends Bing Places.
- Eligibility rules: https://support.google.com/business/answer/3038177 .

**Fix.** If the client confirms eligibility (§2(c)):
- create a service-area GBP: "SmartAgents", category consultant, area Belgium, website `/nl/`, the footer phone
- import it into Bing Places
- keep NAP identical to the footer and `schema.mjs`

Otherwise close the item.

**Acceptance check.** The listing is verified, and its name, address and phone match the footer: `grep -o 'Mijnschoolstraat 18' dist/nl/index.html | wc -l` ≥ 1, and the same `+32 11 11 10 20`.

---

### GEO-021: No repeatable NL/EN/FR prompt panel

**Impact** Medium · **Size** M per run · **Owner** ops, client-input · **Evidence** T3 (method)

**Finding.** There are no analytics by policy and no GSC/BWT baseline yet. No record exists of how answer engines describe or cite the company (`geo-live.md` §7).

**Why it matters.**
- SparkToro/Gumshoe (T3): AI brand lists are "highly inconsistent", so only **rates** over repeated runs are meaningful.
- Rubric dimension C (25 of 100 points) cannot be scored without this.

**Fix.** A protocol sized to run:
- **Prompts:** 15 (5 per language), covering unbranded category, problem-shaped, comparison and branded.
- **Runs:** 5 per engine, on 4 engines (ChatGPT with search, Perplexity, Google AI Mode / observed AI Overviews, Copilot). That is 300 runs.
- **Recorded conditions:** logged-out, BE, UI language, date, model.
- **Metrics:** mention rate; own-domain citation rate; third-party citation rate; factual accuracy of branded answers (founders, services, Beringen, **no Kortessem**, languages, no namesake confusion). Report 95% Wilson intervals.
- **Also:** whether `search.brave.com` shows the new URLs.
- **Schedule:** the baseline after GEO-003 and GEO-005, then quarterly.

**Acceptance check.** A dated baseline sheet exists with per-engine, per-language rates, intervals and the exact prompts.

---

### GEO-022: No Sortlist or Clutch profiles

**Impact** Medium · **Size** M · **Owner** off-site, client-input · **Evidence** T3 + Observed

**Finding.** Buyer queries surfaced Sortlist ("De 10 beste AI-agenten Bureaus in Vlaanderen") and Clutch BE (`geo-live.md` §7.3). There is no Sortlist, Clutch or Crunchbase profile (§6.1).

**Why it matters.**
- Profound (T3): ChatGPT citations are widely spread, so niche directories do get cited.
- The observed queries show these directories answering this firm's category questions.
- A profile is brand-authored, weaker than earned media.

**Fix.**
- Create Sortlist and Clutch profiles in the site's words.
- Clutch ranks on verified reviews (§2(c)).
- Add each live profile to `Organization.sameAs` (GEO-013a).

**Acceptance check.** The profiles are live and link `/nl/`. `grep -o 'clutch.co\|sortlist' dist/nl/index.html | wc -l` returns 1 or more after the `sameAs` update.

---

### GEO-023: Four articles, the newest from June; no cadence

**Impact** Medium · **Size** XL · **Owner** client-input · **Evidence** T1 guidance, T2/T3

**Finding.** `INSIGHTS` (`src/pages/insights/insights.mjs:40-92`) holds four articles (2026-04-21, 05-01, 06-05, 06-12), all ported from the old blog.

**Why it matters.**
- Google (T1) prefers first-hand pieces over "a summary of existing content".
- Ahrefs (T3): AI-cited pages skew fresher than organic results, except in AI Overviews.
- Recency bias has been shown in research (T2, SIGIR-AP 2025).

**Fix.** Agree a sustainable cadence and first-hand topics (§2(c)). Each piece is an `INSIGHTS` entry plus a body module, with a byline (GEO-015) and sources (GEO-033). No generic "benefits of AI" pieces. No revived placeholder cases (GEO-008).

**Acceptance check.** `node -e 'import("./src/pages/insights/insights.mjs").then(m=>console.log(m.INSIGHTS.length, m.INSIGHTS.map(i=>i.published).sort().at(-1)))'` prints `4 2026-06-12` today, and the count grows on the agreed cadence.

---

### GEO-007b: Homepage H1 slogan decision

**Impact** Low · **Size** XS · **Owner** client-input · **Evidence** Judgement

**Finding.** The homepage H1 is the claim "Digitale collega's die nooit slapen" (`home.hero.title`), chosen deliberately (CLAUDE.md). The phrase is also used by Syntra AB and Smart Lions, and in English it echoes the Brazilian namesake's "No breaks. No vacations" (`geo-live.md` §6.3).

**Why it matters.** GEO-007a puts the description in the `<title>`. The H1 is a brand decision with a small disambiguation cost.

**Fix.** Ask the client (§2(c)). No code until they answer.

**Acceptance check.** The decision is recorded.

---

### GEO-010: Cloudflare Email Obfuscation rewrites the visible address

**Impact** Low · **Size** XS · **Owner** dashboard · **Evidence** T1 + Observed

**Finding.** Live HTML replaces each visible `mailto:info@smartagents.be` with `/cdn-cgi/l/email-protection#…` and `[email protected]`, and adds `email-decode.min.js`. On `/nl/`, dist has 5 `mailto:` occurrences and live has 2. JSON-LD, `llms.txt`, the phone and the form's `mailto:` action are untouched.

**Why it matters.** Non-JS extractors see `[email protected]` in the body. The address stays machine-readable elsewhere, and Googlebot renders JS, so the effect is close to nil. The rewrite also breaks the repo's "what the browser sees is what deploys" (CLAUDE.md), and protects nothing.

**Fix.** Security → Settings → Email Address Obfuscation: **Off**, or a Configuration Rule. https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/ . Not `<!--email_off-->`: `build/render.mjs:66` minifies with `removeComments: true`.

**Acceptance check.**

```sh
[ "$(curl -s https://smartagents.be/nl/ | grep -o 'mailto:info@smartagents.be' | wc -l)" -eq "$(grep -o 'mailto:info@smartagents.be' dist/nl/index.html | wc -l)" ] && echo SAME   # today: live 2, dist 5; after: SAME
```

---

### GEO-011: `http://www` takes 3 hops; the root 302 is an open decision

**Impact** Low · **Size** XS · **Owner** dashboard, client-input · **Evidence** T1/T1b + Observed

**Finding.**

```
http://www.smartagents.be/  301 -> https://www.smartagents.be/ -> 301 https://smartagents.be/ -> 302 /nl/ -> 200
public/_redirects:5         / /nl/ 302
```

**Why it matters.**
- **Hops:** every hop costs a fetch; one is cheaper.
- **Root 302, a real trade-off:**
  - Google (T1): with a 302, "the indexing pipeline doesn't use the redirect as a signal that the redirect target should be canonical".
  - Mueller (T1b, johnmu.com): a 302 "is useful for redirecting from the root URL to a lower-level page… Search engines tend to index the content (and keep all signals) under" the root.
  - Google's site-names doc (T1, 2025-12-10) defines the home page as "the domain or subdomain level root URI", and says: "Google Search does not support site names at the subdirectory level."
  - Keeping `https://smartagents.be/` as the indexed homepage matches `Organization.url` and `WebSite.url`. A 301 would make `/nl/` the homepage.
- The catch-all 302 → 301 change is withdrawn (R25).

**Fix.**
- Dashboard: a single Redirect Rule `http*://www.smartagents.be/*` → `https://smartagents.be/${1}`, 301.
- Root: keep the 302 unless the client answers "smartagents.be/nl/" (§2(c)).

**Acceptance check.**

```sh
curl -sIL http://www.smartagents.be/ | grep -o '^HTTP[^ ]* [0-9]*' | wc -l    # today 4; after: 3
```

---

### GEO-013a: Organization: add `iso6523Code` and a KBO `sameAs`

**Impact** Low · **Size** XS · **Owner** code · **Evidence** T1 (purpose); T3 null

**Status after this pass:** done. The enterprise number is read off `footer.vat`, and the build fails if that label stops reading as one ten-digit number.

**Finding.** `organisationNode()` (`src/layouts/schema.mjs:77-99`) has `legalName`, `vatID` (`BE1037114694`), `address` and `sameAs: [LinkedIn]`. It has no `iso6523Code` and no registry `sameAs`.

**Why it matters.**
- Google's Organization docs (T1, 2026-09-08): "Some properties are used behind the scenes to disambiguate your organization from other organizations (like iso6523 and naics)."
- ICD 0208 is the Belgian Crossroads Bank for Enterprises identifier (Peppol ICD list), so `0208:1037114694` is correct.
- Counterweight: Google says no special markup is needed, and Ahrefs (T3) found no citation uplift. Hence Low.

**Fix.** In `organisationNode()`:
- Add `iso6523Code: '0208:1037114694'`; the footer prints the number.
- Add `https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=1037114694&actionLu=Zoek` to `sameAs`.
- `knowsAbout` is optional (schema.org only).
- No `contactPoint`, and no `alternateName: "Smartagents.be"`; the site-name alternate is GEO-043.

**Acceptance check.**

```sh
node -e 'const g=JSON.parse(require("fs").readFileSync("dist/nl/index.html","utf8").match(/application\/ld\+json">(.*?)<\/script>/)[1])["@graph"];const o=g.find(n=>n["@type"]==="Organization");console.log(o.iso6523Code, o.sameAs.length)'   # today: undefined 1; after: 0208:1037114694 2
```

---

### GEO-013b: Organization `foundingDate` / `availableLanguage` need visible copy first

**Impact** Low · **Size** XS · **Owner** client-input · **Evidence** T1 (purpose)

**Finding.** KBO lists the start date as 21 April 2026 (`geo-live.md` §6.1), but no page states a founding date. No page states which languages the company works in; only the kata states its course languages.

**Why it matters.** The repo rule is that the graph says only what the page says (`schema.mjs:9-11`). Both properties are listed in Google's Organization docs.

**Fix.** Once the client approves the copy (§2(c)), print it and add `foundingDate: '2026-04-21'` from the same source.

**Acceptance check.** `grep -o '2026-04-21\|21 april 2026' dist/nl/team/index.html | wc -l` ≥ 1 (today 0), and `Organization.foundingDate` is present.

---

### GEO-014a: Person nodes lack `jobTitle`, though the page already prints the role

**Impact** Low · **Size** XS · **Owner** code · **Evidence** Judgement

**Status after this pass:** folded into GEO-014b (client input). No visible text on the team page states the founders' role; the word is only in the portrait alt text, and CLAUDE.md's rule is that the graph says nothing the page does not. `jobTitle` and the `team.person.role` key were removed again.

**Finding.** `founderNodes()` (`schema.mjs:219-231`) has no `jobTitle`. The team page already prints the role as portrait text: `team.person.axel.portrait` "Axel Segers, oprichter van SmartAgents", and Tom's.

**Why it matters.** It completes each Person node with a fact the page already states. No evidence of a citation effect.

**Fix.** Add a key `team.person.role` ("Oprichter" / "Founder" / "Fondateur") and have `founderNodes()` set `jobTitle: t('team.person.role')`. There is no visible change.

**Acceptance check.**

```sh
node -e 'const g=JSON.parse(require("fs").readFileSync("dist/nl/team/index.html","utf8").match(/application\/ld\+json">(.*?)<\/script>/)[1])["@graph"];console.log(g.filter(n=>n["@type"]==="Person"&&n.jobTitle).length)'   # today 0; after 2
```

---

### GEO-024: `Service.inLanguage` claims the page language as the delivery language

**Impact** Low · **Size** XS · **Owner** code · **Evidence** Judgement

**Status after this pass:** done. `serviceNode()` no longer emits `inLanguage`, and no `availableLanguage` replaces it until a page states which languages the work is done in.

**Finding.** `serviceNode()` sets `inLanguage: lang` (`schema.mjs:147`), so `/fr/formation/` tells a machine the training service is given in French, while the kata states "Néerlandais ou anglais". The file already avoids this trap for `Course` (`schema.mjs:162-165`).

**Why it matters.** It is a small factual error, against the repo's own rule.

**Fix.** Drop `inLanguage` from `serviceNode()`. Optionally read `description` from `<id>.description`.

**Acceptance check.**

```sh
node -e 'const g=JSON.parse(require("fs").readFileSync("dist/fr/formation/index.html","utf8").match(/application\/ld\+json">(.*?)<\/script>/)[1])["@graph"];console.log(g.find(n=>n["@type"]==="Service").inLanguage)'   # today: fr; after: undefined
```

---

### GEO-025: `/favicon.ico` 404s and the only declared icon is SVG

**Impact** Low · **Size** XS · **Owner** code (Track A, whole item) · **Evidence** T1

**Status after this pass:** done. Differs from the Fix: the ICO holds 16, 32 and 48px PNG frames, each entry's bit depth read off its frame (24, RGB). The 16px frame is the mark redrawn for its size: no halo, heavier edges, larger nodes. The script also needed two repairs: its logo extraction no longer matched `base.mjs`, and it stalled on a Chrome that never exits.

**Finding.** `src/layouts/base.mjs` declares only `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`. Live `/favicon.ico` answers `302 → /nl/favicon.ico → 404`.

**Why it matters.** Google's favicon doc (T1, 2026-08-28, verbatim): "Google Search supports the following favicon file formats: BMP, GIF, ICO, PNG, JPEG, PPM, and TIFF". SVG is not listed, and larger than 48x48px is recommended. https://developers.google.com/search/docs/appearance/favicon-in-search

**Fix (Track A):**
- `scripts/make-social-images.mjs` also writes `public/favicon-96.png` and `public/favicon.ico`, drawn from the logo SVG in `base.mjs` (the same source as the 512px mark), with a separately drawn 16px frame.
- Add both to the `required` list in `check-dist.mjs`.
- Add `<link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png">` in `base.mjs`.
- `render.mjs` generates their 200 rules automatically.
- Never turn the catch-all into a 301 (R25).

**Acceptance check.**

```sh
test -e dist/favicon.ico && echo present                                        # today: nothing
grep -o 'rel="icon"[^>]*image/png' dist/nl/index.html | wc -l                  # today 0; after 1
```

---

### GEO-026: Course PDFs are indexable with no canonical header

**Impact** Low · **Size** XS · **Owner** code · **Evidence** T1

**Status after this pass:** done, as in the Fix. The `_headers` comment says it is a signal Google may ignore, since a fiche is not a duplicate of its page.

**Finding.** `/media/SmartAgents_AI_Business_Teams_Onepager.pdf` and `/media/SmartAgents_Agentic_Engineering_Onepager.pdf` have no `X-Robots-Tag` and no `Link` header (`public/_headers:58-59`).

**Why it matters.** Google (T1, 2026-07-10) supports `rel="canonical"` in an HTTP header "for non-HTML documents such as PDF files". A canonical between non-identical documents may be ignored, but it is harmless.

**Fix.** In `public/_headers`:

```
/media/SmartAgents_Agentic_Engineering_Onepager.pdf
  Link: <https://smartagents.be/nl/training/agentic-engineering-kata/>; rel="canonical"
/media/SmartAgents_AI_Business_Teams_Onepager.pdf
  Link: <https://smartagents.be/nl/training/>; rel="canonical"
```

**Acceptance check.**

```sh
grep -o 'rel="canonical"' public/_headers | wc -l                                                               # today 0; after 2
curl -sI https://smartagents.be/media/SmartAgents_Agentic_Engineering_Onepager.pdf | grep -io '^link:' | wc -l  # after deploy: 1
```

---

### GEO-030: Unverified Claude Partner Network claim

**Impact** Low · **Size** XS · **Owner** client-input · **Evidence** Observed (unverified)

**Finding.** One search summary claimed "SmartAgents is part of the Claude Partner Network". `partnerhub.claude.com/directory/` returned 403, and the site says nothing about it (`geo-live.md` §6.1).

**Why it matters.** If true, it is a first-party directory mention (GEO-009). If false, the claim should not spread.

**Fix.** Ask (§2(c)). If yes, confirm the listing links smartagents.be.

**Acceptance check.** The answer is recorded, and if yes the directory URL resolves.

---

### GEO-041a: Kata video has no `VideoObject`; Google requires `uploadDate`

**Impact** Low · **Size** XS · **Owner** code, client-input · **Evidence** T1 · **Status: gated on the §2(c) question**

**Finding.**
- `dist/nl/training/agentic-engineering-kata/`: `<video … poster="/media/kata-agentic-engineering-poster.jpg" aria-label="Rondleiding door de agentic engineering kata van SmartAgents"><source data-src="/media/kata-agentic-engineering.mp4">`, with no `VideoObject`.
- **Honest date:** the file first reached the public site on 2026-08-02. Commit `7387832` ("chore: update training") added `assets/kata-agentic-engineering.mp4` to main, used on `/services/training/developers/` via old `i18n/nl.json:325`. No page, old or new, prints that date.

**Why it matters.** Google's video structured-data doc (T1, verified by critic round 2) lists **`uploadDate`** among the required properties, with `name` and `thumbnailUrl`: "The date and time the video was first published". A node without it buys nothing from Google, and would likely show as invalid in Search Console's video report. Stating a date the page does not print conflicts with the repo rule (`schema.mjs:9-11`), so the owner has to approve it.

**Fix.** Only if the owner approves `2026-08-02`: add a `videoNode()` to `schema.mjs`, called from `kata.mjs`, with
- `name` ← `kata.tour.videoLabel`
- `description` ← `kata.tour.body`
- `thumbnailUrl` ← the poster
- `contentUrl` ← `/media/kata-agentic-engineering.mp4`
- `uploadDate: '2026-08-02'`

Record the approval in the code comment, as `schema.mjs` does for other judgement calls. **If the owner declines, close the item.**

**Acceptance check.**

```sh
grep -o '"@type":"VideoObject"' dist/nl/training/agentic-engineering-kata/index.html | wc -l   # today 0; after approval 1
grep -o '"uploadDate":"2026-08-02"' dist/nl/training/agentic-engineering-kata/index.html | wc -l   # after approval 1
```

---

### GEO-042: `smartagents-website.pages.dev` serves the whole site, indexable

**Impact** Low · **Size** XS · **Owner** code · **Evidence** T1 + Observed

**Status after this pass:** done, both documented lines. The acceptance grep below now counts the rule lines only, because the comment above them also says `pages.dev`.

**Finding.** Re-curled 2026-09-13:

```
curl -D - https://smartagents-website.pages.dev/nl/ -> HTTP/2 200, no x-robots-tag
<link rel="canonical" href="https://smartagents.be/nl/">
https://smartagents-website.pages.dev/robots.txt -> User-agent: * / Allow: /
```

**Why it matters.**
- It is a duplicate host of the whole site; the absolute canonical mitigates it.
- Cloudflare's Pages headers doc (T1, verified raw by critic round 2) documents the fix: "to prevent your `*.pages.dev` and `*.*.pages.dev` URLs from being indexed, add the following to your `_headers` file".
- On matching: "Placeholders match all characters apart from the delimiter, which when part of the host, is a period (`.`)". `:project` is therefore exactly one label, and `smartagents.be` can never match.

**Fix.** Add both documented lines to `public/_headers`:

```
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

Branch previews already get `X-Robots-Tag: noindex` from Pages. The second rule is the documented belt-and-braces.

**Acceptance check.**

```sh
grep -c '^https://.*pages\.dev/\*$' public/_headers                                              # today 0; after 2
curl -sI https://smartagents-website.pages.dev/nl/ | grep -io '^x-robots-tag: noindex' | wc -l  # today 0; after deploy 1
curl -sI https://smartagents.be/nl/ | grep -io '^x-robots-tag' | wc -l                          # must stay 0
```

---

### GEO-043: `WebSite` has no `alternateName` (Google site-name fallback)

**Impact** Low · **Size** XS · **Owner** code · **Evidence** T1

**Status after this pass:** done. Google reads it only from the domain root, which answers 302 to `/nl/` until GEO-011 is settled.

**Finding.** `websiteNode()` (`schema.mjs:101-111`) has `name: 'SmartAgents'` and no `alternateName`. The name is shared with at least six other companies (GEO-006).

**Why it matters.** Google's site-names doc (T1, 2025-12-10): "Providing an alternative name using the `alternateName` property allows Google to consider other options if your preferred choice isn't selected", and for a lowercase domain, "Our system will strongly consider using it". https://developers.google.com/search/docs/appearance/site-names . `WebSite` must be on the home page; see the root decision in GEO-011.

**Fix.** In `websiteNode()`: `alternateName: ['smartagents.be']`. The domain is printed on every page.

**Acceptance check.**

```sh
node -e 'const g=JSON.parse(require("fs").readFileSync("dist/nl/index.html","utf8").match(/application\/ld\+json">(.*?)<\/script>/)[1])["@graph"];console.log(g.find(n=>n["@type"]==="WebSite").alternateName)'   # today undefined; after [ 'smartagents.be' ]
```

---

### GEO-031: `/xx/404/` answers 200, and every language gets the Dutch 404

**Impact** Low · **Size** S · **Owner** code · **Evidence** T1 + Observed · **Status: deferred from this pass**

**Finding.**
- `/nl/404/` answers **200** with `noindex`, and `/nl/404` answers 308 → 200. The page is a real file at `dist/nl/404/index.html`.
- Only `dist/404.html`, the Dutch copy (`render.mjs:162-165`), serves unmatched URLs, so `/en/whatever/` shows Dutch.

**Why it matters.** It is a soft 404 on an unlinked, noindexed URL, so the effect is minor. The per-language page is mostly a user-experience gain.

**Why deferred.** Critic round 2 showed the planned change fails `check-dist` and spans both tracks, for a Low item:
- The 404 pages link `/xx/404/` in their canonical, their hreflang alternates, and twice in the language switcher (`href="/en/404/"`). Removing `{lang}/404/index.html` fails the "broken internal link" check at `scripts/check-dist.mjs:265`.
- `isNotFound` (`check-dist.mjs:84`) matches only `404/index.html` or the root `404.html`. `nl/404.html` would count as a public page, and the robots assertion (`:443-446`) would demand `index, follow` on a noindex page.
- `check-dist.mjs:557` requires `{lang}/404/index.html`.
- Fixing the switcher, alternates and canonical touches `src/layouts/base.mjs` and `src/pages/not-found.mjs`, plus `build/render.mjs:162-165`.
- `CLAUDE.md:839` ("A URL that matches no page gets a real 404 now") documents the current copy.

**Fix, when picked up (one track, all files together):**
1. Write `dist/{nl,en,fr}/404.html` instead of `dist/{lang}/404/index.html`, relying on Pages' "closest 404 page" lookup (T1, https://developers.cloudflare.com/pages/configuration/serving-pages/).
2. Keep `dist/404.html`.
3. Update the 404 page's canonical, alternates and switcher links in `base.mjs` / `not-found.mjs`.
4. Update `isNotFound` (`:84`), `:557` and the CLAUDE.md bullet at `:839`.
5. **Preview check first:** Pages serves extension-less forms, so `dist/nl/404.html` may answer `/nl/404` with a 200. If it does, close the item.

**Acceptance check (when picked up).**

```sh
test -e dist/en/404.html && echo present                                                           # today: nothing
curl -s -o /dev/null -w '%{http_code}\n' https://<preview>.smartagents-website.pages.dev/nl/404/    # want 404 (today 200 on production)
```

---

### GEO-032: "AI voor business teams" has no `Course` node

**Impact** Low · **Size** S · **Owner** code · **Evidence** Judgement; T3 null

**Status after this pass:** done. The kata `Course` carries no `audience`: the kata page prints no audience line, so the graph cannot state one.

**Finding.** Only the kata emits a `Course` (`schema.mjs:175-193`). For the business course the page prints `training.course.business.title`, `.body`, `.audience` ("Teams die met AI werken, geen voorkennis nodig"), `.group` ("5 tot 20 deelnemers"), `.tools` and `.learn.1-4`. It prints no duration, mode or delivery language.

**Why it matters.** Schema completeness only. Optional.

**Fix (Track B, `schema.mjs` + `training.mjs`).** Give `courseNode()` optional `facts`, so a course that states less emits less, and let `teaches` take plain strings. On the training page, emit a `Course` for the business course with:
- `name` and `description`
- `teaches` from `learn.1-4`
- `audience: { '@type': 'Audience', audienceType: t('training.course.business.audience') }`
- a `CourseInstance` with only `minimumAttendeeCapacity: 5` and `maximumAttendeeCapacity: 20`

Reference both courses from the training `Service` (`hasOfferCatalog` → `OfferCatalog` → `itemListElement` of `{ '@id' }`). No `offers`, `instructor`, `courseMode`, `courseWorkload` or `inLanguage`.

**Acceptance check.**

```sh
grep -o '"@type":"Course"' dist/nl/training/index.html | wc -l    # today 0; after 1 (plus a reference to the kata's #course)
```

---

### GEO-033: "Hello AI era" has no body subheadings; no article cites a source

**Impact** Low · **Size** S · **Owner** client-input · **Evidence** T1 (Microsoft); T2 mixed

**Finding.**
- The body of `dist/nl/inzichten/hello-ai-era/` has **0** `h2` (measured inside `article__main`); "Wat werkt en wat niet" has 4.
- The four bodies link only `#contact` and `insight:launch`, with no outbound sources.
- The bodies are the client's verbatim port (CLAUDE.md).

**Why it matters.**
- Microsoft (T1): clear headings, and "Support claims with evidence".
- The GEO paper (T2, simulated) measured +29% for "Cite Sources".
- C-SEO Bench (T2) found rewrites largely ineffective.

**Fix.** With the client's sources and consent (§2(c)), add `[label](href)` links using the site's external-link treatment, and one or two `h2` blocks to the launch piece.

**Acceptance check.**

```sh
node -e 'const h=require("fs").readFileSync("dist/nl/inzichten/hello-ai-era/index.html","utf8");const m=h.slice(h.indexOf("article__main"),h.indexOf("article__rail"));console.log((m.match(/<h2/g)||[]).length)'   # today 0; after >= 1
```

---

### GEO-034: No in-body contextual links between services, articles and team

**Impact** Low · **Size** S · **Owner** client-input, code · **Evidence** Judgement

**Finding.** The header nav and footer already link every service, team, jobs and insights from every page. Inside `<main>`, the kata page has **0** links to `/nl/ai-native-sdlc/` (2 in the whole document) and the launch article has 0 links to `/nl/team/`. The gap is in-body, contextual links.

**Why it matters.** A contextual link tells a reader and a crawler that two pages are about the same thing. The effect is plausible but unmeasured.

**Fix.** With the client's wording (§2(c)):
- kata ↔ SDLC
- "Wat werkt en wat niet" → processes
- Aviso article → training
- launch article → team (pairs with GEO-015)

Use `insight:<key>`, `servicePath()` and `kataPath()`.

**Acceptance check.**

```sh
node -e 'const h=require("fs").readFileSync("dist/nl/training/agentic-engineering-kata/index.html","utf8");const m=h.slice(h.indexOf("<main"),h.indexOf("</main>"));console.log((m.match(/href="\/nl\/ai-native-sdlc\/"/g)||[]).length)'   # today 0; after >= 1
```

Critic disagreed / kept because: round 1 proposed `sed -n '/<main/,/<\/main>/p'`, which prints the whole one-line document. Replaced with a `<main>` slice; round 2 judged the writer right.

---

### GEO-037: No lead self-attribution

**Impact** Low · **Size** S · **Owner** client-input, code · **Evidence** Judgement

**Finding.** The contact form has name, email, company and message fields. Nothing records how a lead found the company, and there are no analytics by policy.

**Why it matters.** It is the only way to measure rubric dimension F.

**Fix.** Client choice (§2(c)): ask in the intake call (no code), or add an optional "Hoe vond je ons?" field. A field means also updating `validatePayload` (`functions/api/contact.js`) and the privacy notice's contact-form clause; `scripts/check-contact.mjs` verifies both halves.

**Acceptance check.** Intake notes or the n8n payload carry an attribution value for new leads.

---

### GEO-039: No Wikidata item

**Impact** Low · **Size** S · **Owner** off-site · **Evidence** T4 only

**Finding.** There is no Wikidata item (`geo-live.md` §6.1).

**Why it matters.**
- The benefit is "unverified; opinion only" (`geo-research.md` §6).
- Notability is borderline for a company founded in 2026.
- Wikidata discourages creating items about your own organisation (conflict of interest).

**Fix.** Optional. Only after GEO-006 and GEO-009 have produced at least two independent references, and preferably created by an independent editor. Then add it to `Organization.sameAs`.

**Acceptance check.** The item exists, survives 30 days, and is in `sameAs`.

---

### GEO-040: "SmartSpace" is named with no current page, and collides with smartspace.ai

**Impact** Low · **Size** S · **Owner** client-input · **Evidence** Observed

**Finding.**
- SmartSpace has an article (`/nl/inzichten/smartspace/`, beta May 2026). The old `/products/smartspace/` URLs are indexed (`geo-live.md` §7.1), and GEO-003 redirects them to the article.
- smartspace.ai is an enterprise gen-AI platform on Azure Marketplace (§6.3).
- SmartScan is explained where it is named (`processes.phase.01.body`) and is not a fault.

**Why it matters.** An engine asked about "SmartSpace" is more likely to describe the other product, and the site does not say whether the product still exists.

**Fix.** Ask (§2(c)). If SmartSpace is still offered, write "SmartSpace van SmartAgents" on first mention. If it is retired, add a dated note to the article.

**Acceptance check.** The decision is recorded.

---

### GEO-016: No IndexNow on deploy

**Impact** Low · **Size** M · **Owner** code, dashboard · **Evidence** T1 · **Status: deferred from this pass**

**Finding.** There is no IndexNow key file in `dist/`. Deploys happen on every merge and every Odoo vacancy change.

**Why it matters.**
- Bing (T1, July 2025): "combining sitemaps… with IndexNow for fast, URL-level submission".
- IndexNow (T1): submit URLs "as soon as the content is added, updated, or deleted".
- Google does not participate. With 42 URLs and a one-off BWT submission in GEO-005, the gain is small.

**Fix, later.**
- Not Crawler Hints: it "uses cache-status MISS to determine when content has likely been updated", and Pages HTML answers `cf-cache-status: DYNAMIC`.
- Commit `public/<key>.txt`, and add a Pages deployment-success notification → webhook (n8n or a small Worker) that POSTs changed URLs to `https://api.indexnow.org/indexnow`. That the notification exists on this plan is not verified.
- The changed-URL source depends on GEO-019's manifest, which is also deferred. Never ping from `npm run build`.

**Acceptance check.** BWT → IndexNow shows URLs received within an hour of a deploy.

---

### GEO-019: Honest `lastmod` for 27 of 42 sitemap URLs, plus a `dateModified` path (merges GEO-028)

**Impact** Low · **Size** M · **Owner** code · **Evidence** T1 · **Status: deferred from this pass (both halves)**

**Finding.**
- `render.mjs:167-173` sets `lastmod` only from `meta.lastmod`: the four articles (`published`) and privacy (`UPDATED`). That is 15 of 42 URLs.
- The SDLC page changed on 2026-09-12 and 09-13 (`c6500ee`, `614051d`), and the sitemap says nothing.
- `articleNode` sets `dateModified: published` (`schema.mjs:209`), which is honest today, but no path exists for an edit.

**Why it matters.**
- Google (T1): lastmod is used "if it's consistently and verifiably… accurate", and it is optional. https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Bing (T1, July 2025): "a key signal, helping Bing prioritize URLs for recrawling".
- A 42-URL site gains little.

**Why deferred.**
- A hash check that **fails locally** would break `npm run dev`'s save-and-rebuild loop on every copy edit until someone runs a stamp script.
- A **warn-only** check lets manifest dates go stale. Because Google trusts lastmod only when it is consistently accurate, stale dates put at risk the 15 honest dates the sitemap has today.
- Neither is worth it for a Low item this pass.

**Fix, for when it is picked up** (critic round 2's design):
1. **`scripts/stamp-lastmod.mjs`**, run locally and committed like `sync:jobs`:
   - It hashes each page's `<main>` text plus its page-specific JSON-LD, and writes `src/content/lastmod.json` as `{ url: { hash, date } }`.
   - It re-dates only on a hash change.
   - It excludes the jobs page, which renders live Odoo data at build (`render.mjs:534`). Use the vacancy's Odoo `write_date` if `build/lib/odoo-jobs.mjs` can read it (not verified), otherwise no lastmod.
   - It excludes environment-dependent markup: the contact form differs with `TURNSTILE_SITE_KEY`.
2. **`render.mjs`** reads the manifest into `meta.lastmod` where a page sets none.
3. **The `check-dist.mjs` hash check** fails locally, and warns only when `process.env.CF_PAGES === '1'`, which Pages injects into every build. An Odoo-triggered deploy never fails, and a local copy edit cannot land without a re-stamp. The `npm run dev` watch loop needs its own escape (for example `ODOO_OFFLINE=1`-style `LASTMOD_WARN=1`, set by `scripts/start-local.mjs --watch`) so a save still rebuilds.
4. **Ordering:** the first `stamp:lastmod` run must happen **after** this pass's schema changes (GEO-013a, GEO-024, GEO-032, GEO-043) have merged, because they change page JSON-LD on many pages.
5. **Articles (was GEO-028):** an optional hand-set `modified` on `INSIGHTS` entries feeds `articleNode.dateModified`, `ctx.article.modified` and `meta.lastmod`. A visible "Bijgewerkt op" `<time>` needs a new i18n key in three languages and an `id` (element-ids skill). Add it only when an article is actually modified.
6. **CLAUDE.md:** update the bullet "`sitemap.xml` prints `lastmod` only where a page knows one" (`CLAUDE.md:727`).
7. Never use git dates (shared `nl.json`) or the build clock.

**Acceptance check (when picked up).**

```sh
grep -o '<lastmod>' dist/sitemap.xml | wc -l    # today 15; after >= 39
```

A string change without re-stamping fails `npm run build` locally, and only warns with `CF_PAGES=1 npm run build`.

---

### GEO-020: No answer-first definitional passages on service pages

**Impact** Low · **Size** M · **Owner** client-input · **Evidence** T1 (Microsoft); T2 null

**Finding.** No sentence defines "AI-native SDLC", "agentic engineering" or "kata" in quotable form (`geo-inventory.md` §4). `sdlc.description` and `sdlc.journey.lede` half-define the SDLC; `kata.tour.body` comes closest for the kata.

**Why it matters.**
- Microsoft (T1) favours "Concise answers".
- Google (T1): "no requirement to break your content into tiny pieces for AI".
- C-SEO Bench (T2): rewrites largely ineffective. Hence Low.

**Fix.** With the client's definitions (§2(c)), make them the first sentence of the first section's lede under the hero. No FAQ block, no announced counts.

**Acceptance check.** A reviewer confirms each service page's first section opens with a sentence of 50 words or fewer that defines the term.

---

### GEO-041b: Kata video has no transcript or captions; not on YouTube

**Impact** Low · **Size** M · **Owner** client-input, off-site · **Evidence** T1 generic, T3

**Finding.** The video has no `<track>` and no transcript (`geo-inventory.md` §4). It is not on YouTube.

**Why it matters.**
- Microsoft (T1): never put key information only in media.
- Ahrefs (T3): YouTube is "the most-cited domain in AI Overviews today" (5.6%).

**Fix.** Needs to know whether the video has narration (§2(c)).
- With speech: WebVTT `<track kind="captions">` per language, and a transcript as HTML.
- Without speech: nothing more is needed; `kata.tour.body` describes the kata.
- If agreed, upload a copy to YouTube, linking back.

**Acceptance check.** `grep -o '<track' dist/nl/training/agentic-engineering-kata/index.html | wc -l` ≥ 1 where narration exists (today 0).

---

## 4. Hygiene (not GEO; not counted)

### GEO-029: Leftover GitHub Pages `CNAME` file is published

**Size** XS · **Owner** code · **Status:** this pass (Track A)

**Status after this pass:** done. `public/CNAME` is deleted, and nothing in the repo read it.

- `public/CNAME` ships as `dist/CNAME` with a generated 200 rule, carried over from the old site (`.eleventy.js:295`). No GEO effect.
- **Fix:** delete `public/CNAME`.
- **Check:** `test -e dist/CNAME && echo still-there` prints nothing (today it prints).

### GEO-036: Article share images below 1200px; no `max-image-preview:large`

**Size** S · **Owner** code, client-input · **Status:** deferred

- Article `og:image` is 760x428, and "Hello AI era" is 480x270 (`insights.mjs:289-294`).
- `max-image-preview:large` governs large previews (Discover); `check-dist.mjs:445` asserts the exact robots string.
- **Fix, later:** a source image of at least 1200px for the launch article; `base.mjs:144` plus `check-dist.mjs:445` together.
- **Check:** `grep -o 'max-image-preview:large' dist/nl/index.html | wc -l` goes from 0 to 1.

### GEO-041c: The kata poster names a language

**Size** S · **Owner** client-input

- The poster reads "on a real Java codebase", a known exception in CLAUDE.md.
- Re-render when the deck asset is next touched.

---

## 5. Already in place

Verified. Do not re-propose these.

- **Pre-rendered HTML.** All copy, `<details>` content and SDLC diagram labels are in the initial HTML; web components are light-DOM upgrades.
- **Robots meta.** `index, follow` on public pages and `noindex` on 404 and `/secured/`, enforced by `check-dist.mjs:442-449`. No snippet restrictions on current public pages.
- **Canonical and hreflang.** Self-canonical, reciprocal hreflang plus `x-default`, enforced by `check-dist.mjs:462-473`. All 15 templates exist in all 3 languages.
- **Origin robots.txt.** Allows every search and retrieval agent, blocks only `/secured/`, names the sitemap.
- **No UA-string blocking.** Observed for 17 UAs.
- **Sitemap.** 42 URLs with alternates, and `lastmod` only where honest.
- **Redirects.**
  - `http→https` and `www→apex` are 301. Trailing-slash normalisation is 308. Canonical page URLs have no chain.
  - Exceptions: `http://www` takes 3 hops (GEO-011), and slashless unprefixed URLs take 2.
- **`/secured/`.** Behind a password Function, with `X-Robots-Tag: noindex` via `_headers` and a robots.txt disallow. The Function's own 302 does not pass through `_headers`. At most an externally linked `/pitch` could be indexed URL-only, which is negligible.
- **Real 404 status** for unmatched URLs.
- **One valid JSON-LD graph per page:** Organization, WebSite, four Services, kata `Course`, BlogPosting (dates matching the visible `<time>`), Blog, Person, BreadcrumbList.
- **Legal identity** printed in the footer.
- **Head metadata.** Unique titles and descriptions within each language, `og:*`, a 1200x630 default card.
- **The kata page:** 732 net words of specific course facts.
- **One outbound first-party source** (SDLC page).
- **Alt text** enforced by check-dist.
- **Performance budget:** largest page 11,630 B brotli.
- **`llms.txt`** generated from the same modules (R1).
- **Documented decisions upheld:** no `JobPosting`, no FAQ block, no build-clock `lastmod`, no analytics or third-party requests.

**Checked and not an issue:**
- Rocket Loader and Auto Minify: no markers.
- Email Obfuscation does not touch JSON-LD.
- The service worker is irrelevant to crawlers.
- Heading hierarchy is enforced by check-dist.
- Person `@id`s are origin-level, and cross-document `founder` references are valid linked data.
- Every stale HTML 200 is `x-robots-tag: noindex`.
- The four blog posts deleted in June are pre-existing 404s, not a regression (GEO-003).

---

## 6. Considered and rejected

| # | Proposal | Why rejected | Source |
|---|---|---|---|
| R1 | English/French `llms.txt`, `llms-full.txt`, Markdown mirrors, a `Link:` header to `llms.txt` | No engine documents consuming it. Google: "will neither harm nor help"; Ahrefs: "97% of those files received zero traffic". Keep the existing file. | T1; T3 |
| R2 | Reintroduce an FAQ block or `FAQPage` | FAQ rich results stopped 2026-05-07; CLAUDE.md removed the block. | T1 via SEJ |
| R3 | "AI schema": `speakable`, `WebPage`/`AboutPage`, `articleBody`, `wordCount`, `translationOfWork`, `disambiguatingDescription` without visible text | Google: "no special schema.org markup you need to add"; Ahrefs found no uplift. Against the repo rule. | T1; T3 |
| R4 | `Course.offers`, `instructor` or `courseMode` the page does not print | Course Info rich result retired 2025-06-12; no price or instructor on the page. | T1 |
| R5 | GEO rewrites for "+40% visibility" | Simulated engine; C-SEO Bench: "largely ineffective". | T2 |
| R6 | Blocking Google-Extended to leave AI Overviews, or GPTBot to leave ChatGPT search | Wrong levers; search agents are separate UAs. | T1 |
| R7 | Build-clock or git-date `lastmod`, bumping article dates | Google needs "verifiably accurate" dates. | T1 |
| R8 | `max-snippet:-1`, `max-video-preview:-1` | These restate Google's defaults. | T1 |
| R9 | `twitter:title`, `twitter:description`, `twitter:image` | X falls back to `og:*`. | Judgement |
| R10 | `og:locale` `en_US` → a Belgian English locale | Social previews only. | Judgement |
| R11 | Region hreflang (`nl-BE`, `fr-BE`) | One version per language; narrows targeting. | Judgement |
| R12 | `x-default` in `sitemap.xml` | HTML already carries it. | Judgement |
| R13 | Treat identical NL/EN titles as duplicate content | hreflang disambiguates; "Training"/"Team"/"Jobs" are correct Dutch. | Judgement |
| R14 | Cloudflare Markdown for Agents | Pro plan and above; adds `ai-train=yes` by default; no citation evidence. | T1 |
| R15 | `JobPosting` on the jobs page | The repo's stated reason (`src/pages/jobs.mjs:43-48`): Google's requires `datePosted` and `validThrough`, which the page does not print, and Odoo publishes each posting. Not re-verified here. | Repo decision |
| R16 | `@type` `ProfessionalService` / `LocalBusiness` | Implies a place customers visit and opening hours the site does not state. | Judgement |
| R17 | AI "rank position" tracking, vendor "GEO scores" | Not reproducible; only rates over runs are defensible. | T3; T1 |
| R18 | A Wikipedia article | Unrealistic notability. | `geo-research.md` §6 |
| R19 | Content-Signal or managed robots.txt as protection | "express preferences; they are not technical countermeasures". | T1 |
| R20 | Seeding or buying mentions | Google: inauthentic mentions don't help. | T1 |
| R21 | "Chunking" pages for AI | Google: "no requirement". | T1 |
| R22 | Analytics (GA4 "AI Assistant" channel) | Excluded by policy; the channel also omits Perplexity and Claude. | T1 |
| R23 | `telephone` in E.164 | schema.org text; matches the footer; no effect. | Judgement |
| R24 | Image or video sitemaps | Few images, all in page HTML; the video is covered by GEO-041a. | Judgement |
| R25 | Catch-all `/*` 302 → 301 | Browsers cache a 301 for every unprefixed path, and `/favicon.ico` (GEO-025) and an IndexNow key file currently fall to the catch-all. Once GEO-003's explicit rules exist, the catch-all only catches junk. | Critic round 1 |
| R26 | GEO-027: move the `→` cue out of row headings | Only in row lists; article `<h1>` clean; CLAUDE.md makes the arrow the cue. | CLAUDE.md |
| R27 | GEO-035: put the "Past wanneer" fit line in the staffing `<summary>` | Contradicts CLAUDE.md ("'Past wanneer' ends it"; the tag-row rule). Google gives collapsed-for-UX content full weight (T1b), and all rows are in the HTML. | CLAUDE.md; T1b |
| R28 | GEO-038: an Atom feed for Inzichten | Marginal; all 12 article URLs are in the sitemap. Park until GEO-023 produces a cadence. | Judgement |
| R29 | Reviving "Case: Claes Logistics bespaart 200 uur per maand" as proof | Deleted from the old site within days (`5fe67fb`) and unconfirmed. Only with the client's confirmation of a real engagement (GEO-008). | Git history |

---

## 7. Scoring (rubric from `geo-research.md` (d))

Each sub-item scores 0-2, with halves where partly met. Confidence classes:
- **M:** measured.
- **S:** sampled.
- **I:** judgement.
- **n/s:** not scorable yet.

Ranges run from the minimum to the maximum once unknowns resolve. Re-checked against revision 3; the round-2 changes (deferrals, gating, title rework, corrected quotes) change no sub-score, because they alter the plan, not today's site.

### A. Crawl and access (weight 25)

| # | Sub-item | Score | Class | Basis |
|---|---|---|---|---|
| A1 | Search and user agents allowed in the effective robots.txt | 2 | M | None is in the managed Disallow block, and the origin allows all |
| A2 | Cloudflare AI-bot settings block neither Search nor Training-with-Search | n/s (0-2) | — | Dashboard (GEO-001). After 2026-09-15, a legacy block would score 0 |
| A3 | One consistent training policy | 0 | M | Eight bots with opposite groups (GEO-004) |
| A4 | No snippet restrictions on public content | 2 | M | None on current pages |
| A5 | Content in the initial HTML | 2 | M | All copy present; email rewriting leaves JSON-LD intact (critic: 1.5 also defensible) |
| A6 | Low 404/redirect rate for **bot hits** | n/s (0-2) | — | Needs crawler logs (GEO-001 step 4). The URL sweep measures URLs, not bot hits |
| A7 | Sitemap with honest lastmod | 1 | M | Honest, on 15 of 42 URLs. GEO-019 is deferred, so this stays at 1 after this pass |

Raw 7 of 10 scorable, and 7-11 of 14 in total. **A = 12.5-19.6 / 25.**

### B. Index and first-party AI visibility (weight 20)

| # | Sub-item | Score | Class | Basis |
|---|---|---|---|---|
| B1 | GSC and BWT verified | n/s (0-2) | — | GEO-005, hours |
| B2 | Search generative AI control = Include | n/s (0-2) | — | GEO-005, hours |
| B3 | Indexed-page coverage per language | 0 | S (weak) | No redesign URL in `site:` results via a search tool, on launch day |
| B4 | GSC AI impressions trend | n/s (0-2) | — | Weeks of data after GEO-005 |
| B5 | BWT citations and grounding queries | n/s (0-2) | — | Weeks of data after GEO-005 |
| B6 | IndexNow on deploy | 0 | M | No key file; GEO-016 deferred |

Raw 0 of 4 scorable, and 0-8 of 12 in total. **B = 0-13.3 / 20.**

### C. Sampled AI share of voice (weight 25)

**Not scored.** No prompt panel has been run (GEO-021).

### D. Entity and earned media (weight 15)

| # | Sub-item | Score | Class | Basis |
|---|---|---|---|---|
| D1 | NAP and legal identity consistent (site, schema, KBO, GBP, LinkedIn) | 1 | M | Consistent on the site and in the graph. KBO web field empty; LinkedIn "Smartagents.be"; no GBP; a Kortessem address in the old graph and llms.txt until today (GEO-006) |
| D2 | `sameAs` targets exist and resolve | 1 | M | One target, which resolves |
| D3 | Authentic third-party pages | 0.5 | I | About four, two with the old positioning |
| D4 | Schema valid and matching visible text | 1.5 | M/I | Valid on all 45 pages; deductions for `Service.inLanguage` (GEO-024) and Organization authorship of the founders' launch piece (GEO-015) |

Raw 4 of 8. **D = 7.5 / 15.**

### E. Content quality signals (weight 10), judgement

| # | Sub-item | Score | Basis |
|---|---|---|---|
| E1 | Non-commodity, first-hand specifics | 1 | Kata specific; other pages thin, no proof (GEO-008) |
| E2 | Named authors with credentials | 0.5 | Team page names both founders with a credential line; articles have no byline |
| E3 | Honest visible dates | 2 | Article dates visible and matching |
| E4 | Sourced statistics and quotes where genuine | 0.5 | One outbound source site-wide |
| E5 | Essential answers not locked in PDFs, media or collapsed-only UI | 1.5 | PDF facts mirrored; accordion in HTML (R27); video without transcript (GEO-041b) |
| E6 | Clear, descriptive headings | 1.5 | Good outlines; slogan H1 (GEO-007b); launch piece with no body h2 (GEO-033) |

Raw 7 of 12. **E = 5.8 / 10.**

### F. Outcomes (weight 5)

**Not scored.** No lead attribution (GEO-037), no GSC/BWT data yet, no analytics by policy.

### Total

| Dimension | Weight | Score today |
|---|---|---|
| A Crawl and access | 25 | 12.5-19.6 |
| B Index and first-party AI visibility | 20 | 0-13.3 |
| C Sampled share of voice | 25 | not scored |
| D Entity and earned media | 15 | 7.5 |
| E Content quality | 10 | 5.8 |
| F Outcomes | 5 | not scored |
| **Scorable** | **70** | **25.8-46.2** |

**What resolves the unknowns, and when:**
- A2, B1 and B2: the GEO-001 and GEO-005 dashboard visits, within hours.
- A6: a month of crawler logs.
- B4 and B5: weeks of GSC and BWT data.
- C and F: GEO-021 and GEO-037.

**Expected movement from this pass's code** (after deploy, not scored until then):
- A5 stays 2.
- D2 rises to 1.5-2: KBO `sameAs` (GEO-013a) plus `WebSite.alternateName` (GEO-043).
- D4 rises to 2 once GEO-024 lands and GEO-015 is answered.
- E6 is unchanged until GEO-007b and GEO-033 are answered.
