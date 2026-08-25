/**
 * autoArchive.ts — Office Script for Excel Online / Power Automate
 *
 * For every Backlog row whose Status = "DONE" that isn't already in a
 * Quarter tab:
 *   1. Appends the row to the correct Quarter tab (Sprint 1–4 → Q1, etc.)
 *   2. Freezes formula-driven columns in the Release tab to literal values
 *   3. Deletes the row from Sprint Planning, RTM, API Design Planning
 *   4. Deletes the row from Backlog
 *
 * For every Backlog row whose Status = "NA" (no scope for MuleSoft) that
 * isn't already archived:
 *   1. Appends the row to the "No scope for MS" sheet
 *   2. Deletes any matching row from the Release tab (nothing to ship)
 *   3. Deletes the row from Sprint Planning, RTM, API Design Planning
 *   4. Deletes the row from Backlog
 * (Same removal treatment as DONE items — steps 3–4 are identical.)
 *
 * Run via: Automate tab → "Archive Done Items" button
 * Or trigger from Power Automate on a schedule / row-change event.
 *
 * Returns a summary string (visible in Power Automate run history).
 */

// Quarter tab column order — must match what was written by the bulk archive.
// A=ReqID  B=Name  C=Type  D=Stream  E=Owner  F=Status
// G=JiraLink  H=Priority  I=Sprint  J=Release  K=HLE
// (Jira Link is now a plain pasted URL, carried straight through from
// Backlog — there is no separate Jira Key column anywhere anymore.)
const Q_COLS = [
  "reqId", "name", "type", "stream", "owner", "status",
  "jiraLink", "priority", "sprint", "release", "hle",
] as const;
type QKey = typeof Q_COLS[number];

// Hardcoded quarter names (avoids Set/iterator spread which Office Scripts rejects)
const Q1 = "Q1 Backlog Report 2026";
const Q2 = "Q2 Backlog Report 2026";
const Q3 = "Q3 Backlog Report 2026";
const Q4 = "Q4 Backlog Report 2026";

// Fixed destination for Status="NA" items — same column order as the
// quarter tabs (Q_COLS), so the existing buildQRow/write logic works as-is.
const NA_SHEET = "No scope for MS";

const FREEZE_KEYS = ["name", "stream", "sprint", "status", "priority", "hle"] as const;
type FreezeKey = typeof FREEZE_KEYS[number];

