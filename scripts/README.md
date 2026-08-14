Reusable helper scripts for maintaining `../workbook/Backlog Tracker - EINT MuleSoft.xlsx`. One-off scripts (single hardcoded edits tied to a specific past request) live in `archive/` instead, kept for a historical record but not meant to be re-run.

- `recalc.py` — forces LibreOffice to recalculate all formulas in the workbook and re-save (openpyxl never computes formula values itself). Usage: `python3 recalc.py path/to/file.xlsx`.
- `fix_all_drift.py` — regenerates row-relative pull-through formulas (Sprint/Release/Name) across Sprint Planning, RTM, Release, and API Design Planning, correcting row-number drift left over from past row deletions. Re-run this any time that drift resurfaces.
- `build_dup_report.py` — regenerates the fuzzy-match Duplicate Review HTML report from `/tmp/dup_report_data.json`; republish via the Artifact tool afterward.

Standard verification routine after any edit to the workbook: recalc, then check (a) ID set diff, (b) no AutoFilter/Table conflicts, (c) every Table spans >=2 rows, (d) formulas' embedded row numbers match their actual row.
