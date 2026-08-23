# Invoicely — Product & Engineering Plan

**Last updated:** 2026-08-23
**Owner:** codebylalit

> **Why this file exists.** A phased plan was worked out in a session on 2026-08-22 and lost, because it
> only ever existed in a conversation. Phase 0 was recoverable only from the header comments of two
> migration files; Phases 1–5 were gone. This document is the durable record. **Keep it updated in the
> same commit as the work it describes.**

---

## Table of contents

1. [Strategy](#1-strategy)
2. [Current state of truth](#2-current-state-of-truth)
3. [Open decisions](#3-open-decisions)
4. [Phase 0 — Clear the deck](#phase-0--clear-the-deck)
5. [Phase 1 — The Gate](#phase-1--the-gate)
6. [Phase 2 — The Chase](#phase-2--the-chase)
7. [Phase 3 — Truth surfaces](#phase-3--truth-surfaces)
8. [Phase 4 — Cash, habit, and repricing](#phase-4--cash-habit-and-repricing)
9. [Phase 5 — Moat](#phase-5--moat)
10. [UI/UX track](#uiux-track-runs-alongside)
11. [Appendix A — Bug inventory](#appendix-a--bug-inventory)
12. [Appendix B — Marketing claims to fix](#appendix-b--marketing-claims-to-fix)

---

## 1. Strategy

### Positioning

> **Invoicely sends your invoice, then chases it until it's paid — so you never have to ask twice.**

**Invoicely is the collections layer for people who don't have a finance team.**

### The reasoning

Making an invoice takes three minutes and is a solved, free commodity. Zoho Invoice is free and
unlimited forever; Wave is free; there are thousands of free generators competing for the exact
keywords our SEO pages target. **"Free invoice generator" is a traffic strategy, not a business.**

Our own free tier proves it: unlimited invoices, unlimited email, PDF, pay page. That isn't generous
pricing — it's a confession that there is nothing else to sell, because the product ends the moment
the invoice leaves.

The opportunity is the 45 days *after*. And there are two distinct pains there:

- **Operational** — *I forgot to follow up.* Solved by reminders. Every incumbent has them. Commodity.
  Building only this makes us table-stakes, not differentiated.
- **Emotional** — *I don't want to nag my client. I don't know if they're ignoring me or just slow.
  I don't know if I should be worried yet. I don't know how to word it without sounding desperate.*

Nobody solves the second, because it requires knowing what's normal **for this specific client** and
**writing the message so the user doesn't have to find the words**. This is also why reminder features
go unused where they exist — a robotic "Payment Reminder: Invoice #1043 is overdue" feels worse than
saying nothing.

### Target customer

Indian freelancers, solo consultants, and 2–10 person agencies billing ₹50k–₹10L/month across 3–20
recurring **B2B** clients.

Specifically B2B, because companies pay late *procedurally*, not maliciously — which makes lateness
predictable, and predictability is what makes this product work.

Expand to global solo B2B once the loop is proven. See [Open decisions](#3-open-decisions).

### USP

The only invoicing tool that knows how *your* clients actually behave and acts on it for you —
chasing in your voice, escalating on its own, and stopping the moment you're paid.

### Killer feature — The Chase

An escalating, tone-graded follow-up ladder that runs on autopilot, writes every message, and
terminates itself on payment via the client's own one-tap confirmation.

Chosen over the cash forecast deliberately: **the forecast is information; the chase is action.**
Information gets looked at once. Action gets paid for. And the chase generates the payment-timing
data that makes the forecast good later. Order matters.

### Three supporting features

1. **Payment Timeline** — per-invoice spine: sent → opened → reminded → promised → paid.
2. **Client Payment Scorecard** — days-to-pay and reliability, from the user's own history.
3. **Expected Cash (30/60/90)** — forecast weighted by each client's real observed behavior.

These are not a grab bag. Each is a different view of one dataset — *when money actually arrives*.
The timeline is one invoice, the scorecard is one client, the forecast is the whole business.

### Where AI belongs — and where it does not

**Belongs:** composing the awkward message. Right tone, right escalation, references real history,
sounds like a human who wants to keep the relationship. The value is removing **emotional labour**,
not keystrokes.

**Does not belong:** generating invoices from a prompt. That page was already deleted for honest
reasons (`src/App.tsx:187-191` — *"This page sold an AI invoice generator that does not exist."*).
Typing a prompt is not faster than filling a form you have filled before. Do not resurrect it.

### Why users pay

> ₹499/month. If Invoicely gets one ₹50,000 invoice paid two weeks sooner, it paid for itself for a year.

### The new free/paid line

| | Free | Pro |
|---|---|---|
| Create & send unlimited invoices | ✓ | ✓ |
| PDF, pay page, client list | ✓ | ✓ |
| **The Chase** | — | ✓ |
| **Payment Timeline** | — | ✓ |
| **Scorecards & Expected Cash** | — | ✓ |

**Free makes documents. Paid gets you paid.**

Keep the generator free and unlimited — it is the acquisition engine and the SEO already ranks for it.

**Retire the watermark as the conversion lever.** It is user-hostile, it is absent from the public pay
page anyway (so it does not even work), and it prints our brand on our customer's client-facing
document. Automation is a stronger gate and one users feel good about paying for.

### What we will NOT build

Say no to all of it. Each has a well-funded incumbent doing it for free, and none is a reason to
choose us.

| Rejected | Why |
|---|---|
| Accounting, expenses, time tracking, payroll, GST filing, inventory | Zoho does it better, free, with 200 people. Every hour here is an hour not spent on what they don't do. |
| More templates | We have 20 and the picker renders text cards because `/templates/*.png` doesn't exist. Template count is not why anyone pays. |
| AI invoice generation from a prompt | Already deleted for good reason. Pure gimmick. |
| Invoice financing / factoring | Regulated, capital-intensive, changes what the company is. |
| WhatsApp **at launch** | Genuinely valuable in India, currently vapor. Needs BSP + template approval, and templated messages can't carry the tone-graded copy that makes the chase work. Revisit in Phase 5. |
| Multi-currency with FX | We have one unused account default and the builder hardcodes `$` in a ₹ product. Fix the contradiction; don't build a currency engine. |
| Mobile app, team seats, AI chatbot, projects, e-signatures | Premature. |

---

## 2. Current state of truth

Established by a five-thread codebase audit on 2026-08-23. **This section is what the product actually
is, not what it claims.** Re-verify before trusting any line older than a few weeks.

### What Invoicely is today, honestly

A single-user, India-first invoice **document generator**: sign in, fill a form, pick one of 20
templates, export a PDF, email it with the PDF attached, or share a public pay page — where "pay" is a
link out to the seller's own Razorpay/Stripe/UPI account, because **Invoicely never touches money and
cannot detect payment.**

Around that core sit a real client directory, a stats dashboard, race-safe server-side invoice
numbering, working entitlement gating, lifecycle emails, and a large admin panel.

### The three structural blockers

1. **There is no scheduler.** No `pg_cron`, no Vercel cron, no GitHub Actions.
   `generate-recurring-invoices` runs *only* when an admin clicks a button in `AdminFeatures.tsx:272`.
   **Recurring invoicing does not recur.** Its overdue branch is dead anyway: it queries
   `profiles.eq('id', inv.user_id)` when the PK is `user_id`, so the query errors, `ownerEmail` is
   null, and `continue` fires **before** the status update. **No invoice has ever been marked overdue.
   No overdue email has ever been sent.**
2. **There is no `paid_at`.** Nowhere in any migration. *When* an invoice was paid is unrecoverable —
   only that it currently says `paid`. Every scorecard, forecast, and days-to-pay metric is blocked on
   this one nullable column.
3. **`invoices.client_id` exists as an FK and is never populated.** Every per-client metric joins on
   the mutable `client_name` *string*, held together by a rename-cascade at `Clients.tsx:206-210`.

### The asset nobody is using

`email_logs` is the richest untouched dataset in the system. Every `invoice_sent` row carries
`idempotency_key = invoice_sent_{invoiceId}_{userId}` with a `created_at` — **a de-facto "invoice was
sent on date D" timestamp for every invoice ever emailed, recoverable with zero migrations.** Combined
with `due_date`, that is enough to backfill real payment behavior for existing users.

### Monetization reality

- **Pro is a lifetime licence sold as a subscription.** No webhook exists for any provider. Razorpay
  creates a one-time *order*, not a Subscription — no `plan_id`, no mandate. `useEntitlements` never
  reads `subscription_end_date`, and no cron downgrades anyone. **One ₹499 payment buys Pro forever.**
- **Any user can self-upgrade.** `20260812140000_auto_create_profile_trigger.sql:36-38` grants
  `FOR UPDATE USING (auth.uid() = user_id)` on `profiles` with **no `WITH CHECK` and no column
  restriction**, and `Subscription.tsx:112-119` performs the `tier` write from the browser. One
  console command = permanent Pro. (`is_admin` *does* have a self-grant guard trigger; `tier` has no
  equivalent.)
- **Currency mismatch.** Every surface leads with USD and JSON-LD declares `priceCurrency: USD`
  (`Landing.tsx:54-61`), but the charge is hardcoded INR (`create-razorpay-order/index.ts:50`) at a
  frozen ~₹83/$ rate.
- **Zero AI integration** anywhere in the repo. No LLM provider in `package.json`, no API key referenced.
- **Three dead payment integrations:** Stripe (`priceId` is an *event* id, so it can only fail),
  PayPal (sandbox URLs, no entry point), and a duplicate `hooks/Razorpay.tsx`.

### Unresolved and blocking

**Does `anon` have SELECT on `invoices` / `business_details` / `profiles`?** Under the RLS in version
control it does not — yet `PublicInvoicePay.tsx:96-117` reads all three with the publishable key.
Either a policy was added by hand in the dashboard (possibly too broad — a data-exposure issue that
survived the Phase 0 cleanup), or **the public payment link is broken for every real recipient.**
Query `pg_policies` directly. This is binary and it changes the priority order.

### Also true

- **The schema is not reproducible from `supabase/migrations/`.** Only 11 files, and none creates
  `invoices`, `clients`, `business_details`, `razorpay_orders`, `subscribers`, or `customers`. The
  baseline is `clean_restore.sql`, currently staged for deletion — recoverable via
  `git show HEAD:clean_restore.sql`.
- `contact_inquiries` and the `logos` / `invoice_pdfs` storage buckets exist in **no** version-controlled
  SQL. Created by hand in the dashboard.
- `src/integrations/supabase/types.ts` **does not exist** but is imported at `client.ts:3`. Type-only
  import, so runtime is fine, but every table and RPC access is effectively untyped — hence the
  `as any` casts everywhere, and why bugs like `.eq('id', …)` on `profiles` ship.
- No `npm run typecheck`, no CI.
- No index on `invoices.user_id`, which every app query filters by.

---

## 3. Open decisions

| # | Decision | Blocks | Status |
|---|---|---|---|
| D1 | **Is India-first deliberate or accidental?** | UPI QR (Phase 5), MSME escalation (Phase 5), whether USD pricing stays (Phase 4) | **OPEN.** Currently being decided by default — marketing quotes $6, Razorpay charges ₹499 at a frozen rate. |
| D2 | Does `anon` have a hand-added SELECT policy for the pay page? | Phase 0 priority order; all of Phase 3 | **OPEN.** Query `pg_policies`. |
| D3 | Are the two `20260822*` migrations applied to the live project? | Phase 1 | **OPEN.** |
| D4 | Autopilot-by-default or approve-each-message for The Chase? | Phase 2 scope | **OPEN.** Recommendation: approve-first for the first 30 days of a user's life, then offer autopilot once they trust it. |
| D5 | Which LLM provider for message composition? | Phase 2 | **OPEN.** No AI dependency exists yet. |

---

## Phase 0 — Clear the deck

**Goal:** a reproducible, committed, non-bleeding base. No feature work until this lands.

**Status:** partially done — security and data-integrity work exists **uncommitted** in the working
tree (~39 files, ~427 insertions, ~9,086 deletions, plus two untracked migrations and
`src/hooks/useIsAdmin.ts`).

### 0.1 Land the existing work
- [ ] Review and commit the Phase 0 changeset. If the checkout is lost, the work is lost.
- [ ] Confirm `supabase/migrations/20260822000000_secure_admin_access.sql` and
      `20260822000100_invoice_data_integrity.sql` are **applied** to the live project (**D3**).
- [ ] Verify the frontend works against the new schema — `taxes`/`discounts` are now `jsonb`, and
      `useInvoiceManager`'s `ensureNumeric` coercion (which was destroying every tax/discount
      breakdown on save) must be gone.
- [ ] Wire `useIsAdmin` into `src/App.tsx` in place of the hardcoded email array.

### 0.2 Resolve the blocking unknown
- [ ] Query `pg_policies` for `anon` grants on `invoices`, `business_details`, `profiles` (**D2**).
      If a broad policy exists → scope it down. If none exists → **the public pay page is broken and
      that becomes the highest-priority bug in the product.**

### 0.3 Stop the bleeding
- [ ] **Close the tier self-upgrade hole.** Add `WITH CHECK` + column restriction to the `profiles`
      UPDATE policy, or a `prevent_tier_self_grant` trigger mirroring `prevent_is_admin_self_grant`.
      Remove the client-side `tier` write at `Subscription.tsx:112-119` — the correct server path
      already exists at `verify-razorpay-payment/index.ts:182`.
- [ ] **Fix `src/pages/Terms.tsx:52-56`** — *"one-time subscription — pay once, no recurring charges"*
      against a ₹499/mo plan. Highest legal exposure in the repo. (It also happens to describe what
      the code actually does — see Phase 4.) Also fixes the brand misspelled "invoicelly" 5×.
- [ ] **`public/robots.txt`: disallow `/pay/`.** Public invoices with client names and amounts are
      currently crawlable.
- [ ] Fix `/subscribe` — `App.tsx:177` passes `null` into a component that dereferences it at
      `Subscription.tsx:85`. Publicly routable, white-screens.

### 0.4 Make the base reproducible
- [ ] Capture the baseline schema as a real migration (from `clean_restore.sql`) so the DB can be
      rebuilt from `supabase/migrations/` alone.
- [ ] Version `contact_inquiries` and the `logos` / `invoice_pdfs` bucket policies.
- [ ] Generate `src/integrations/supabase/types.ts`; add an `npm run typecheck` script.
- [ ] Add an index on `invoices.user_id`.

**Exit criteria:** clean tree; schema rebuildable from migrations; `tier` not self-grantable; Terms
accurate; typecheck passes in CI; D2 and D3 answered.

---

## Phase 1 — The Gate

**Goal:** the three columns and one cron job that make every later phase possible. Small, mechanical,
and the single highest-leverage work in the plan.

- [ ] **`invoices.paid_at timestamptz NULL`** — set in `updateStatus` (`Invoices.tsx:350-360`) whenever
      status becomes paid. *The highest-leverage single column in the system.*
- [ ] **`invoices.sent_at timestamptz NULL`** — write on email send; **backfill from
      `email_logs`** where `idempotency_key LIKE 'invoice_sent_%'`.
- [ ] **Populate `invoices.client_id`** — backfill on `(user_id, client_name)`, then write it on every
      save. Stop joining metrics on a mutable string.
- [ ] **A scheduler.** `pg_cron` or Vercel cron hitting `generate-recurring-invoices`.
- [ ] **Fix the overdue sweep:** `.eq('id', inv.user_id)` → `.eq('user_id', inv.user_id)`.
- [ ] Normalise the status casing mess. Writes are Capitalized (`Invoices.tsx:695-723`), reads
      lowercase-compare, and `adminDataService.ts:250` compares `=== 'paid'` strictly. Add a CHECK
      constraint and one canonical form.
- [ ] Add a `sent` status. Emailing an invoice currently changes nothing about its state.
- [ ] Remove the fake **"Automation Worker — Active (Every 24 hrs)"** tile
      (`RecurringInvoices.tsx:386-402`) — or, better, make it tell the truth now that a worker exists.

**Exit criteria:** recurring invoices actually recur; overdue is actually detected; `paid_at` /
`sent_at` populated going forward and backfilled historically; per-client queries join on `client_id`.

> Landing this phase alone closes most of the marketing-vs-reality gap in
> [Appendix B](#appendix-b--marketing-claims-to-fix), because it activates two features we already
> advertise and already built.

---

## Phase 2 — The Chase

**Goal:** the killer feature. First thing anyone would pay for.

### 2.1 Payment detection (build this first)
The chase is **unsafe** without it — nagging someone who already paid is worse than not chasing at all.

- [ ] **"I've already paid this"** one-tap link in every chase email → seller gets *"Acme says they
      paid #1043 — confirm?"* → chase pauses immediately.
- [ ] Same affordance on the public pay page.

> The insight: we cannot detect payment, but **the person who knows is the recipient, and the reminder
> is already in front of them.** The chase and the detector are the same mechanism. No bank
> integration required.

### 2.2 The ladder
- [ ] Cadence: −3 days (gentle) → due date (check-in) → +7 (firmer) → +21 (formal).
- [ ] **Tone dial: Friendly / Firm / Formal** — one control rewrites the whole ladder.
- [ ] Auto-stop on payment or on a client "already paid" tap; auto-send a warm confirmation, never
      another reminder.
- [ ] **Promise tracking** — client says "next Friday"; record the promise and chase *the promise*,
      not the due date. A broken promise is a stronger and more comfortable thing to follow up on.
- [ ] Message composition via LLM (**D5**), in the user's voice, referencing real history.
- [ ] Approve-each-message first, autopilot as an opt-in (**D4**).

### 2.3 Infrastructure
- [ ] New tables: chase schedules/steps, and a promises table.
- [ ] Reuse the existing dispatcher — `trigger-automation-email` already does idempotency,
      template resolution, Resend delivery, and `email_logs` writing. **Do not rebuild it.**
- [ ] Honour `email_automations.delay_minutes`, currently stored, displayed, and ignored.
- [ ] Seed the missing templates: `pro_subscription_activated` (fired at `Subscription.tsx:134`, no
      row exists, so it always errors) and `invoice_created`.
- [ ] Wire the orphaned `invoice_paid` automation.

**Exit criteria:** a user can turn on The Chase and it demonstrably escalates, stops on payment, and
never double-nags. Ship to a handful of real users before building anything in Phase 3.

---

## Phase 3 — Truth surfaces

**Goal:** make the invisible visible. All read-side; `recharts` is already a dependency.

- [ ] **Payment Timeline** per invoice — sent → opened (n×) → reminded → promised → paid. Replaces a
      status dropdown a human has to remember to flip. There is no invoice-detail page today; this is
      where it goes.
- [ ] **Open/view tracking** on the pay page — *"opened 4 times, not paid"* is a completely different
      situation from *"never opened"*, and demands a different action. Needs an events table and a
      public-read path (see **D2**).
- [ ] **Client Payment Scorecard** — average days-to-pay, reliability grade, trend, slowest payer.
      Partially backfillable from `email_logs` + `paid_at`, so **new users see value on day one from
      data they already gave us.**
- [ ] **Risk flag at invoice creation** — *"Acme has paid late 4 of 5 times, averaging 23 days over.
      Want 50% upfront, 15-day terms, and a late-fee clause?"*, one tap to apply. This is the only
      intervention that happens while the user still has negotiating power.
- [ ] Per-client smart defaults derived from the scorecard.

**Exit criteria:** a user can answer *"is this client going to pay me, and when?"* without leaving the app.

---

## Phase 4 — Cash, habit, and repricing

**Goal:** the weekly return, and a price that reflects the value.

- [ ] **Expected Cash (30/60/90)** — weighted by each client's *observed* lateness, not by due date.
      *"₹1.4L expected in 30 days. ₹62k of that is with clients who are reliably late — treat it as
      day 45."* Due-date sums are a lie; this is the differentiated version.
- [ ] **"Today"** — the nudge inbox. *"3 things need you: approve a firm follow-up to Acme (₹47k, 21
      days over); Zenith promised Friday and Friday passed; you haven't invoiced Meridian this month
      and you usually do."* **This becomes the post-login landing page, not a dashboard.**
- [ ] **Forgotten-money detection** — missed recurring bills (walk the `parent_invoice_id` lineage,
      which nothing currently does) and duplicate line items. Finds money the user forgot to ask for:
      the highest-ROI thing software can do for a freelancer, and a provable justification for the
      subscription.
- [ ] **Money Monday** — one weekly digest: collected, expected, at risk, needs you.
- [ ] **Reprice.** Move the gate from watermark/client-cap to automation per
      [the new free/paid line](#the-new-freepaid-line). Retire the watermark lever.
- [ ] **Make Pro a real subscription** — Razorpay Subscriptions + a webhook endpoint (there are
      currently **zero** webhook handlers for any provider), and make `useEntitlements` actually read
      `subscription_end_date`. Until then Pro is a lifetime licence.
- [ ] Resolve the USD/INR contradiction (**D1**).
- [ ] Delete the three dead payment integrations (Stripe, PayPal, duplicate Razorpay hook) — live
      secret surface area for zero revenue.

**Exit criteria:** users open Invoicely weekly without being prompted; Pro renews or lapses correctly.

---

## Phase 5 — Moat

**Goal:** things a competitor cannot copy by shipping a feature.

- [ ] **Client Payment Reputation Network** — aggregated, anonymised, cross-tenant: *"this company pays
      an average of 23 days late across 14 Invoicely users."* Warn a freelancer about a bad payer
      **before they take the job.**
      - The real moat: a data network effect requiring multi-tenant scale.
      - **Serious caveats:** cold-start (worthless below real density), and we would be publishing
        claims about identifiable businesses. **Aggregate-only, minimum-N thresholds, legal review
        before launch.** Collect the data from Phase 1 onward so it is ready when density arrives.
- [ ] **UPI QR code printed in the invoice PDF** — `qrcode.react` is already a dependency and unused.
      Collapses payment friction to scan-and-send. Likely the highest impact-to-effort ratio in the
      whole product, pending **D1**.
- [ ] **One-tap formal escalation** — a legally-framed demand notice, pre-filled. In India this can
      reference the MSMED 45-day payment rule, which is unusually effective at moving finance
      departments.
      **⚠ Verify the current statutory specifics with a CA or lawyer before shipping.** This goes out
      as a document our user sends their client; getting it wrong is a real liability. Nothing in this
      plan should be treated as legal advice.
- [ ] **WhatsApp delivery** — now, not earlier. Needs a BSP and template approval, and templated
      messages cannot carry tone-graded copy, so it supplements the ladder rather than replacing it.
- [ ] **Quote → Invoice with client acceptance** — timestamped acceptance extends the paper trail
      backward and gives the chase real ammunition: *"you approved this on the 3rd."*

---

## UI/UX track (runs alongside)

**Verdict from the audit: a product with a template's component layer and a prototype's core flow.**

Not a template — templates don't delete their own fake testimonials on principle
(`Landing.tsx:409-411`, `:706-708`), don't write error-message mappers, don't distinguish empty-state
from no-results, don't leave comments naming the bug a line fixes.

But there is a **seam through the money-making feature**. Outside the builder: amber tokens,
`text-foreground`, `tabular-nums`, complete loading/empty states, `aria-current`. Inside it:
`bg-white dark:bg-gray-800`, `yellow-400` rings that aren't the brand amber, hardcoded `$` in a ₹
product, five phantom CSS classes, two toggle implementations, a modal with no focus trap, a shipped
`throw new Error("Function not implemented.")`, and no validation at all.

**`InvoiceForm.tsx`, `InvoiceItems.tsx`, `InvoiceDetails.tsx`, `EmailModal.tsx` are where a paying
user lives.** Ship the `Invoices.tsx` standard into them and this reads as a credible paid product.
Leave them and no landing-page polish will matter.

### Fix immediately — silent failures on the path to money

1. [ ] **100 MB autoplaying hero video** with a 404'd poster (`Landing.tsx:499-510`). The one element
       that proves the "30 seconds" claim renders as a **black rectangle** while 100 MB downloads over
       someone's mobile data. Poster frame, ≤3 MB, `preload="none"`.
2. [ ] **`$` and `₹` on the same invoice** — `InvoiceItems.tsx:140,178,289` vs `Invoices.tsx:127-132`.
       One formatter.
3. [ ] **Zero validation.** A blank-client, no-items, ₹0 invoice saves and emails cleanly
       (`useInvoiceManager.tsx:34-42` checks only for a session). `form.tsx` + `zodResolver` are
       already installed and unused.
4. [ ] **Every upgrade CTA lands on the wrong tab.** Four call sites deep-link `?tab=subscription`;
       `Settings.tsx:37` ignores the param. The conversion path is broken.
5. [ ] **The dashboard's primary "New Invoice" button does nothing** — `Dashboard.tsx:665-669` clicks
       `[data-create-invoice]`, which exists nowhere.
6. [ ] **No dashboard error state** (`Dashboard.tsx:258-260` only `console.error`s) — a failed load
       renders as "₹0 revenue." Worst possible failure mode for a financial app.
7. [ ] **Revenue chart aggregates across years** — buckets by month *name* with no year check
       (`Dashboard.tsx:306-315`).
8. [ ] **Emoji printed inside client-facing invoice templates** — *"Thank you for working with me! 🙏"*,
       *"🌿 committed to sustainable business practices"*, *"🌱 This invoice was generated without
       paper"* (`InvoicePremiumTemplates.tsx:872,1492,1550`). These print on **our user's document, to
       their client.** Worst polish bug in the repo: it damages our customer's credibility, not ours.
9. [ ] Draft destroyed on background click with no confirm (`CreateInvoiceDialog.tsx:95`).

### Information architecture — replace 5 flat nav items

The current nav has no home for the product we're building. Replace with:

| Nav | Content |
|---|---|
| **Today** | The nudge inbox. What needs you now. **Post-login landing page.** |
| **Invoices** | With Recurring folded in, not a separate Pro-gated page |
| **Clients** | Scorecards and payment history as the *primary* content |
| **Cash** | Forecast and insights |
| **Settings** | |

**This IA change is the strategy made visible.** The app should open on what needs attention, not on
a chart of the past.

### Design system debt

- No `fontFamily`, `fontSize`, `spacing`, or `boxShadow` scale in `tailwind.config.ts`. Every size and
  gap is an ad-hoc literal.
- Four competing palettes: shadcn amber tokens, a legacy raw-hex `invoice.*` palette, ~107 inline
  stone/amber literals in `Landing.tsx`, and cool `slate` in `Auth.tsx`. `components.json:9` declares
  `baseColor: "slate"` against amber tokens.
- Six fonts imported, four never used; three `@font-face` rules point at `public/fonts/`, **which does
  not exist** → six 404s per page load. `* { font-family: Poppins }` while Landing overrides to Plus
  Jakarta — marketing and app are in different typefaces *by accident*.
- **Five phantom CSS classes** (`invoice-input`, `invoice-section-title`, `invoice-trash-btn`,
  `invoice-action-btn`, `invoice-textarea`) referenced but defined nowhere → "Add Item", "+ Tax",
  "+ Discount" and every trash button fall through to shadcn default: **solid amber, `size="lg"`.**
  Six equally-loud amber buttons per screen, destructive actions included. 13 dead `paper-*` classes
  defined and never used.
- Dark mode is fully tokenised with **no reachable toggle** (the only toggle lives in dead files) and
  no boot-time init, so dark users get a light flash every cold load.
- Component layer is **100% stock shadcn, 32 of 47 unused** — while `DashboardSidebar`, three tables,
  Settings tabs, four skeletons, and two drawers are all hand-rolled anyway. Visual personality
  contributed by that layer: none.
- Tax/discount computed amounts are commented out (`InvoiceItems.tsx:227-229,278-280`), so entering
  18% GST never shows the resulting amount.

### Keep — this is real craft

- Deleted fake social proof **and the comments explaining why** (`Landing.tsx:409-411`, `:706-708`),
  and the same instinct at `App.tsx:187-191`. Highest-integrity work in the repo.
- **`Auth.tsx`** — live tri-state password rules, a `getFriendlyError` map turning Supabase errors into
  human sentences, in-flight guard. Product-grade.
- `Invoices.tsx` / `Clients.tsx` as the reference standard — token discipline, `tabular-nums`,
  centralised `STATUS_CONFIG`, empty-vs-no-results distinction.
- The split-screen live preview. Correct core interaction for invoicing.
- Print CSS (`index.css:135-184`) — real A4 sizing, `print-color-adjust: exact`, `break-inside: avoid`.
  Someone actually printed an invoice.
- Landing copy: mechanism-first, verb-first, essentially slop-free.
- `EmailModal.tsx:53-55` — un-gating email send from Pro *because it produces the send/view/payment
  history the product depends on*. Exactly the right instinct, and it prefigures this whole plan.

---

## Appendix A — Bug inventory

Not scheduled above; keep as a backlog.

**Dead files (zero importers):** `adminMockData.ts` (547 lines), `supabasecode.tsx`,
`hooks/Razorpay.tsx`, `paypalsuccess.tsx`, `InvoiceStats.tsx`, `settings/BusinessDetails.tsx`,
`Header.tsx`, `DashboardHeader.tsx`, `App.css` (untouched Vite starter).

**Stubs in live files:** `InvoiceForm.tsx:591-593` `throw new Error("Function not implemented.")`;
`pdfUtils.downloadPDF` is a `console.log`; `uploadPdfToStorage` never called (the `invoice_pdfs`
bucket is written by nothing, and the stored URL is never persisted to the invoice row);
`InvoiceLayout.tsx:39-747` = 15 unreachable legacy template cases; dead `InvoicePromptInput` import.

**Referenced but missing:** `[data-create-invoice]`, `/templates/*.png`, `/video-poster.jpg`,
`public/fonts/`, `fix_all_features.sql`, a `payments` table (written to by
`verify-paypal-payment/index.ts:88`).

**Admin panel fabrications:** `AdminRevenue` hardcodes "+18.6%/+14.2%/+5.8%" as JSX strings and mixes
Invoicely revenue with customers' invoice totals; all four admin chart series are synthesised from
current totals (`adminDataService.ts:336-370`); `AdminFeatures` analytics fields are literally `null`;
`AdminSettings` is localStorage-only with a fabricated API key for a nonexistent API; AdminLayout has
a hardcoded "Super Admin / admin@invoicely.app" identity and a static "All Systems Operational".
**Reported MRR is wrong by ~83×** (Razorpay charges ₹499/₹4,999; admin counts $6/$59).

**Regressions from `20260822000000`:** `get_all_profiles()` silently dropped the six subscription
columns that `20260818000000` added, so `adminDataService.ts:185-217` reads `undefined` for all of
them — every admin subscription now shows renewal `'N/A'`, cycle `'monthly'`, status `'Active'`.
`email_logs` became SELECT-only while `AdminEmailAutomation.tsx:576,1334` still issues `DELETE`, so
Retry/Resend now silently fail.

**Security:** four edge functions accept `userId`/recipients from the body with no JWT check;
`send-invoice-email` is effectively an open relay from `no-reply@getinvoicely.online`. `razorpay_orders`
and `customers` have **RLS never enabled**. `subscribers` has a world-writable
`USING(true) WITH CHECK(true)` policy that Phase 0 did not tighten. EmailJS credentials are hardcoded
in client source (`InvoicePreview.tsx:~785`). `index.html:92` still loads `cdn.gpteng.co/gptengineer.js`
in production.

**SEO/structural:** client-rendered SPA with no SSR/prerender, so non-JS crawlers see the homepage
title and canonical for all 21 public URLs; `/terms`, `/privacy`, `/refunds`, `/contact-us`,
`/subscribe` have no `SEOHead`.

**PDF:** html2canvas → jsPDF raster snapshot, so **PDF text is not selectable or searchable**, and
**no server can render a PDF** — any scheduled/reminder email cannot attach one without new
infrastructure. Relevant to Phase 2.

---

## Appendix B — Marketing claims to fix

Pricing copy is accurate. Feature copy is not. Either build it or delete the claim — **and Phase 1
builds several of these, so sequence the copy fixes after it.**

| Claim | Location | Reality |
|---|---|---|
| "Payment reminders: **Automatic**" | `seo/InvoiceGenerator.tsx:237` | No client-facing reminder exists at all |
| "automatically confirm payments" | `blog/InvoiceVsReceipt.tsx:109` | Manual toggle only; the FAQ says the opposite |
| "Status tracking — Draft, **Sent**, Paid, Overdue" | `HowItWorks.tsx:207` | No `sent` status; overdue never detected |
| "Recurring invoices for retainer clients" | Landing / FAQ / About | UI exists, nothing runs it |
| "**5 invoices free per month**" | `seo/InvoiceGenerator.tsx:139` | No such cap exists; contradicts line 11 of the same file |
| "multi-currency invoicing" | `blog/InvoiceForFreelancers.tsx:99` | One unused account default |
| GST "handled automatically" / "fully compliant PDF" | `blog/GSTInvoiceGuide.tsx:99` | `FAQ.tsx:26` admits no CGST/SGST/IGST split; no HSN/SAC, no signature. **Legal risk.** |
| "Live checkout links" / "Bank-Grade Encryption" | `seo/InvoiceGeneratorOnline.tsx:99,153` | An outbound link; TLS + RLS |
| "Join thousands of freelancers" / "Save 10+ hours every month" | `seo/FreeInvoiceGenerator.tsx:236`, `Landing.tsx:607` | Unsubstantiated — and `Landing.tsx:409-411` documents removing a "Trusted by 10,000+" pill for exactly this reason. Be consistent. |
| "one-time subscription — pay once, no recurring charges" | `Terms.tsx:52-56` | Contradicts the ₹499/mo plan. **Highest legal exposure.** |
| "30 Seconds" vs "under a minute" vs "Under 30 seconds" | `Landing.tsx:418`, `:434`, `:208` | Pick one number |
| "Save 20%" vs "save 17%" (actual: 18.1% USD / 16.5% INR) | `Subscription.tsx:425` vs `Landing.tsx:103` | Pick one, and make it true |
| "Pro" vs "Pro Growth ⚡" | `Landing.tsx:99` vs `Subscription.tsx:284,494` | One plan name |
