import json

with open("/tmp/dup_report_data.json") as f:
    data = json.load(f)

total_backlog = 243
exact_items = sum(len(c) for c in data["exact_clusters"])

html = f"""<title>Backlog Duplicate Review</title>
<style>
:root {{
  --bg: #f5f6f8;
  --surface: #ffffff;
  --surface-2: #eef0f3;
  --ink: #1b2430;
  --muted: #5b6472;
  --faint: #8a93a3;
  --border: #dfe3e8;
  --accent: #1f4e78;
  --accent-ink: #ffffff;
  --exact: #b3261e;
  --exact-bg: #fbeae9;
  --exact-border: #f0c9c6;
  --high: #a15c00;
  --high-bg: #fdf2df;
  --high-border: #f0dcb0;
  --mod: #375a7f;
  --mod-bg: #eaf1f8;
  --mod-border: #cddceb;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Consolas, monospace;
  --sans: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}}
@media (prefers-color-scheme: dark) {{
  :root {{
    --bg: #14171c; --surface: #1b1f26; --surface-2: #242832; --ink: #e6e9ee; --muted: #a3acb9;
    --faint: #6f7885; --border: #2d323c; --accent: #5b9bd5; --accent-ink: #0d1420;
    --exact: #ff8f87; --exact-bg: #3a1f1d; --exact-border: #5c2d29;
    --high: #f0b94d; --high-bg: #3a2e14; --high-border: #5c491f;
    --mod: #8ab4e0; --mod-bg: #1c2b3a; --mod-border: #2c405a;
  }}
}}
:root[data-theme="dark"] {{
  --bg: #14171c; --surface: #1b1f26; --surface-2: #242832; --ink: #e6e9ee; --muted: #a3acb9;
  --faint: #6f7885; --border: #2d323c; --accent: #5b9bd5; --accent-ink: #0d1420;
  --exact: #ff8f87; --exact-bg: #3a1f1d; --exact-border: #5c2d29;
  --high: #f0b94d; --high-bg: #3a2e14; --high-border: #5c491f;
  --mod: #8ab4e0; --mod-bg: #1c2b3a; --mod-border: #2c405a;
}}
:root[data-theme="light"] {{
  --bg: #f5f6f8; --surface: #ffffff; --surface-2: #eef0f3; --ink: #1b2430; --muted: #5b6472;
  --faint: #8a93a3; --border: #dfe3e8; --accent: #1f4e78; --accent-ink: #ffffff;
  --exact: #b3261e; --exact-bg: #fbeae9; --exact-border: #f0c9c6;
  --high: #a15c00; --high-bg: #fdf2df; --high-border: #f0dcb0;
  --mod: #375a7f; --mod-bg: #eaf1f8; --mod-border: #cddceb;
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font-family: var(--sans); }}
.wrap {{ max-width: 1180px; margin: 0 auto; padding: 0 24px 64px; }}

.topbar {{
  position: sticky; top: 0; z-index: 10; background: var(--bg);
  border-bottom: 1px solid var(--border); padding: 20px 0 16px;
}}
h1 {{ font-size: 1.5rem; margin: 0 0 4px; letter-spacing: -0.01em; text-wrap: balance; }}
.subtitle {{ color: var(--muted); font-size: 0.9rem; margin: 0 0 16px; }}

.stats {{ display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }}
.stat {{
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 8px 14px; font-size: 0.82rem; color: var(--muted); display: flex; align-items: baseline; gap: 6px;
}}
.stat b {{ font-family: var(--mono); font-size: 1rem; color: var(--ink); font-variant-numeric: tabular-nums; }}

.controls {{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }}
#search {{
  flex: 1; min-width: 220px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 9px 12px; color: var(--ink); font-size: 0.9rem; font-family: var(--sans);
}}
#search:focus {{ outline: 2px solid var(--accent); outline-offset: -1px; }}
.chip {{
  border: 1px solid var(--border); background: var(--surface); color: var(--muted);
  border-radius: 999px; padding: 7px 14px; font-size: 0.82rem; cursor: pointer; user-select: none;
  display: flex; align-items: center; gap: 6px; transition: border-color .12s, color .12s;
}}
.chip:hover {{ border-color: var(--faint); }}
.chip[aria-pressed="true"] {{ border-color: currentColor; font-weight: 600; }}
.chip.t-exact[aria-pressed="true"] {{ color: var(--exact); background: var(--exact-bg); }}
.chip.t-high[aria-pressed="true"] {{ color: var(--high); background: var(--high-bg); }}
.chip.t-mod[aria-pressed="true"] {{ color: var(--mod); background: var(--mod-bg); }}
.chip .n {{ font-family: var(--mono); font-variant-numeric: tabular-nums; }}

main {{ padding-top: 22px; display: flex; flex-direction: column; gap: 14px; }}

.group {{
  background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--tier-color);
  border-radius: 10px; padding: 14px 16px;
}}
.group.tier-exact {{ --tier-color: var(--exact); }}
.group.tier-high {{ --tier-color: var(--high); }}
.group.tier-mod {{ --tier-color: var(--mod); }}

.group-head {{ display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }}
.badge {{
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  border-radius: 5px; padding: 2px 7px;
}}
.tier-exact .badge {{ color: var(--exact); background: var(--exact-bg); }}
.tier-high .badge {{ color: var(--high); background: var(--high-bg); }}
.tier-mod .badge {{ color: var(--mod); background: var(--mod-bg); }}
.score {{ font-family: var(--mono); font-size: 0.78rem; color: var(--faint); font-variant-numeric: tabular-nums; }}
.name {{ font-weight: 600; font-size: 0.95rem; text-wrap: balance; }}

table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
th {{
  text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--faint); font-weight: 600; padding: 5px 8px; border-bottom: 1px solid var(--border);
}}
td {{ padding: 6px 8px; border-bottom: 1px solid var(--surface-2); vertical-align: top; }}
tr:last-child td {{ border-bottom: none; }}
.id {{ font-family: var(--mono); color: var(--accent); font-size: 0.82rem; white-space: nowrap; }}
.rowname {{ max-width: 420px; }}
.pill {{
  display: inline-block; font-size: 0.72rem; padding: 1px 7px; border-radius: 5px;
  background: var(--surface-2); color: var(--muted); white-space: nowrap;
}}
.empty {{ color: var(--muted); text-align: center; padding: 60px 0; font-size: 0.9rem; }}

.overflow {{ overflow-x: auto; }}
</style>

<div class="wrap">
  <div class="topbar">
    <h1>Backlog Duplicate Review</h1>
    <p class="subtitle">Fuzzy-matched by Requirement Name across {total_backlog} Backlog items &mdash; review each group and delete what's confirmed as a duplicate.</p>
    <div class="stats">
      <div class="stat"><b>{len(data['exact_clusters'])}</b> exact-match groups</div>
      <div class="stat"><b>{exact_items}</b> items in exact groups</div>
      <div class="stat"><b>{len(data['high_pairs'])}</b> high-confidence pairs</div>
      <div class="stat"><b>{len(data['moderate_pairs'])}</b> moderate pairs</div>
    </div>
    <div class="controls">
      <input id="search" type="text" placeholder="Search by name or Requirement ID&hellip;" autocomplete="off">
      <button class="chip t-exact" data-tier="exact" aria-pressed="true">Exact <span class="n">{len(data['exact_clusters'])}</span></button>
      <button class="chip t-high" data-tier="high" aria-pressed="true">High confidence <span class="n">{len(data['high_pairs'])}</span></button>
      <button class="chip t-mod" data-tier="mod" aria-pressed="true">Moderate <span class="n">{len(data['moderate_pairs'])}</span></button>
    </div>
  </div>
  <main id="main"></main>
</div>

<script>
const DATA = {json.dumps(data)};

function rowsHtml(rows) {{
  return `<div class="overflow"><table><thead><tr>
    <th>ID</th><th>Requirement Name</th><th>Type</th><th>Stream</th><th>Status</th><th>Sprint</th>
  </tr></thead><tbody>` +
  rows.map(it => `<tr>
    <td class="id">${{it.id}}</td>
    <td class="rowname">${{escapeHtml(it.name)}}</td>
    <td>${{it.type ? `<span class="pill">${{escapeHtml(it.type)}}</span>` : ''}}</td>
    <td>${{it.stream ? `<span class="pill">${{escapeHtml(it.stream)}}</span>` : ''}}</td>
    <td>${{it.status ? `<span class="pill">${{escapeHtml(it.status)}}</span>` : ''}}</td>
    <td>${{it.sprint ? `<span class="pill">${{escapeHtml(it.sprint)}}</span>` : ''}}</td>
  </tr>`).join('') + `</tbody></table></div>`;
}}

function escapeHtml(s) {{
  return (s || '').replace(/[&<>"']/g, c => ({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));
}}

function buildGroups() {{
  const groups = [];
  DATA.exact_clusters.forEach((rows, i) => groups.push({{
    tier: 'exact', label: 'Exact match', score: null, rows, key: 'e'+i,
    haystack: rows.map(r => r.id + ' ' + r.name).join(' ').toLowerCase()
  }}));
  DATA.high_pairs.forEach((p, i) => {{
    const [score, a, b] = p;
    groups.push({{
      tier: 'high', label: 'High confidence', score, rows: [a, b], key: 'h'+i,
      haystack: (a.id+' '+a.name+' '+b.id+' '+b.name).toLowerCase()
    }});
  }});
  DATA.moderate_pairs.forEach((p, i) => {{
    const [score, a, b] = p;
    groups.push({{
      tier: 'mod', label: 'Worth a look', score, rows: [a, b], key: 'm'+i,
      haystack: (a.id+' '+a.name+' '+b.id+' '+b.name).toLowerCase()
    }});
  }});
  return groups;
}}
const GROUPS = buildGroups();

const activeTiers = new Set(['exact', 'high', 'mod']);
let query = '';

function render() {{
  const main = document.getElementById('main');
  const q = query.trim().toLowerCase();
  const visible = GROUPS.filter(g => activeTiers.has(g.tier) && (!q || g.haystack.includes(q)));
  if (!visible.length) {{
    main.innerHTML = '<div class="empty">No groups match this filter.</div>';
    return;
  }}
  main.innerHTML = visible.map(g => `
    <div class="group tier-${{g.tier}}">
      <div class="group-head">
        <span class="badge">${{g.label}}</span>
        ${{g.score !== null ? `<span class="score">similarity ${{g.score.toFixed(2)}}</span>` : `<span class="score">${{g.rows.length}} identical names</span>`}}
        <span class="name">${{escapeHtml(g.rows[0].name)}}</span>
      </div>
      ${{rowsHtml(g.rows)}}
    </div>
  `).join('');
}}

document.querySelectorAll('.chip').forEach(chip => {{
  chip.addEventListener('click', () => {{
    const t = chip.dataset.tier;
    if (activeTiers.has(t)) {{ activeTiers.delete(t); chip.setAttribute('aria-pressed', 'false'); }}
    else {{ activeTiers.add(t); chip.setAttribute('aria-pressed', 'true'); }}
    render();
  }});
}});
document.getElementById('search').addEventListener('input', e => {{ query = e.target.value; render(); }});

render();
</script>
"""

with open("/private/tmp/claude-501/-Users-sarahsuda-Documents-MSCbacklogtracker/96342323-1c74-47f5-93fc-64e5d36dc9fc/scratchpad/dup_report.html", "w") as f:
    f.write(html)
print("written")
