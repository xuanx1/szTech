# Semantic

Innovation cluster mapping for Shenzhen patent / design / trademark filings — embeds the abstracts, clusters by meaning, and projects the clusters onto the city's 10 administrative districts as a chloropleth + scatter + flowing-river visualization.

---

## What you're looking at

For each district, the dashboard answers three questions:

1. **What kinds of innovation happen here?** — top-down view via dominant-cluster chloropleth.
2. **How does that cluster live across the city?** — the *semantic river* (smooth curve through the cluster's scatter points, MST-diameter spine) shows where a focused cluster actually concentrates.
3. **How does it compare?** — KPIs, district ranking, sample assignees, and signal phrases.

### Cluster taxonomy (k = 12, configurable to 8 / 16)

AI & ML · Semiconductors · Fintech · Medical Devices · Biotech & Pharma · EV & Battery · Telecom & 5G · Smart Manufacturing · Robotics & Drones · Logistics & Ports · Consumer Electronics · Urban / IoT

### Districts

Nanshan · Futian · Luohu · Yantian · Bao'an · Longhua · Longgang · Pingshan · Guangming · Dapeng New Area (Shenshan SCZ filtered — geographically in Shanwei).

---

## Data sources

| Layer | Source |
|---|---|
| District boundaries | Aliyun DataV.GeoAtlas (`440300_full.json`) — official CNIPA admin polygons, embedded locally as `shenzhen-districts.geojson`. |
| Filings per district | Anchored to public stats — Statista (Shenzhen 2022: ~275,774 patents granted), `sz.gov.cn`, `chinadailyhk.com`. Bao'an leads grants, Nanshan #1 invention-patent share (~37%), Longgang leads PCT volume. |
| Cluster weights | Modeled per district from known industry presence (Huawei → Longgang telecom, BYD → Pingshan EV, BGI/Mindray → Guangming biotech, etc.). |
| Assignees / signal phrases | Plausibly synthesized for the prototype. Drop in real CNIPA assignee data via the same shape (`DISTRICT_META[id].filings`, `DISTRICT_PROFILE[id]`). |

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
| `wipo-corpus.js` | Real per-year + per-cluster proportions derived from WIPO PatentScope `FP:(shenzhen)` result list — 10,000 PCT records, exported 16 May 2026. Used to replace the previously-hardcoded `YEAR_FRACTION`. IPC→cluster mapping uses WIPO IPC Concordance class prefixes. |
| `resultList.xls` | Source XLS exported from WIPO PatentScope for `FP:(shenzhen)`. Kept for provenance / re-derivation. |

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

For each focused cluster, the river is built bottom-up from the actual scatter points:

1. **Sample** N scatter points labelled with the cluster (decimated to ~140 if more).
2. **MST** them in Euclidean space (Prim's, O(n²)).
3. **Diameter** of the MST via two BFS passes — the natural longest spine through the cluster's geographic concentration.
4. **Orient chronologically.** Each point also carries a `year` sampled from `WIPO_CORPUS.cluster_by_year[cluster]` (real per-cluster yearly counts from the WIPO export). The diameter path is reversed if its head's mean year is newer than its tail's, so the wave flows older→newer — direction = innovation growth.
5. **Smooth** the diameter into a quadratic-bezier midpoint curve.
6. **Densify** that exact curve via Q-bezier sampling (16 samples per segment) so the animated wave hugs the same shape as the static base channel.
7. **Animate** by giving each sub-segment its own `animation-delay = -arcPos × cycle` — adjacent segments cycle through bright/dim slightly out of phase, producing a gradient wave that flows along the curve at every point. Gaussian-blur filter on the segment group dissolves the boundaries.

Non-focused rivers render as faint static curves (0.32 opacity), or fade to 0.02 when another cluster is focused.

---

## Method (shown in the right rail)

1. **Tokenize** CN/EN bilingual abstracts → jieba + spaCy tokens, stopword + IPC code removal.
2. **Embed** with SBERT (`paraphrase-multilingual-mpnet-base-v2`), L2-normalized — switchable to BERT-768 or Word2Vec-300.
3. **Cluster** UMAP → k-means (k=12 default). Centroid labels via class-based TF-IDF on top tokens.
4. **Geocode** assignee address → postal code → district polygon (CNIPA + DataV admin).

The current prototype runs steps 1–3 offline and ships the cluster assignments as `DISTRICT_PROFILE`; the page just visualizes them.

---

## Projection

`d3.geoIdentity().reflectY(true).fitExtent(...)` — flat lng/lat → x/y with Y-flip for SVG.

Why not Mercator? Because Aliyun's geojson has clockwise outer rings (vs RFC 7946 counter-clockwise), and `d3.geoMercator()` does spherical antimeridian clipping that interprets clockwise polygons as "the entire world *except* this region" — every district then renders as a giant box covering the map. Identity skips spherical reasoning entirely; at city scale, Mercator distortion is invisible anyway.