interface ArchiveItem {
  reqId:        string;
  blRow:        number;   // index into blVals (1-based, 0 = header)
  quarterSheet: string | null;   // null = destined for the NA_SHEET, not a quarter
  name:         string;
  type:         string;
  stream:       string;
  owner:        string;
  status:       string;
  priority:     string | number | boolean;
  sprint:       string;
  hle:          string | number | boolean;
  jiraLink:     string;
  release:      string | number | boolean;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(workbook: ExcelScript.Workbook): string {

  // Sprint number → Quarter sheet name
  const QUARTER: Record<number, string> = {};
  for (let i = 1;  i <= 4;  i++) QUARTER[i] = Q1;
  for (let i = 5;  i <= 8;  i++) QUARTER[i] = Q2;
  for (let i = 9;  i <= 12; i++) QUARTER[i] = Q3;
  for (let i = 13; i <= 16; i++) QUARTER[i] = Q4;

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 1 — READ ALL DATA UPFRONT
  // All Excel API reads happen here, before any processing loops.
  // ════════════════════════════════════════════════════════════════════════════

  // Quarter sheets — values + next available row
  const q1Ws   = workbook.getWorksheet(Q1);
  const q2Ws   = workbook.getWorksheet(Q2);
  const q3Ws   = workbook.getWorksheet(Q3);
  const q4Ws   = workbook.getWorksheet(Q4);
  const q1Used = q1Ws.getUsedRange();
  const q2Used = q2Ws.getUsedRange();
  const q3Used = q3Ws.getUsedRange();
  const q4Used = q4Ws.getUsedRange();
  const q1Vals = q1Used ? q1Used.getValues() : [] as (string | number | boolean)[][];
  const q2Vals = q2Used ? q2Used.getValues() : [] as (string | number | boolean)[][];
  const q3Vals = q3Used ? q3Used.getValues() : [] as (string | number | boolean)[][];
  const q4Vals = q4Used ? q4Used.getValues() : [] as (string | number | boolean)[][];
  // Next free row (0-based worksheet row index) for each quarter tab
  const q1Next = q1Used ? q1Used.getRowIndex() + q1Used.getRowCount() : 0;
  const q2Next = q2Used ? q2Used.getRowIndex() + q2Used.getRowCount() : 0;
  const q3Next = q3Used ? q3Used.getRowIndex() + q3Used.getRowCount() : 0;
  const q4Next = q4Used ? q4Used.getRowIndex() + q4Used.getRowCount() : 0;

  // "No scope for MS" sheet — same read pattern as the quarter tabs above
  const naWs   = workbook.getWorksheet(NA_SHEET);
  const naUsed = naWs.getUsedRange();
  const naVals = naUsed ? naUsed.getValues() : [] as (string | number | boolean)[][];
  const naNext = naUsed ? naUsed.getRowIndex() + naUsed.getRowCount() : 0;

  // Backlog
  const blWs   = workbook.getWorksheet("Backlog");
  const blUsed = blWs.getUsedRange();
  if (!blUsed) return "Backlog sheet appears empty.";
  const blVals  = blUsed.getValues();
  const blStart = blUsed.getRowIndex();
  const blTables = blWs.getTables();
  const blTable  = blTables.length > 0 ? blTables[0] : null;
  const blHdrRow = blTable ? blTable.getHeaderRowRange().getRowIndex() : blStart;
  const blTblBodyRow = blHdrRow + 1;

  // Sprint Planning
  const spWs   = workbook.getWorksheet("Sprint Planning");
  const spUsed = spWs.getUsedRange();
  const spVals = spUsed ? spUsed.getValues() : [] as (string | number | boolean)[][];
  const spStart = spUsed ? spUsed.getRowIndex() : 0;
  const spTables = spWs.getTables();
  const spTable  = spTables.length > 0 ? spTables[0] : null;
  const spHdrRow = spTable ? spTable.getHeaderRowRange().getRowIndex() : spStart;
  const spTblBodyRow = spHdrRow + 1;

  // RTM
  const rtmWs   = workbook.getWorksheet("RTM");
  const rtmUsed = rtmWs ? rtmWs.getUsedRange() : null;
  const rtmVals = rtmUsed ? rtmUsed.getValues() : [] as (string | number | boolean)[][];
  const rtmStart = rtmUsed ? rtmUsed.getRowIndex() : 0;
  const rtmTables = rtmWs ? rtmWs.getTables() : [];
  const rtmTable  = rtmTables.length > 0 ? rtmTables[0] : null;
  const rtmHdrRow = rtmTable ? rtmTable.getHeaderRowRange().getRowIndex() : rtmStart;
  const rtmTblBodyRow = rtmHdrRow + 1;

  // API Design Planning
  const apiWs   = workbook.getWorksheet("API Design Planning");
  const apiUsed = apiWs ? apiWs.getUsedRange() : null;
  const apiVals = apiUsed ? apiUsed.getValues() : [] as (string | number | boolean)[][];
  const apiStart = apiUsed ? apiUsed.getRowIndex() : 0;
  const apiTables = apiWs ? apiWs.getTables() : [];
  const apiTable  = apiTables.length > 0 ? apiTables[0] : null;
  const apiHdrRow = apiTable ? apiTable.getHeaderRowRange().getRowIndex() : apiStart;
  const apiTblBodyRow = apiHdrRow + 1;

  // Lists (holds the ID High-Water Mark used by Backlog's ID-generation formula)
  const listsWs = workbook.getWorksheet("Lists");
  const hwmCell = listsWs.getRange("N2");
  const currentHwm = Number(hwmCell.getValue()) || 0;

  // Release
  const relWs   = workbook.getWorksheet("Release");
  const relUsed = relWs.getUsedRange();
  const relVals = relUsed ? relUsed.getValues() : [] as (string | number | boolean)[][];
  const relStart = relUsed ? relUsed.getRowIndex() : 0;
  const relHdr  = relVals.length > 0 ? relVals[0].map(v => asStr(v).toLowerCase()) : [];
  const relIdCol  = colWith(relHdr, ["req", "id"]) ?? 0;
  const relRelCol = colWith(relHdr, ["release"]);
  const freezeCols = FREEZE_KEYS.map(k => colWith(relHdr, [k]));
  const relTables = relWs.getTables();
  const relTable  = relTables.length > 0 ? relTables[0] : null;
  const relHdrRow = relTable ? relTable.getHeaderRowRange().getRowIndex() : relStart;
  const relTblBodyRow = relHdrRow + 1;

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 2 — PROCESS IN MEMORY (pure JavaScript, no Excel API calls)
  // ════════════════════════════════════════════════════════════════════════════

  // Collect already-archived IDs from all four quarter tabs AND the NA sheet —
  // an item counts as "already archived" regardless of which destination it
  // landed in, so re-runs never duplicate it and the Backlog orphan-cleanup
  // below also catches leftover NA rows.
  const archived = new Set<string>();
  const allQVals = [q1Vals, q2Vals, q3Vals, q4Vals, naVals];
  for (const qv of allQVals) {
    for (let r = 1; r < qv.length; r++) {
      const id = asStr(qv[r][0]);
      if (id) archived.add(id);
    }
  }

  // Build sprint lookup map from Sprint Planning
  const spHdr   = spVals.length > 0 ? spVals[0].map(v => asStr(v).toLowerCase()) : [];
  const spIdCol = colWith(spHdr, ["req", "id"]) ?? 0;
  const spSpCol = colWith(spHdr, ["sprint"]);
  if (spSpCol === null) return 'ERROR: "Sprint" column not found in Sprint Planning.';

  const sprintMap = new Map<string, string>();
  for (let r = 1; r < spVals.length; r++) {
    const id = asStr(spVals[r][spIdCol]);
    if (id) sprintMap.set(id, asStr(spVals[r][spSpCol]));
  }

  // Find DONE and NA rows in Backlog not yet archived
  // Backlog columns (0-based): 0=ReqID 1=Name 2=Type 3=Stream 4=Owner 5=Status
  //                            6=Priority 9=HLE 13=JiraLink (plain pasted URL)
  const items: ArchiveItem[] = [];
  const skipped: string[] = [];

  for (let r = 1; r < blVals.length; r++) {
    const reqId  = asStr(blVals[r][0]);
    const status = asStr(blVals[r][5]).toUpperCase();
    if (!reqId || archived.has(reqId)) continue;
    if (status !== "DONE" && status !== "NA") continue;

    const sprint = sprintMap.get(reqId) ?? asStr(blVals[r][8]);

    // DONE items route to whichever quarter their sprint maps to; NA items
    // always go to the single fixed NA_SHEET (quarterSheet = null marks this).
    let qName: string | null = null;
    if (status === "DONE") {
      const sprintNo = firstInt(sprint);
      qName = sprintNo !== null ? (QUARTER[sprintNo] ?? null) : null;
      if (!qName) {
        skipped.push(`${reqId} (sprint="${sprint}")`);
        continue;
      }
    }
    // status === "NA": qName stays null → destined for NA_SHEET

    items.push({
      reqId,
      blRow:        r,
      quarterSheet: qName,
      name:         asStr(blVals[r][1]),
      type:         asStr(blVals[r][2]),
      stream:       asStr(blVals[r][3]),
      owner:        asStr(blVals[r][4]),
      status:       asStr(blVals[r][5]),
      priority:     blVals[r][6] as string | number | boolean,
      sprint,
      hle:          blVals[r][9] as string | number | boolean,
      jiraLink:     asStr(blVals[r][13]),
      release:      "",
    });
  }

  if (!items.length && !skipped.length) {
    console.log("Nothing to archive — no new Done or NA items found.");
    return "Nothing to archive.";
  }

  // Look up Release value for DONE items only — NA items have their Release
  // row deleted outright below, not frozen, so no lookup is needed for them.
  for (let r = 1; r < relVals.length; r++) {
    const id = asStr(relVals[r][relIdCol]);
    const item = items.find(i => i.reqId === id && i.quarterSheet !== null);
    if (!item || relRelCol === null) continue;
    item.release = relVals[r][relRelCol] as string | number | boolean;
  }

  // Build set of req IDs being archived (for row deletion lookups)
  const archivingIds = new Set<string>(items.map(i => i.reqId));

  // Every "NEW-XXXX" ID being archived is about to disappear from Backlog's own
  // ID column (P), which is what the ID-generation formula scans to find the
  // "next" ID. If we don't also bump the persistent high-water mark (Lists!N2)
  // to cover these now-archived IDs, a future new item could compute the exact
  // same ID that just got archived — a real duplicate. So: compute the highest
  // NEW-XXXX number among the items we're archiving this run, and raise the
  // high-water mark to at least that value.
  let maxArchivedNum = 0;
  for (const id of archivingIds) {
    const m = id.match(/^NEW-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxArchivedNum) maxArchivedNum = n;
    }
  }
  const newHwm = Math.max(currentHwm, maxArchivedNum);

