# Backlog Tracker — Team Instructions

## 1. Adding Items to Backlog (Everyone)

**Where:** Open the workbook → go to the **Backlog** sheet

**What to do:**
- Find a blank row at the bottom
- Fill in: **Requirement Name** (what it does), **Type** (Config/CR/New/TBC/Bug/Tech Task/Tech Story), **Stream** (which team/initiative), **Status** (NEW/IN PROGRESS/DONE/ON HOLD/NA)
- Optional: add **Priority** (Critical/High/Medium/Low) — if you don't, it shows as empty
- If there's a Jira ticket for this item, copy its link from Jira and paste it directly into the **Jira Link** column — no need to type a key, just paste the link

**What NOT to edit:**
- **Requirement ID** column — auto-fills as NEW-0001, NEW-0002, etc. (don't touch)
- Any column that's shaded/bold — these are formula-driven and pull from other sheets

**What happens next:**
- Your item appears automatically in **API Design Planning, Sprint Planning, RTM, Roadmap** — no copy-paste needed, it's live
- Once you assign it a **Sprint**, it also appears in **Release** (for DM to assign a release date)
- Once you mark it **DONE** and run archive, it moves to the matching **Quarterly Report** (e.g., done in Sprint 10 → Q3)

---

## 2. API Design Planning — For Clare (Head of API Design)

**Where:** **API Design Planning** sheet

**Your job:** Specify the design work needed for each requirement.

**What to fill in (your columns):**
- **RAML Required** — Yes/No, does this need a RAML spec?
- **RAML Delivery Date** — when it's due
- **Assignee** — who's doing the design work
- **Priority** — Critical/High/Medium/Low
- **Design Status** — your tracking (e.g., "In Progress", "Ready for Dev", "Blocked")
- **Handover** — notes for the developer (e.g., "See attached design doc")

**What you'll see automatically (read-only):**
- **Requirement Name, Stream, Status, Sprint, Jira Link** — these pull live from Backlog, so they're always current
- If a requirement hasn't been assigned a Sprint yet, those cells stay blank — they'll populate as soon as Sprint Planning assigns one

**Workflow:**
1. BA/PO adds the item to Backlog
2. You fill in your RAML/design columns
3. BA assigns Sprint in Sprint Planning
4. DM assigns Release in Release sheet
5. Dev team sees everything they need (your design info + their sprint/release)

---

## 3. Sprint Planning — For BA/SM/DM

**Where:** **Sprint Planning** sheet

**Your job:** Assign sprints and track effort (HLE) for each item.

**What to fill in (your columns):**
- **Sprint** — which sprint (e.g., "Sprint 10", "To Plan" for unscheduled items)
- **HLE** — effort estimate in story points (leave blank if not estimated yet)

**Workflow:**
1. Once an item is in Backlog, it appears here automatically
2. You assign Sprint and HLE
3. Everything else updates automatically:
   - **Release** sheet gets the item (so DM can assign a release)
   - **Roadmap** recalculates HLE totals per sprint
   - **API Design Planning** and **RTM** see the sprint assignment
4. When you're ready to close out a sprint, mark items DONE in Backlog — the next auto-archive run will move them to the quarterly report for that quarter

**Pro tip:** Sort by Sprint (Data > Sort) to group items by sprint. The "Sort Key" column is hidden but keeps the sort stable — don't unhide or delete it.

---

## 4. Release Planning — For DM (Gabriele)

**Where:** **Release** sheet

**Your job:** Assign releases to items that have a sprint.

**What to fill in (your columns):**
- **Release** — which release (e.g., "Release 15", "Release 16")

**What you'll see automatically (read-only):**
- **Requirement Name, Stream, Sprint, Status, Priority, HLE** — pulled live from their home sheets
- **Only items with a real Sprint assigned appear here** — items still marked "To Plan" in Sprint Planning won't show in Release yet

**Workflow:**
1. BA assigns Sprint in Sprint Planning
2. Item automatically appears in Release
3. You assign Release (which product/release version it ships with)
4. Dev team knows: which sprint they're working on, which release it's shipping in

**To add a new release:**
1. Go to the **Lists** sheet (hidden sheet in the workbook)
2. Find column G, which lists all releases (Release 5, Release 7, Release 12, etc.)
3. Find the first blank row in column G and type your new release name (e.g., "Release 13")
4. The new release automatically appears in the Release dropdown on the Release sheet — no refresh needed

**Also useful for DM:** The **PI Governance (ROTB)** sheet is a cross-cutting view of all PI9/PI10/PI11/PI12 items (plus M4M-owned work) — whether active in Backlog or archived in Quarterly Reports. Shows: ID, Stream, Stream Owner, Sprint, Status, HLE, and progress notes (Jul 31, Aug 5, Aug 13). Has filtering dropdowns on every column header. Use this to track PI-specific commitments, workload per PI, and which releases they're tied to.

---

## 5. Roadmap & Release Tabs (View-only for most)

**Roadmap sheet:** Shows total HLE (story points) per sprint. Auto-calculates as soon as BA enters Sprint + HLE in Sprint Planning. Use this to see capacity per sprint, plan workload, communicate to stakeholders.

**Q1/Q2/Q3/Q4 Quarterly Report sheets:** Archive destinations for finished items. When an item is marked DONE and you run the archive automation, it moves here (grouped by which sprint it completed in, not archive date). DM can still edit Release dates after items are archived — useful for final reporting.

**PI Governance (ROTB) sheet:** Special cross-cutting view of all PI9/PI10/PI11/PI12 items (plus M4M-owned items) in one place — whether they're still active or already archived. Has built-in filtering on every column (click the header dropdowns). Shows notes from Jul 31, Aug 5, Aug 13 for tracking progress across iterations.

---

## 6. Current Automations (In Place)

✅ **Live auto-sync:** Any item you add to Backlog appears automatically in all other sheets (API Design Planning, RTM, Sprint Planning) — no manual copy-paste.

✅ **Live pull-through formulas:** Status, Sprint, Priority, Release, Jira Link, HLE all pull live from their home sheets — change it once, it updates everywhere.

✅ **Requirement ID auto-generation:** New items get a NEW-XXXX ID automatically, never reused even after archiving.

✅ **Conditional formatting:** Rows automatically shade by Stream (US, MyMSC, Growth, PI9/PI10/PI11/PI12, Tech Enhancements, etc.) — helps visually group work.

✅ **Data validation dropdowns:** Type, Stream, Status, Priority, Release columns have dropdowns so you pick from a consistent list.

✅ **Run Archive Done Items** (manual button):
- Look for the **"Run Archive Done Items"** button in the workbook (Workflows tab or visible location)
- Click it to archive all items marked DONE to the matching Quarterly Report (Q1/Q2/Q3/Q4 based on their sprint)
- Removes them from Backlog, Sprint Planning, RTM, API Design Planning
- Keeps them in Release sheet for final reporting
- Updates the Requirement ID high-water mark to prevent ID collisions
- Check the console output to see which items were archived

🔄 **Planned (not yet wired up):**
- Jira integration: label a Jira ticket, auto-create a Backlog row with Jira Link filled in
- Trello sync: new Backlog item → auto-create Trello card; change sprint → update Trello
- Auto-trigger archive: mark Status = DONE → automatically run archive (currently requires manual click)

---

## Questions?

Refer to the workbook **README** tab for a quick visual overview, or ask Sarah.
