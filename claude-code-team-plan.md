# Claude Code Team Plan — Detailed Guide

## Overview

Claude Code is Anthropic's AI-powered developer tool that integrates directly into terminals and IDEs to assist with coding tasks such as writing, editing, debugging, and understanding codebases. The **Team Plan** is purpose-built for engineering teams that need centralized management, predictable costs, and consistent availability across all members.

---

## Available Plans at a Glance

| Plan | Monthly Cost | Best For | Claude Code Access |
|---|---|---|---|
| **Free** | $0/user | Evaluation / hobby | Limited (Sonnet only, low caps) |
| **Pro** | $20/user | Solo developers | Yes (moderate limits) |
| **Max 5x** | $100/user | Heavy individual use | Yes (5× Pro limits) |
| **Max 20x** | $200/user | Power users | Yes (20× Pro limits) |
| **Team** | $25/user/month (annual) · $30/user/month (monthly) | Small–medium engineering teams | Yes — full access |
| **Team (Premium seat)** | ~$150/user/month | Teams needing maximum throughput | Yes — highest limits + priority |
| **Enterprise** | Custom quote | Large orgs, compliance-sensitive | Yes — custom limits + SLAs |

> **Recommended for your 10-developer team: the Claude Code Team Plan** (see recommendation section below).

---

## Claude Code Team Plan — Full Details

### Pricing

| Billing Cycle | Price per User |
|---|---|
| Annual (billed yearly) | **$25 / user / month** |
| Monthly (billed monthly) | **$30 / user / month** |
| Premium seat (annual) | **~$150 / user / month** |

For a **10-developer team** on the standard annual plan:
- **10 × $25 = $250 / month** ($3,000 / year)

For premium seats:
- **10 × $150 = $1,500 / month** ($18,000 / year)

---

### Rate Limits & Usage Quotas

The Team Plan uses a **rolling 5-hour window** quota system. Limits reset automatically after each 5-hour period.

| Seat Type | Prompts per 5-hour window | Approx. Sonnet 4 coding hours/week | Approx. Opus 4 coding hours/week |
|---|---|---|---|
| Standard Team seat | ~50–200 prompts | ~140–280 hrs | ~15–35 hrs |
| Premium Team seat | ~200–800 prompts | ~240–480 hrs | ~24–40 hrs |

**Key points about rate limits:**
- Limits are **pooled across the team** — unused quota from low-activity members helps balance out heavy users.
- A **weekly cap** was introduced in 2025 to prevent continuous 24/7 background usage abuse. Heavy background automation or agentic tasks consume quota faster than interactive sessions.
- Quota consumption is **token-based**, not time-based. Longer prompts, larger codebases, and more complex refactoring tasks consume quota more quickly.
- If a developer hits the 5-hour window limit, their session is **paused** (not terminated) and automatically resumes when the window resets — typically within minutes to a couple of hours.

---

### Features Included in the Team Plan

#### Developer Features
- ✅ Full Claude Code CLI access (terminal-native AI coding assistant)
- ✅ IDE plugin support (VS Code, JetBrains, etc.)
- ✅ Access to Claude Sonnet 4 (default) and Claude Opus 4 (premium)
- ✅ Multi-file edits, codebase search, and refactoring
- ✅ Automated PR descriptions, commit message generation
- ✅ Test generation and debugging assistance
- ✅ Code review and documentation generation

#### Team & Admin Features
- ✅ **Centralized admin dashboard** — manage all users, seats, and usage from one place
- ✅ **Usage monitoring per user** — see which developers are using the most quota
- ✅ **Budget controls** — set spending limits and receive alerts before limits are reached
- ✅ **Seat management** — add or remove users without waiting for billing cycles
- ✅ **Pooled usage quotas** — quota is shared across the team, not siloed per user
- ✅ **Shared project context** — team members can share configuration and context files
- ✅ **Priority support** — faster response from Anthropic support compared to Pro/Free
- ✅ **SSO (Single Sign-On)** support (standard with Team plan; enhanced with Enterprise)
- ✅ **Audit logs** — track who used what, when (important for compliance teams)

---

### What "Centrally Manage Users" Means in Practice

As a team admin you can:

1. **Invite / remove developers** via the admin console without needing their billing details.
2. **Monitor individual usage** — view tokens consumed, sessions started, and prompts made per user.
3. **Extend the budget** — top up the shared pool or upgrade seats directly from the billing dashboard without contacting sales.
4. **Set usage alerts** — receive email notifications when the team reaches 70%, 90%, or 100% of the monthly quota.
5. **Assign roles** — designate other administrators to help manage users.
6. **View audit logs** — see a time-stamped record of all team activity for compliance or cost-allocation purposes.

---

### Avoiding Throttling (Anti-Throttle Tips)

