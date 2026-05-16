// Innovation cluster taxonomy + per-district application data.
// Synthetic but realistic: each Shenzhen district has a known dominant industry,
// and we generate patent/design/trademark counts that respect that distribution.

(function(){

const CLUSTERS = [
  { id: "ai",       label: "AI & ML",            short: "AI",   color: "#7C5CFF" },
  { id: "semi",     label: "Semiconductors",     short: "SEMI", color: "#4FB8FF" },
  { id: "fintech",  label: "Fintech",            short: "FIN",  color: "#F5C13B" },
  { id: "medtech",  label: "Medical Devices",    short: "MED",  color: "#22D3A8" },
  { id: "biotech",  label: "Biotech & Pharma",   short: "BIO",  color: "#5BE0C2" },
  { id: "ev",       label: "EV & Battery",       short: "EV",   color: "#A6E24A" },
  { id: "telecom",  label: "Telecom & 5G",       short: "NET",  color: "#3D7DFF" },
  { id: "mfg",      label: "Smart Manufacturing",short: "MFG",  color: "#FF8A3D" },
  { id: "robotics", label: "Robotics & Drones",  short: "ROB",  color: "#FF5A6E" },
  { id: "logistics",label: "Logistics & Ports",  short: "LOG",  color: "#7D8FA8" },
  { id: "consumer", label: "Consumer Electronics",short:"CE",   color: "#E879C2" },
  { id: "urban",    label: "Urban / IoT",        short: "URB",  color: "#C8B86A" },
];

const CLUSTER_BY_ID = Object.fromEntries(CLUSTERS.map(c => [c.id, c]));

// Per-district dominant-cluster weights (sum-ish ~1). Based on real industry presence.
const DISTRICT_PROFILE = {
  "nanshan":   { ai: 0.32, semi: 0.18, fintech: 0.08, robotics: 0.10, consumer: 0.08, telecom: 0.10, medtech: 0.04, ev: 0.04, mfg: 0.03, urban: 0.03 },
  "futian":    { fintech: 0.34, ai: 0.14, urban: 0.12, consumer: 0.10, telecom: 0.08, semi: 0.06, medtech: 0.06, robotics: 0.04, mfg: 0.03, logistics: 0.03 },
  "luohu":     { consumer: 0.26, fintech: 0.18, urban: 0.14, mfg: 0.10, logistics: 0.08, medtech: 0.06, ai: 0.06, ev: 0.04, robotics: 0.04, telecom: 0.04 },
  "yantian":   { logistics: 0.40, urban: 0.14, mfg: 0.12, consumer: 0.08, ev: 0.08, telecom: 0.06, ai: 0.04, semi: 0.04, robotics: 0.02, medtech: 0.02 },
  "baoan":     { mfg: 0.26, consumer: 0.14, robotics: 0.12, semi: 0.10, ev: 0.10, telecom: 0.08, ai: 0.06, logistics: 0.06, urban: 0.04, medtech: 0.04 },
  "longhua":   { mfg: 0.28, consumer: 0.18, semi: 0.10, telecom: 0.10, ai: 0.10, robotics: 0.08, ev: 0.06, urban: 0.04, medtech: 0.03, logistics: 0.03 },
  "longgang":  { telecom: 0.32, semi: 0.16, ai: 0.12, mfg: 0.12, consumer: 0.08, ev: 0.06, robotics: 0.06, urban: 0.04, medtech: 0.02, fintech: 0.02 },
  "pingshan":  { ev: 0.42, mfg: 0.16, semi: 0.10, robotics: 0.08, telecom: 0.06, ai: 0.06, urban: 0.04, biotech: 0.04, medtech: 0.02, consumer: 0.02 },
  "guangming": { biotech: 0.28, medtech: 0.22, semi: 0.14, ai: 0.10, mfg: 0.08, urban: 0.06, robotics: 0.04, ev: 0.04, telecom: 0.02, consumer: 0.02 },
  "dapeng":    { biotech: 0.34, medtech: 0.20, urban: 0.14, logistics: 0.10, ai: 0.06, robotics: 0.04, ev: 0.04, mfg: 0.04, consumer: 0.02, telecom: 0.02 },
};

const DISTRICT_META = {
  // Filings anchored to public stats: Shenzhen total ~275,774 patents granted 2022
  // (Statista). Bao'an leads grants, Nanshan leads invention patents (~37% of city
  // total) and PCT density, Longgang leads PCT volume (Huawei).
  // Refs: sz.gov.cn, chinadailyhk.com, statista.com
  "nanshan":   { name: "Nanshan",   nameCN: "南山区",   postal: "518052", pop: 1795,  area: 187.5,  filings:{patent:55400, design:14200, trademark:24800} },
  "futian":    { name: "Futian",    nameCN: "福田区",   postal: "518033", pop: 1551,  area: 78.66,  filings:{patent:22100, design:7600,  trademark:33400} },
  "luohu":     { name: "Luohu",     nameCN: "罗湖区",   postal: "518001", pop: 1143,  area: 78.36,  filings:{patent:10300, design:4400,  trademark:19200} },
  "yantian":   { name: "Yantian",   nameCN: "盐田区",   postal: "518081", pop: 215,   area: 74.99,  filings:{patent:6400,  design:1800,  trademark:4100} },
  "baoan":     { name: "Bao'an",    nameCN: "宝安区",   postal: "518101", pop: 4471,  area: 396.64, filings:{patent:69800, design:21400, trademark:31200} },
  "longhua":   { name: "Longhua",   nameCN: "龙华区",   postal: "518109", pop: 2528,  area: 175.6,  filings:{patent:24600, design:8200,  trademark:12800} },
  "longgang":  { name: "Longgang",  nameCN: "龙岗区",   postal: "518172", pop: 3979,  area: 388.21, filings:{patent:49400, design:16100, trademark:19600} },
  "pingshan":  { name: "Pingshan",  nameCN: "坪山区",   postal: "518118", pop: 469,   area: 167.0,  filings:{patent:15300, design:4200,  trademark:5500} },
  "guangming": { name: "Guangming", nameCN: "光明区",   postal: "518107", pop: 1097,  area: 156.1,  filings:{patent:12100, design:2900,  trademark:5200} },
  "dapeng":    { name: "Dapeng",    nameCN: "大鹏新区", postal: "518120", pop: 154,   area: 295.0,  filings:{patent:2900,  design:610,   trademark:2120} },
};
// Sums: patent ≈ 268.3k, design ≈ 81.4k, trademark ≈ 158k — close to CNIPA city totals.

// Deterministic pseudo-random so the scatter looks the same on every reload.
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Pick a cluster from a weighted distribution.
function pickWeighted(profile, rand) {
  let r = rand();
  for (const [id, w] of Object.entries(profile)) {
    if ((r -= w) <= 0) return id;
  }
  return Object.keys(profile)[0];
}

// Compute the dominant cluster id for a district.
function dominantCluster(districtId) {
  const profile = DISTRICT_PROFILE[districtId];
  let best = null, bestW = -1;
  for (const [id, w] of Object.entries(profile)) {
    if (w > bestW) { bestW = w; best = id; }
  }
  return best;
}

// For a feature polygon, sample N points inside it, each labelled with a cluster.
// Uses rejection sampling against the polygon's bbox.
function pointInPolygon(pt, poly) {
  // pt = [x,y], poly = array of rings, ring = array of [x,y]
  let inside = false;
  for (const ring of poly) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

function bbox(rings) {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const ring of rings) for (const [x, y] of ring) {
    if (x < minx) minx = x; if (y < miny) miny = y;
    if (x > maxx) maxx = x; if (y > maxy) maxy = y;
  }
  return [minx, miny, maxx, maxy];
}

// Box-Muller — Gaussian jitter so multiple filings at the same jiedao address
// don't render as a single overlapping dot.
function gaussian(rand) {
  const u = Math.max(rand(), 1e-9), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Group the real jiedao directory (loaded from sz-jiedao.js) by district id.
const JIEDAO_BY_DISTRICT = (() => {
  const out = {};
  const list = (typeof window !== 'undefined' && window.SZ_JIEDAO) || [];
  for (const j of list) (out[j.district] = out[j.district] || []).push(j);
  return out;
})();

// Build per-cluster cumulative year-share tables from WIPO_CORPUS.cluster_by_year
// (real per-year filing counts from the FP:(shenzhen) WIPO export). Each entry is
// an array of [year, cumulativeShare] so picking a year is one binary search.
const YEAR_CDF_BY_CLUSTER = (() => {
  const corpus = (typeof window !== 'undefined' && window.WIPO_CORPUS) || null;
  const out = {};
  if (!corpus || !corpus.cluster_by_year) return out;
  const window2024 = ["2019", "2020", "2021", "2022", "2023", "2024"];
  for (const [cluster, byYear] of Object.entries(corpus.cluster_by_year)) {
    const total = window2024.reduce((s, y) => s + (byYear[y] || 0), 0);
    if (!total) continue;
    let acc = 0;
    out[cluster] = window2024.map(y => {
      acc += (byYear[y] || 0) / total;
      return [+y, acc];
    });
  }
  return out;
})();

function pickYear(clusterId, rand) {
  const cdf = YEAR_CDF_BY_CLUSTER[clusterId];
  if (!cdf) return null;
  const u = rand();
  for (const [year, cum] of cdf) if (u <= cum) return year;
  return cdf[cdf.length - 1][0];
}

function sampleApplications(feature, districtId, count, seed) {
  const rand = mulberry32(seed);
  const profile = DISTRICT_PROFILE[districtId];
  const anchors = JIEDAO_BY_DISTRICT[districtId] || [];
  const out = [];

  // Anchor each point at a real jiedao centroid + Gaussian jitter (σ ≈ 0.01°
  // ≈ ~1.1km). Jitter is wide enough that adjacent jiedao clumps overlap so
  // the river MST-diameter spine flows smoothly across the district instead
  // of zigzagging between discrete anchor points. Requires window.SZ_JIEDAO
  // loaded before this file.
  if (anchors.length > 0) {
    for (let i = 0; i < count; i++) {
      const j = anchors[Math.floor(rand() * anchors.length)];
      const jitterLng = gaussian(rand) * 0.01;
      const jitterLat = gaussian(rand) * 0.01;
      const cluster = pickWeighted(profile, rand);
      out.push({
        lng: j.lng + jitterLng,
        lat: j.lat + jitterLat,
        cluster,
        score: rand(),
        year: pickYear(cluster, rand),
        jiedao: j.name,
        postcode: j.postcode,
      });
    }
    return out;
  }

  // Fallback (sz-jiedao.js missing): uniform random within the district polygon.
  const geom = feature.geometry;
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  const areas = polys.map(rings => {
    const [a, b, c, d] = bbox(rings);
    return (c - a) * (d - b);
  });
  const totalA = areas.reduce((s, x) => s + x, 0);
  let attempts = 0;
  while (out.length < count && attempts < count * 80) {
    attempts++;
    let r = rand() * totalA, pi = 0;
    while (pi < polys.length - 1 && (r -= areas[pi]) > 0) pi++;
    const rings = polys[pi];
    const [a, b, c, d] = bbox(rings);
    const x = a + rand() * (c - a);
    const y = b + rand() * (d - b);
    if (pointInPolygon([x, y], rings)) {
      out.push({ lng: x, lat: y, cluster: pickWeighted(profile, rand), score: rand() });
    }
  }
  return out;
}

window.SEMANTIC = {
  CLUSTERS, CLUSTER_BY_ID, DISTRICT_PROFILE, DISTRICT_META,
  sampleApplications, dominantCluster, mulberry32, pickWeighted,
};

})();
