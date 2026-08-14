---
name: estimate-converter-table
description: T-shirt-size to story-point (SP) conversion table used to convert legacy free-text T-shirt estimates into numeric HLE/story points on the Backlog tab.
metadata: 
  node_type: memory
  type: project
  originSessionId: 96342323-1c74-47f5-93fc-64e5d36dc9fc
  modified: 2026-08-03T13:00:02.548Z
---

T-shirt size → Story Point (SP) mapping the user shared for converting legacy T-shirt-size estimates into numeric story points:

| T-Shirt | SP |
|---|---|
| XXS | 1 |
| XXS | 2 |
| XXS | 3 |
| XS | 5 |
| S | 8 |
| M | 13 |
| L | 20 |
| XL | 40 |

**Why:** Legacy source files (`MuleSoft Team - Planning.xlsx`) recorded estimates as T-shirt sizes or free text rather than numeric story points. The Backlog tab's HLE column is numeric-only, so this table is the canonical conversion when recovering/migrating estimates from old free-text notes.

**Note:** the three XXS rows share one label but three different SP values (1, 2, 3) — confirmed by the user. When converting a plain "XXS" estimate with no other signal to disambiguate, ask the user which of the three (1/2/3) applies rather than guessing.

**How to apply:** [[msc-backlog-tracker-design]] — when normalizing free-text estimate notes into the Backlog tab's HLE column, use this Fibonacci-like scale (1, 2, 3, 5, 8, 13, 20, 40) rather than inventing new point values.
