# MSC Backlog Tracker

A single source-of-truth Excel workbook for the EINT MuleSoft integration team's backlog, replacing two legacy files (`MuleSoft Team - Planning.xlsx` and `Requirements Traceability Matrix - EINT Mulesoft 2026.xlsx`).

The golden rule: every field has exactly one home tab where it's entered — every other tab shows it as a live formula pull. Full design details, tab ownership, and current status: see [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md). The same overview also lives as the "README" worksheet inside the workbook itself.

## Folder layout

- [`workbook/`](workbook/) — the live `.xlsx` file. Open this to work on the backlog.
- [`diagrams/`](diagrams/) — process-flow diagram for the workbook's tab relationships and planned automations.
- [`memory/`](memory/) — supporting reference data (e.g. the T-shirt-size-to-story-point conversion table).
- [`scripts/`](scripts/) — reusable Python maintenance scripts (recalculation, formula-drift fixes, duplicate-review report). One-off scripts from past requests are kept in `scripts/archive/` for a historical record only.
