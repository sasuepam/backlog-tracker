# Backlog Tracker — Release Notes

*Updates since the last team communication.*

---

## 🆕 New: Notes columns

Two sheets now have a free-text **Notes** column for jotting down context that doesn't fit anywhere else:

- **Backlog** — right after Jira Link
- **API Design Planning** — at the end of the row

Type anything you want here — there's no dropdown, no formula, just plain text.

---

## 🆕 New: "No scope for MS" sheet — automatic archiving for out-of-scope items

If an item's Status is set to **NA** in Backlog, it now gets archived automatically — the same way DONE items get archived to a Quarterly Report, except NA items go to a new dedicated sheet called **"No scope for MS"**.

**What happens when you click "Run Archive Done Items":**
- Any Backlog item marked **NA** is appended to the "No scope for MS" sheet
- It's removed from Backlog, Sprint Planning, RTM, and API Design Planning — exactly like a DONE item
- If it had a Release assigned, that Release row is removed too (since there's nothing to ship)

**No action needed from you** — just set Status to NA as you normally would, and the next time someone clicks the archive button, it's taken care of.

---

## 🆕 New: Design estimate column (API Design Planning)

**For Clare / API Design team:** there's a new **Design estimate** column in API Design Planning, right after Design Status.

This is fully automatic — it calculates itself from the item's HLE (story points) in Backlog, using this conversion:

| HLE (story points) | Design estimate |
|---|---|
| 5 or below | 0.5 |
| 8 | 1 |
| 13 | 2 |
| 20 | 3 |
| Above 20 | 5 |

**You don't need to do anything** — if HLE changes in Backlog, Design estimate updates itself automatically. Nothing to fill in, nothing to recalculate manually.

---

## 🔄 Changed: Jira Link is now a simple paste, no more Jira Key

Previously, Backlog had two separate fields — **Jira Key** (you typed a code like `INT-171`) and **Jira Link** (auto-built from the key).

**Now there's just one field: Jira Link.** Copy the link directly from Jira and paste it straight into the Jira Link column — no key needed. This is simpler and matches how the team actually works with Jira day to day.

This also applies to the Quarterly Report tabs (Q1–Q4) — they no longer have a separate Jira Key column either.

---

## 🧹 Housekeeping (invisible to most, worth knowing about)

- A few internal helper columns (ID Number, and two internal reference sheets — Workflows and Lists) are now hidden from view. These were never meant to be edited directly; hiding them just reduces visual clutter. Nothing about how you use the workbook changes.
- Fixed a data issue where Sprint 11's total HLE briefly showed incorrectly (someone had accidentally typed "code" into a label cell it depends on) — Sprint Planning's per-sprint totals are all correct now.
- Cleaned up a duplicate item that had been sitting in Backlog under two different IDs.

---

## Questions?

See [TEAM_INSTRUCTIONS.md](TEAM_INSTRUCTIONS.md) for the full how-to guide, or ask Sarah.