  // Group items by quarter sheet (for batch writes); NA items go to forNA
  const forQ1 = items.filter(i => i.quarterSheet === Q1);
  const forQ2 = items.filter(i => i.quarterSheet === Q2);
  const forQ3 = items.filter(i => i.quarterSheet === Q3);
  const forQ4 = items.filter(i => i.quarterSheet === Q4);
  const forNA = items.filter(i => i.quarterSheet === null);
  const naArchivingIds = new Set<string>(forNA.map(i => i.reqId));

  // Build Release row updates: clone existing row values, overwrite freeze
  // cols. DONE items only — an NA item's Release row (if any) is deleted
  // outright further down, not frozen.
  interface RelUpdate { wsRow: number; rowData: (string | number | boolean)[]; }
  const relUpdates: RelUpdate[] = [];
  for (let r = 1; r < relVals.length; r++) {
    const id   = asStr(relVals[r][relIdCol]);
    const item = items.find(i => i.reqId === id && i.quarterSheet !== null);
    if (!item) continue;
    const updRow = relVals[r].map(v => v) as (string | number | boolean)[];
    const vals: Record<FreezeKey, string | number | boolean> = {
      name: item.name, stream: item.stream, sprint: item.sprint,
      status: item.status, priority: item.priority, hle: item.hle,
    };
    FREEZE_KEYS.forEach((key, i) => {
      const col = freezeCols[i];
      if (col !== null) updRow[col] = vals[key];
    });
    relUpdates.push({ wsRow: relStart + r, rowData: updRow });
  }

