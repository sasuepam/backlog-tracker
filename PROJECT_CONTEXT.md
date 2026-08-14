# EINT MuleSoft Backlog Tracker — Project Context

## What we're building

A single source-of-truth Excel workbook for the EINT MuleSoft integration team's backlog, replacing two legacy files:
- `MuleSoft Team - Planning.xlsx`
- `Requirements Traceability Matrix - EINT Mulesoft 2026.xlsx`

The live workbook is at [`workbook/Backlog Tracker - EINT MuleSoft.xlsx`](workbook/Backlog%20Tracker%20-%20EINT%20MuleSoft.xlsx).

## The golden rule: every field has exactly one home

Each requirement is one row, tracked by its **Requirement ID** across every tab. Each field (Priority, Sprint, Dependencies, Release, etc.) is only ever typed into ONE tab — the tab owned by the role responsible for it. Every other tab shows that same field automatically, pulled live via formula from wherever it was entered. If you change it in its home tab, it updates everywhere else immediately. Nobody should ever need to copy a value between tabs by hand.

## Requirement ID convention

Use the Jira key (e.g. `INT-171`) as the Requirement ID whenever a Jira ticket already exists. Anyone can also add a future item straight to the Backlog tab with no Jira ticket at all — it gets a temporary ID in the form `NEW-0001`, `NEW-0002`, etc. This ID never changes afterwards, even once a real Jira ticket exists for it, since every other tab is joined to it — swapping it would break those links. When the item is ready to become a real Jira ticket, setting "Create Jira Ticket?" to Yes on the Backlog tab writes the returned Jira key into separate Jira Key / Jira Link columns alongside the ID, not in place of it.

## Tab ownership — who edits what

| Tab | Owner | Types here (input) | Shown automatically (pulled) |
|---|---|---|---|
| Backlog | Anyone (entry point) | Requirement Name, Type, Stream, Status, Date Added, Create Jira Ticket?, Jira Key | Jira Link, Priority, Sprint, Release |
| API Design Planning | API Design Lead | RAML Required, RAML Delivery Date, Assignee, Priority, Design Status, Handover | Requirement Name, Stream, Jira Link, Status, Sprint |
| RTM | BA | Predecessor, Successor, Dependency Status, Notes | Requirement Name, Stream, Jira Link, Status, Priority, Sprint |
| Sprint Planning | BA / PO / SM | Sprint, HLE | Requirement Name, Stream, Priority, Status |
| Roadmap | Nobody — all view | *(fully automatic)* | Stream x Sprint HLE grid |
| Release | DM / SM | Release | Requirement Name, Stream, Sprint, Status, Priority, HLE |

## Colour legend

Text is plain black everywhere. Row shading instead shows which Stream an item belongs to, applied automatically via conditional formatting so it updates itself as Stream values change: US, MyMSC, Rollout/MVP Rollout, Backlog/Growth, Tech Enhancements, and any PI-specific stream (PI11, PI12, etc.) each get their own shade. Cross, or any stream not listed, gets no shading (white/default). Who's allowed to edit which field is governed by the ownership table above, not by colour.

## Sprint Planning sort order

Sprint Planning is kept sorted ascending by Sprint (lowest in-scope sprint first, unassigned/"To Plan" last), using a hidden "Sort Key" column (H) that converts the Sprint text to a number. Re-sort via Data > Sort by column H if new rows are added — don't unhide or delete that column.

## Release tab population

The Release tab lists every item that has a real Sprint assigned in Sprint Planning (not blank/"To Plan"). Once an item gets a sprint for the first time, its Requirement ID should be added to the Release tab so DM/SM can assign a Release. Same pattern as RTM/Sprint Planning/API Design Planning: copy the ID over when the item reaches that stage.

## PI Governance (ROTB) tab

A cross-cutting view of every item tagged with a PI-stream (PI9, PI10, PI11, PI12, etc.) or the M4M stream, regardless of whether it's still active in Backlog or already archived to a Quarter tab. Columns: ID, Stream, Sprint, Jira Link, Description, Status, HLE — all pulled live, view-only, from wherever the item currently lives. Status is edited on Backlog (or the relevant Quarter tab if archived) exactly as normal — same rule as everywhere else in the workbook, no exception for this tab.

Beyond the 7 fixed columns, the sheet has open-ended "Notes - <date>" columns (starting with Jul 31, Aug 5, Aug 13) — free text, and anyone can rename a Notes header or add more Notes columns to the right at any time; the sheet is unprotected for this purpose. New items tagged with a PI stream after this tab was built need to be added to it manually (there's no automatic "any new PI-stream item appears here" trigger yet).

## Quarterly archive tabs

`Q1–Q4 Backlog Report 2026` are the archive destination for Done items. Planned automation: when an item's Status is set to Done on Backlog, it should be removed from the 5 working tabs (Backlog, API Design Planning, RTM, Sprint Planning, Release) and consolidated into the quarterly tab matching the **sprint it was done in**, not the archive date (e.g. done in Sprint 8 → Q2, since Sprint 8 falls in Q2). Lookup table for this: Lists tab, columns K–M (Sprint → Quarter mapping). Not yet wired up — until then, Done items stay in place. The mapping only covers 2026 (Sprint 1–16, Q1–Q4) and needs updating/extending every year.

## Planned automations (not yet wired up)

1. Jira (labelled ticket) → auto-creates a Backlog row with Jira Key/Link filled in.
2. Any new Backlog row (Jira-sourced or typed straight in) → auto-creates a Trello card.
3. Sprint changed for an item → updates the sprint label on its Trello card.
4. "Create Jira Ticket?" set to Yes on a manually-added row → creates the Jira issue, writes the key back into Jira Key/Jira Link, flips the flag to Created.
5. Scheduled refresh of the RTM Dependency Status column from the live status of the Predecessor/Successor Jira key.
6. Status set to Done on Backlog → archive the row into the matching quarterly tab (see above) and remove it from the 5 working tabs.

## Current status

Data has been fully migrated from both legacy files plus a manually-provided gaps list — this is not an empty template. Backlog currently holds ~247 rows. Dropdowns use inline literal lists (not cross-sheet ranges) since LibreOffice recalculation strips range-based validations. See [`scripts/README.md`](scripts/README.md) for the maintenance scripts used to keep formulas and structure consistent, and [`memory/`](memory/) for supporting reference data (e.g. the T-shirt-size-to-story-point conversion table).

## Repo layout

```
MSCbacklogtracker/
├── PROJECT_CONTEXT.md        (this file)
├── README.md                 (quick orientation + folder guide)
├── workbook/                 the live .xlsx
├── diagrams/                 process-flow diagram
├── memory/                   supporting reference data
└── scripts/                  reusable maintenance scripts (+ archive/ for one-off scripts)
```
