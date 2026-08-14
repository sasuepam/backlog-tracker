# Email Copy — Backlog Tracker Instructions (by Role)

---

## Email 1: Everyone — How to Add to Backlog

**Subject:** How to Add Items to the Backlog Tracker

Hi team,

The **Backlog** sheet is where all new work starts.

**To add an item:**
1. Go to the **Backlog** sheet
2. Find a blank row and fill in:
   - **Requirement Name** — what the work is
   - **Type** — pick from the dropdown (Config, CR, New, Bug, etc.)
   - **Stream** — which team/initiative (US, MyMSC, Growth, PI9-12, M4M, etc.)
   - **Status** — pick from dropdown (NEW, IN PROGRESS, DONE, etc.)
   - **Priority** — optional (Critical/High/Medium/Low)

**Don't edit:** Requirement ID (auto-fills as NEW-0001, etc.), Jira Link, or any bold/shaded columns — those are formulas and pull from other sheets.

**What happens:** Your item automatically appears in API Design Planning, Sprint Planning, RTM, and Roadmap — no manual copying needed. It's live and stays in sync across all sheets.

---

## Email 2: Clare — API Design Planning Instructions

**Subject:** API Design Planning — Your Columns

Hi Clare,

In the **API Design Planning** sheet, you own these columns:

- **RAML Required** — Yes/No
- **RAML Delivery Date** — deadline
- **Assignee** — who's doing the design
- **Priority** — Critical/High/Medium/Low
- **Design Status** — your tracking (e.g., "In Progress", "Ready for Dev")
- **Handover** — notes for dev (e.g., link to design doc)

Everything else (Requirement Name, Stream, Status, Sprint, Jira Link) pulls live from Backlog — you'll see updates as soon as BA assigns a sprint.

Workflow: Backlog item → you fill in design info → BA assigns Sprint → DM assigns Release → dev team has everything.

---

## Email 3: BA/SM/DM — Sprint Planning Instructions

**Subject:** Sprint Planning — How to Assign Sprints

Hi BA/SM/DM team,

In **Sprint Planning**, your job is to:

1. **Assign Sprint** — pick the sprint (e.g., "Sprint 10") or leave as "To Plan" if not scheduled yet
2. **Enter HLE** — story point estimate (leave blank if not ready)

**What's automatic:** Once you assign a Sprint, the item:
- Appears in the **Release** sheet (so DM can assign a release)
- Updates **Roadmap** (shows total HLE per sprint)
- Shows up in **API Design Planning** and **RTM** with the sprint info

**To finish a sprint:** Mark items DONE in Backlog, and the archive automation will move them to the matching Quarterly Report (e.g., done in Sprint 10 → Q3).

**Tip:** Use Data > Sort to group by Sprint. The hidden "Sort Key" column keeps this stable — don't delete it.

---

## Email 4: Gabriele (DM) — Release Planning Instructions

**Subject:** Release Planning — Your Sheet

Hi Gabriele,

The **Release** sheet shows every item that has a Sprint assigned. Your job:

**Fill in:** Release — which product/version (e.g., "Release 15")

**You'll see automatically:**
- Requirement Name, Stream, Sprint, Status, Priority, HLE — all live from Backlog
- Only items with a real Sprint appear here (not "To Plan" items)

Once you assign a Release, the dev team knows: which sprint + which product release = full picture.

Also: you can still edit Release dates even after items are archived to the Quarterly Reports — useful for final reporting.

**To add a new release:**
1. Go to the **Lists** sheet (hidden sheet in the workbook)
2. Find column G (Releases)
3. Find the first blank row and type your new release name (e.g., "Release 13")
4. It automatically appears in the Release dropdown on the Release sheet

**Also check:** The **PI Governance (ROTB)** sheet shows all PI9/PI10/PI11/PI12 items (plus M4M-owned work) in one cross-cutting view — whether still active or archived. Shows ID, Stream, Sprint, Status, HLE, and progress notes (Jul 31, Aug 5, Aug 13). Use the filter dropdowns on each column header to slice by stream, sprint, status, or owner. Good for tracking PI commitments and workload.

---

## Email 5: Everyone — What Are These Tabs?

**Roadmap:** Auto-calculated view of total story points per sprint. Use this to see workload, plan capacity, talk to stakeholders.

**Q1/Q2/Q3/Q4 Quarterly Reports:** Archive destinations for DONE items (grouped by which sprint they completed, not the archive date). Read-only for most, editable for final reporting.

**PI Governance (ROTB):** Cross-cutting view of all PI9/PI10/PI11/PI12 items (plus M4M-owned work) — whether still active or archived. Has filtering dropdowns on every column. Tracks progress notes (Jul 31, Aug 5, Aug 13).

---

## Email 6: Automations — What's Working

✅ **Live sync:** Add an item to Backlog → it appears automatically in API Design Planning, Sprint Planning, RTM, Roadmap

✅ **Pull-through formulas:** Status, Sprint, Priority, Release, Jira Link all update live from their home sheets — change once, updates everywhere

✅ **Auto-generating IDs:** New items get NEW-XXXX IDs, never reused

✅ **Color coding by Stream:** Rows auto-shade by Stream (US, MyMSC, Growth, PI9-12, etc.)

✅ **Dropdowns:** Type, Stream, Status, Priority have pick-lists for consistency

✅ **Run Archive Done Items** (manual trigger):
- Click the **"Run Archive Done Items"** button in the workbook to archive all items marked DONE
- Archives to the matching Quarterly Report (Q1/Q2/Q3/Q4 based on their sprint)
- Removes them from Backlog, Sprint Planning, RTM, API Design Planning
- Keeps them in Release sheet for final reporting

🔄 **Coming soon (planned):**
- Jira ticket → auto-create Backlog row
- Trello card sync
- Auto-trigger archive when Status = DONE (currently manual click)

---

**Questions?** See the workbook README tab or ask Sarah.