  // NA items: delete their Release row outright (nothing to ship), rather
  // than freezing it. Reuses the same rowsToDelete/deleteTableRows machinery
  // used for Sprint Planning/RTM/API Design Planning below.
  const relDelRows = rowsToDelete(relVals, relStart, relIdCol, naArchivingIds);

  // Collect rows to delete per sheet (0-based worksheet row, sorted bottom-up)
  const spDelRows  = rowsToDelete(spVals,  spStart,  spIdCol,  archivingIds);
  const rtmDelRows = rowsToDelete(rtmVals, rtmStart, colWith(rtmVals.length > 0 ? rtmVals[0].map(v => asStr(v).toLowerCase()) : [], ["req", "id"]) ?? 0, archivingIds);
  const apiDelRows = rowsToDelete(apiVals, apiStart, colWith(apiVals.length > 0 ? apiVals[0].map(v => asStr(v).toLowerCase()) : [], ["req", "id"]) ?? 0, archivingIds);
  const blDelRows  = rowsToDelete(blVals,  blStart,  0,        archivingIds);

  // CLEANUP: Also collect Backlog rows that are already archived but still present (orphaned)
  const blOrphanedRows = rowsToDelete(blVals, blStart, 0, archived);
  const blAllDelRows = [...new Set([...blDelRows, ...blOrphanedRows])].sort((a, b) => b - a);

  console.log(`Items to archive: ${archivingIds.size} | Rows to delete from Backlog: ${blDelRows.length} (new) + ${blOrphanedRows.length} (orphaned)`);

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 3 — WRITE ALL CHANGES
  // Batch writes where possible; row deletes loop bottom-up per sheet.
  // ════════════════════════════════════════════════════════════════════════════

  // 1. Append to quarter tabs and the NA sheet (one setValues call each)
  if (forQ1.length) q1Ws.getRangeByIndexes(q1Next, 0, forQ1.length, Q_COLS.length).setValues(forQ1.map(i => buildQRow(i)));
  if (forQ2.length) q2Ws.getRangeByIndexes(q2Next, 0, forQ2.length, Q_COLS.length).setValues(forQ2.map(i => buildQRow(i)));
  if (forQ3.length) q3Ws.getRangeByIndexes(q3Next, 0, forQ3.length, Q_COLS.length).setValues(forQ3.map(i => buildQRow(i)));
  if (forQ4.length) q4Ws.getRangeByIndexes(q4Next, 0, forQ4.length, Q_COLS.length).setValues(forQ4.map(i => buildQRow(i)));
  if (forNA.length) naWs.getRangeByIndexes(naNext, 0, forNA.length, Q_COLS.length).setValues(forNA.map(i => buildQRow(i)));

