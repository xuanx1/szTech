# [Semantic Rivers](https://xuanx1.github.io/szTech/) of Chinese Tech

Innovation [cluster](https://xuanx1.github.io/szTech/) mapping for Shenzhen patent / design / trademark filings — embeds the abstracts, clusters by meaning, and projects the clusters onto the city's 10 administrative districts as a chloropleth + scatter + flowing-river visualization.

<img width="1920" height="916" alt="Screenshot 2026-05-16 164051" src="https://github.com/user-attachments/assets/ad929816-02bf-4688-aeb6-2e60ec8dcf51" />

---

## What you're looking at

For each district, the dashboard answers three questions:

1. **What kinds of innovation happen here?** — top-down view via dominant-cluster chloropleth.
2. **How does that cluster live across the city, and how has it moved?** — the *semantic river* traces the real per-year centroid of where that cluster's filings concentrated across 2019–2024, derived from the WIPO PatentScope corpus.
3. **How does it compare?** — KPIs, district ranking, sample assignees, and signal phrases.

### Cluster taxonomy (k = 12, configurable to 8 / 16)

AI & ML · Semiconductors · Fintech · Medical Devices · Biotech & Pharma · EV & Battery · Telecom & 5G · Smart Manufacturing · Robotics & Drones · Logistics & Ports · Consumer Electronics · Urban / IoT

### Districts

Nanshan · Futian · Luohu · Yantian · Bao'an · Longhua · Longgang · Pingshan · Guangming · Dapeng New Area (Shenshan SCZ filtered — geographically in Shanwei).

---

## Data sources

| Layer | Source |
|---|---|
| District boundaries | Aliyun DataV.GeoAtlas (`440300_full.json`) — official CNIPA admin polygons. Transformed WGS84→GCJ-02 to align with neighbour outlines + `china-outline.js`. |
| Jiedao (street-level) directory | [Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China) public admin codes; coordinates from OpenStreetMap Nominatim; transformed WGS84→GCJ-02. 78 entries. |
| Per-year, per-cluster, per-district counts | WIPO PatentScope `FP:(shenzhen)` result list — 10,000 PCT records (~7,841 attributed to a SZ district via public corporate HQ→district lookup). IPC→cluster via WIPO IPC Concordance class prefixes. |
| Right-rail assignees & counts | Same WIPO corpus; modal cluster per assignee chosen across all their filings in the corpus. Real `n:` counts, no fabricated numbers. |
| District filings totals (`DISTRICT_META[id].filings`) | Still hand-anchored to public stats (Statista Shenzhen 2022 ~275,774 patents granted; `sz.gov.cn`, `chinadailyhk.com`) — the WIPO corpus is PCT-only and doesn't cover the full CNIPA aggregate. |
| Per-district cluster weights (`DISTRICT_PROFILE`) | Still hand-modelled from public industry presence (Huawei → Longgang telecom, BYD → Pingshan EV, …). Drives the choropleth fill. |
| Signal phrases | Hand-curated per-cluster keyword lists in `app.jsx`. |

---

## Files

| File | Role |
|---|---|
| `index.html` | Source page — loads dependencies, mounts React, holds CSS. |
| `app.jsx` | App components, projection, rivers, render. |
| `data.js` | Cluster taxonomy, district profiles, filings, point sampler. |
| `shenzhen-districts.geojson` | Real admin boundaries — 10 districts incl. separately-carved Dapeng. Transformed WGS84→GCJ-02 so it aligns with the HK/PRD neighbours and `china-outline.js` (both GCJ-02 from Aliyun DataV). |
| `shenzhen-geojson-data.js` | Same geojson wrapped as `window.SZ_GEOJSON_LOCAL = {...}` fallback so the page can render even when Aliyun is unreachable. |
| `sz-neighbors.js` | Embedded HK / PRD outline fallback for the surrounding-context layer. Replaced at runtime by live Aliyun fetch when available. |
| `china-outline.js` | National China outline (~878 verts, 32 polygons) — used by the top-right world inset. |
| `sz-jiedao.js` | Real SZ street-level (jiedao) directory — 78 entries with name, district, postal code, GCJ-02 centroid. Codes/names from [Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China) (public-domain admin data), coordinates geocoded via OpenStreetMap Nominatim (ODbL) and transformed WGS84→GCJ-02. Scatter points anchor on these instead of uniform-random-in-polygon. |
| `wipo-corpus.js` | Real per-year, per-cluster, per-district counts derived from WIPO PatentScope `FP:(shenzhen)` result list (10,000 PCT records). Drives `YEAR_FRACTION`, the river migration trajectories, and the right-rail assignee tally. IPC→cluster mapping uses WIPO IPC Concordance class prefixes; applicant→district uses public corporate HQ locations. |
| `resultList.xls` | Source XLS exported from WIPO PatentScope for `FP:(shenzhen)`. Kept for provenance / re-derivation. |
| `_build_corpus.js` | Build script — `npm i --no-save xlsx && node _build_corpus.js` regenerates `wipo-corpus.js` from `resultList.xls`. |

---

## In-viz controls (Display bar)

| Control | Effect |
|---|---|
| **VIEW** | `Choropleth` (color = dominant cluster) or `Scatter` (one dot per application). |
| **NORMALIZE** | `Raw` filings · `/10k pop` · `/km²`. Propagates to KPI, district ranks, rivers, scatter density. |
| **k** | Cluster count shown — 8 / 12 / 16. |
| **Points / Labels / Rivers** | Layer toggles. |

---

## Semantic rivers

For each focused cluster, the river is the real migration trajectory derived from WIPO records:

1. **Per-year migration shares.** `WIPO_CORPUS.migration_share[cluster][year][district]` holds the real fraction of that cluster's filings attributed to each district in each year (built from the WIPO XLS Applicant column + a public HQ→district lookup).
2. **Weighted-centroid chain.** For each year 2019→2024 the river emits one path vertex = weighted average of district centroids by that year's share. Result = a 6-vertex chronological chain that literally tracks where the cluster concentrated each year.
   - *Example: telecom 2019 → 100% Nanshan, 2022 → 87% Bao'an, 2024 → 92% Bao'an. The river visibly migrates Nanshan→Bao'an across the SZ map.*
3. **Fallback.** Clusters with no migration data fall back to a space-time MST through the scatter points: each point lives in `(x, y, year × T_SCALE)`, Prim's MST, then two-BFS diameter, oriented old→new.
4. **Smooth** the path into a quadratic-bezier midpoint curve.
5. **Densify** that exact curve via Q-bezier sampling (16 samples per segment) so the animated wave hugs the same shape as the static base channel.
6. **Animate** by giving each sub-segment its own `animation-delay = -arcPos × cycle` — adjacent segments cycle through bright/dim slightly out of phase, producing a gradient wave that flows along the curve at every point. Because the path is 2019→2024, the wave visibly flows in the direction of innovation growth. Gaussian-blur filter dissolves the segment boundaries.

Non-focused rivers render as faint static curves (0.32 opacity), or fade to 0.02 when another cluster is focused.

The scatter points themselves are anchored at real jiedao centroids (with ~1.1km Gaussian jitter) so density still reflects the real street-level geography even when the river curve is drawn from the WIPO-derived migration table rather than from those points.

---

## Method (shown in the right rail)

1. **Tokenize** CN/EN bilingual abstracts → jieba + spaCy tokens, stopword + IPC code removal.
2. **Embed** with SBERT (`paraphrase-multilingual-mpnet-base-v2`), L2-normalized — switchable to BERT-768 or Word2Vec-300.
3. **Cluster** UMAP → k-means (k=12 default). Centroid labels via class-based TF-IDF on top tokens.
4. **Geocode** assignee address → postal code → district polygon.

Steps 1–3 stay as the future-state pipeline. Step 4 is partially live: clusters are derived from real IPC codes via the WIPO IPC Concordance, and per-cluster per-year per-district counts come from the WIPO PatentScope `FP:(shenzhen)` corpus. The hand-modelled `DISTRICT_PROFILE` still drives the choropleth fill because PCT-only WIPO data doesn't cover the full CNIPA aggregate.

---

## Projection

`d3.geoIdentity().reflectY(true).fitExtent(...)` — flat lng/lat → x/y with Y-flip for SVG.

Why not Mercator? Because Aliyun's geojson has clockwise outer rings (vs RFC 7946 counter-clockwise), and `d3.geoMercator()` does spherical antimeridian clipping that interprets clockwise polygons as "the entire world *except* this region" — every district then renders as a giant box covering the map. Identity skips spherical reasoning entirely; at city scale, Mercator distortion is invisible anyway.