The following practices help your team avoid hitting rate limits:

| Practice | Benefit |
|---|---|
| Use Standard seat for everyday coding | Saves premium quota budget |
| Upgrade to Premium seats for high-throughput users | 4× more prompts per 5-hour window |
| Avoid long-running background agents during peak hours | Prevents one user from consuming the shared pool |
| Stage large refactoring tasks across multiple sessions | Spreads quota consumption over multiple windows |
| Monitor per-user usage in the admin dashboard weekly | Identify heavy users early and reallocate budget |

---

## Rate Limit Comparison: All Plans Side by Side

| Plan | 5-hr Window (approx.) | Weekly Sonnet 4 hrs | Weekly Opus 4 hrs | Pooled Quota | Admin Controls |
|---|---|---|---|---|---|
| Free | ~5–10 prompts | ~5–10 hrs | ❌ | ❌ | ❌ |
| Pro ($20) | ~10–40 prompts | ~40–80 hrs | ❌ | ❌ | ❌ |
| Max 5x ($100) | ~50–200 prompts | ~140–280 hrs | ~15–35 hrs | ❌ | ❌ |
| Max 20x ($200) | ~200–800 prompts | ~240–480 hrs | ~24–40 hrs | ❌ | ❌ |
| **Team – Standard ($25)** | **~50–200 prompts** | **~140–280 hrs** | **~15–35 hrs** | **✅ Pooled** | **✅ Full** |
| **Team – Premium ($150)** | **~200–800 prompts** | **~240–480 hrs** | **~24–40 hrs** | **✅ Pooled** | **✅ Full** |
| Enterprise (custom) | Custom | Custom | Custom | ✅ Custom | ✅ Full + SCIM |

---

## Recommended Plan for Your Team

### ✅ Recommendation: **Claude Code Team Plan — Standard Seat (Annual)**

**Why this plan fits a 10-developer team:**

1. **No throttling risk** — the pooled quota model means if 3 developers are light users one day, the other 7 heavy users benefit from that extra buffer. This is far more efficient than 10 individual Pro plans.

2. **Centralized management** — the admin dashboard lets you add/remove users, view per-person usage, set budgets, and extend limits — all from one place. You don't need each developer to manage their own subscription.

3. **Budget control** — you get a single monthly invoice, usage alerts, and the ability to upgrade seats or top up the pool without contacting sales.

4. **Cost-effective** — at $25/user/month (annual), 10 developers cost **$250/month**, compared to $200/month for a single Max 20x individual plan. For 10 developers with significantly higher pooled limits and full admin features, this is exceptional value.

5. **Right-sized limits** — ~50–200 prompts per 5-hour window per seat, pooled across 10 users, provides ample headroom for a typical development team.

### When to Consider Upgrading to Premium Seats

Upgrade specific developers (or the whole team) to **Premium Team seats (~$150/user/month)** if:
- One or more developers run continuous agentic or background automation tasks.
- The team frequently works on very large codebases (>100k tokens per prompt).
- You notice regular quota exhaustion in the admin dashboard after 2–3 weeks.

### When to Consider Enterprise

Move to **Enterprise** if:
- You need **SCIM provisioning** (automatic user sync from your IdP like Okta/Azure AD).
- Your organization requires **SOC 2 / HIPAA compliance** documentation.
- You need **custom API rate limits** or a dedicated Anthropic account manager.
- Your team grows beyond ~50 developers.

---

## Quick Reference: Team Plan for 10 Developers

| Item | Value |
|---|---|
| Plan | Claude Code Team Plan |
| Seat type | Standard (or upgrade to Premium as needed) |
| Cost (annual) | $25/user/month × 10 = **$250/month** |
| Cost (monthly) | $30/user/month × 10 = **$300/month** |
| Quota model | Pooled across all 10 users |
| Prompts per 5-hr window | ~50–200 per seat (pooled) |
| Model access | Claude Sonnet 4 + Claude Opus 4 |
| Admin dashboard | ✅ Yes — full user & budget management |
| Usage monitoring | ✅ Per-user breakdown |
| Budget extension | ✅ Self-serve from admin console |
| SSO | ✅ Included |
| Audit logs | ✅ Included |
| Priority support | ✅ Included |

---

## Getting Started

1. Go to [claude.ai/team](https://claude.ai/team) and select **Team Plan**.
2. Enter your organization name and billing details.
3. Add your 10 developers by email from the **Admin > Members** page.
4. Configure usage alerts and budget limits from **Admin > Billing**.
5. Each developer installs Claude Code via:
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude
   ```
6. Developers authenticate with their team-issued Anthropic account credentials.

---

*Last updated: March 2026. Pricing and rate limits are subject to change by Anthropic. Always verify current pricing at [claude.ai/pricing](https://claude.ai/pricing).*