  // 2. Freeze Release tab rows for DONE items (one setValues call per item)
  for (const u of relUpdates) {
    relWs.getRangeByIndexes(u.wsRow, 0, 1, u.rowData.length).setValues([u.rowData]);
  }

  // 3. Delete rows from supporting sheets, then Backlog (bottom-up per sheet).
  // Strategy: use deleteRowsAt for table rows with bounds checking, fall back to range.delete()

  // Helper to safely delete from a table (used for Sprint Planning, RTM, API Design Planning)
  function deleteTableRows(
    ws: ExcelScript.Worksheet,
    tbl: ExcelScript.Table | null,
    tblBodyRow: number,
    wsRows: number[],
    sheetName: string
  ) {
    if (!tbl || wsRows.length === 0) return;
    const debugLogs: string[] = [];
    for (const r of wsRows) {
      const bodyRelIdx = r - tblBodyRow;
      debugLogs.push(`deleteRowsAt(${bodyRelIdx}) from ${sheetName} row ${r + 1}`);
      if (bodyRelIdx < 0) {
        debugLogs.push(`WARN: bodyRelIdx=${bodyRelIdx} negative, skipping`);
        continue;
      }
      try {
        tbl.deleteRowsAt(bodyRelIdx, 1);
      } catch (e) {
        debugLogs.push(`ERROR deleteRowsAt: ${e}`);
      }
    }
    if (debugLogs.length > 0) console.log(debugLogs.join(" | "));
  }

  // Reapply an inline dropdown-list validation to a single cell.
  function reapplyListValidation(ws: ExcelScript.Worksheet, cellAddress: string, values: string) {
    const dv = ws.getRange(cellAddress).getDataValidation();
    dv.clear();
    dv.setRuleObject({
      list: {
        inCellDropDown: true,
        source: values
      }
    });
  }

  // Backlog: genuine table row deletion (same mechanism as Sprint Planning/RTM/
  // API Design Planning). A real deleteRowsAt contracts the table and shifts
  // every row below up by one — Excel adjusts row-relative references
  // automatically as part of that shift, so there is no need to separately
  // "clear and reseed" a row for reuse the way an earlier version of this
  // script did. That clear-based approach is kept only as a fallback in case
  // deleteRowsAt ever fails again (it did once before, when the table's ref
  // and column-count were out of sync — now fixed).
  function deleteBacklogRows(ws: ExcelScript.Worksheet, tbl: ExcelScript.Table | null, tblBodyRow: number, wsRows: number[]) {
    if (wsRows.length === 0) {
      console.log("deleteBacklogRows: no rows to delete.");
      return;
    }
    const debugLogs: string[] = [];
    for (const r of wsRows) {
      const row = r + 1;
      const bodyRelIdx = r - tblBodyRow;
      debugLogs.push(`deleteRowsAt(${bodyRelIdx}) from Backlog row ${row}`);
      let deleted = false;
      if (tbl && bodyRelIdx >= 0) {
        try {
          tbl.deleteRowsAt(bodyRelIdx, 1);
          deleted = true;
        } catch (e) {
          debugLogs.push(`deleteRowsAt failed on row ${row}: ${e} — falling back to clear`);
        }
      }
      if (!deleted) {
        // Fallback: clear contents only (preserves formatting/validation),
        // then re-seed Q and reapply dropdowns explicitly.
        try {
          ws.getRange(`B${row}:H${row}`).clear(ExcelScript.ClearApplyTo.Contents);
          ws.getRange(`J${row}:J${row}`).clear(ExcelScript.ClearApplyTo.Contents);
          ws.getRange(`L${row}:N${row}`).clear(ExcelScript.ClearApplyTo.Contents);
          const genFormula = `=IF(B${row}="","","NEW-"&TEXT(MAX($P$2:$P${r},Lists!$N$2)+1,"0000"))`;
          try {
            ws.getRange(`Q${row}`).setFormula(genFormula);
          } catch (e2) {
            debugLogs.push(`Q${row} setFormula also failed: ${e2} — leaving Q as-is`);
          }
          reapplyListValidation(ws, `C${row}`, "Config,CR,New,TBC,Bug,Tech Task,Tech Story");
          reapplyListValidation(ws, `D${row}`, "US,MyMSC,Growth,MVP Rollout,Cross,PI11,PI12,Backlog,Tech Enhancements,PP,HR,PI9,PI10,M4M");
          reapplyListValidation(ws, `E${row}`, "ALL,DTS,MA,B2CW,S&S,EPAM B2C,CHUB,CRMASIS,M4M");
          reapplyListValidation(ws, `F${row}`, "NEW,IN PROGRESS,DONE,ON HOLD,NA");
          reapplyListValidation(ws, `G${row}`, "Critical,High,Medium,Low");
          reapplyListValidation(ws, `M${row}`, "Yes,Created");
          debugLogs.push(`Fell back to clear on row ${row}`);
        } catch (e3) {
          debugLogs.push(`ERROR: fallback clear also failed on row ${row}: ${e3}`);
        }
      } else {
        debugLogs.push(`Deleted row ${row} via table row removal`);
      }
    }
    console.log(debugLogs.join(" | "));
  }

  deleteTableRows(spWs, spTable, spTblBodyRow, spDelRows, "Sprint Planning");
  deleteTableRows(rtmWs, rtmTable, rtmTblBodyRow, rtmDelRows, "RTM");
  deleteTableRows(apiWs, apiTable, apiTblBodyRow, apiDelRows, "API Design Planning");
  deleteTableRows(relWs, relTable, relTblBodyRow, relDelRows, "Release (NA items only)");
  deleteBacklogRows(blWs, blTable, blTblBodyRow, blAllDelRows);

  // 4. Bump the ID High-Water Mark if this run archived anything with a higher
  // NEW-XXXX number than what's currently recorded — prevents future new items
  // from reusing an ID that just got archived.
  if (newHwm > currentHwm) {
    hwmCell.setValue(newHwm);
    console.log(`ID High-Water Mark bumped: ${currentHwm} -> ${newHwm}`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const doneCount = items.length - forNA.length;
  const dest = [
    forQ1.length ? `${forQ1.length}→Q1` : "",
    forQ2.length ? `${forQ2.length}→Q2` : "",
    forQ3.length ? `${forQ3.length}→Q3` : "",
    forQ4.length ? `${forQ4.length}→Q4` : "",
  ].filter(s => !!s).join(", ");

  const summary = [
    doneCount ? `Archived ${doneCount} item(s)${dest ? ` (${dest})` : ""}.` : "",
    forNA.length ? `Archived ${forNA.length} item(s) to "${NA_SHEET}".` : "",
    skipped.length ? `Skipped ${skipped.length}: ${skipped.join("; ")}.` : "",
  ].filter(s => !!s).join(" ");

  console.log(summary);
  return summary;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Coerce any cell value to a trimmed string. */
function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

/** Extract the first integer from a string like "Sprint 5" → 5. */
function firstInt(s: string): number | null {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/** First column index (0-based) whose lowercased header contains any keyword. */
function colWith(headers: string[], keywords: string[]): number | null {
  for (let i = 0; i < headers.length; i++) {
    if (keywords.some(k => headers[i].includes(k))) return i;
  }
  return null;
}

/** Build a Quarter tab row array from an ArchiveItem. */
function buildQRow(item: ArchiveItem): (string | number | boolean)[] {
  return Q_COLS.map(key => {
    const v = item[key as QKey];
    return (v === null || v === undefined) ? "" : v as string | number | boolean;
  });
}

/**
 * Return 0-based worksheet row indices (sorted bottom-up) for all rows in
 * vals whose ID column matches archivingIds. Bottom-up order ensures that
 * deleting row N doesn't shift the index of row N-1 before it is processed.
 */
function rowsToDelete(
  vals: (string | number | boolean)[][],
  wsStartRow: number,
  idCol: number,
  archivingIds: Set<string>
): number[] {
  const wsRows: number[] = [];
  for (let r = 1; r < vals.length; r++) {
    if (archivingIds.has(asStr(vals[r][idCol]))) {
      wsRows.push(wsStartRow + r);
    }
  }
  return wsRows.sort((a, b) => b - a);
}
