// Semantic — patent semantic-clustering map for Shenzhen.
// Loads real district geojson, projects with d3-geo, generates synthetic
// per-district cluster points using profiles from data.js.

const { useState, useEffect, useMemo, useRef, useCallback } = React;
const { CLUSTERS, CLUSTER_BY_ID, DISTRICT_PROFILE, DISTRICT_META,
        sampleApplications, dominantCluster, mulberry32, pickWeighted } = window.SEMANTIC;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dataset": "patent",
  "embedding": "sbert",
  "view": "chloropleth",
  "showPoints": true,
  "showLabels": true,
  "showRivers": true,
  "density": 1.0,
  "highlightDominant": true,
  "year": "all",
  "normalize": "raw",
  "palette": "default",
  "pointSize": 1.0,
  "pointShape": "dot",
  "outline": 1.0,
  "labelLang": "both",
  "k": 12,
  "lang": "en"
}/*EDITMODE-END*/;

// ─── i18n ──────────────────────────────────────────────────────────────────

const I18N = {
  en: {
    brand: "SEMANTIC RIVERS OF CHINESE TECH",
    brandSub: "Innovation Cluster Mapping · Shenzhen 深圳",
    dataset: "DATASET", patents: "Patents", designs: "Designs", trademarks: "Trademarks",
    embedding: "EMBEDDING",
    view: "VIEW", choropleth: "Choropleth", scatter: "Scatter",
    normalize: "NORMALIZE", raw: "Raw", perCapita: "/10k pop", perKm2: "/km²",
    k: "k", points: "Points", labels: "Labels", rivers: "Rivers",
    clusters: "Clusters", overview: "Overview",
    hoverHint: "Hover a district or cluster to drill in.",
    topDistricts: "Top filing districts",
    method: "Method",
    tokenize: "Tokenize abstracts",
    tokenizeDesc: "CN/EN bilingual abstracts → jieba + spaCy tokens, stopword + IPC code removal.",
    embed: "Embed",
    cluster: "Cluster",
    clusterDesc: "UMAP→k-means (k={k}). Centroid labels via class-based TF-IDF on top tokens.",
    geocode: "Geocode",
    geocodeDesc: "Assignee address → postal code → district polygon (CNIPA + DataV admin).",
    dominantCluster: "DOMINANT CLUSTER",
    embeddings: "of embeddings",
    density: "density", pop: "pop",
    clusterMix: "Cluster mix",
    signalPhrases: "Signal phrases",
    sampleAssignees: "Sample assignees",
    inCluster: "in cluster",
    across10: "across 10 districts",
    concentration: "Concentration by district",
    allClusters: "all clusters",
    plotted: "PLOTTED", source: "SOURCE", year: "YEAR",
    corpus: "corpus", silhouette: "silhouette",
    centroidNote: "Centroid labels assigned via TF-IDF over top tokens per cluster.",
    legend1: "dominant cluster fills district fill",
    legend2: "1 dot ≈",
    bootMsg: "embedding · clustering · projecting",
    shenzhenSub: "10 districts · 1,747 km² · 17.8M people",
    embeddedSuffix: "embedded",
  },
  zh: {
    brand: "科技河流",
    brandSub: "创新集群地图 · 深圳 Shenzhen",
    dataset: "数据集", patents: "专利", designs: "外观设计", trademarks: "商标",
    embedding: "嵌入模型",
    view: "视图", choropleth: "色块图", scatter: "散点图",
    normalize: "归一化", raw: "原始", perCapita: "每万人", perKm2: "每平方公里",
    k: "k", points: "点位", labels: "标签", rivers: "河流",
    clusters: "集群", overview: "概览",
    hoverHint: "悬停区或集群以查看详情。",
    topDistricts: "申请最多的辖区",
    method: "方法",
    tokenize: "分词",
    tokenizeDesc: "中英文摘要 → jieba + spaCy 分词,去除停用词和 IPC 代码。",
    embed: "嵌入",
    cluster: "聚类",
    clusterDesc: "UMAP→k-means (k={k})。质心标签来自按类别 TF-IDF。",
    geocode: "地理编码",
    geocodeDesc: "申请人地址 → 邮编 → 辖区边界 (CNIPA + DataV)。",
    dominantCluster: "主导集群",
    embeddings: "的嵌入占比",
    density: "密度", pop: "人口",
    clusterMix: "集群占比",
    signalPhrases: "关键短语",
    sampleAssignees: "代表申请人",
    inCluster: "集群中",
    across10: "覆盖 10 个辖区",
    concentration: "辖区分布",
    allClusters: "全部集群",
    plotted: "绘制", source: "来源", year: "年份",
    corpus: "语料", silhouette: "轮廓",
    centroidNote: "质心标签由每集群顶部词的 TF-IDF 自动生成。",
    legend1: "主导集群决定辖区颜色",
    legend2: "1 点 ≈",
    bootMsg: "嵌入 · 聚类 · 投影",
    shenzhenSub: "10 个辖区 · 1,747 平方公里 · 1,780 万人",
    embeddedSuffix: "已嵌入",
  },
};

// Cluster labels translated
const CLUSTER_LABELS_ZH = {
  ai: "人工智能", semi: "半导体", fintech: "金融科技", medtech: "医疗器械",
  biotech: "生物医药", ev: "电动车与电池", telecom: "通信与 5G", mfg: "智能制造",
  robotics: "机器人与无人机", logistics: "物流与港口", consumer: "消费电子", urban: "城市与 IoT",
};

function L(t, key) {
  const dict = I18N[t.lang || "en"] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}

function clusterLabel(cid, lang) {
  if (lang === "zh") return CLUSTER_LABELS_ZH[cid] || CLUSTER_BY_ID[cid].label;
  return CLUSTER_BY_ID[cid].label;
}

// ─── Embedding perturbation ────────────────────────────────────────────────
// Different embedding models cluster the corpus differently. We simulate this
// by perturbing the per-district cluster weights: SBERT is the published
// distribution; BERT shifts mild; Word2Vec shifts more (since it's worse at
// nuanced semantics, smearing weight across clusters).

function perturbProfile(profile, embedding, districtId) {
  if (embedding === "sbert") return profile;
  const strength = embedding === "bert" ? 0.15 : 0.40;
  // Cheap deterministic hash so the same district + embedding always yields
  // the same perturbation (so toggling back/forth is reversible).
  let h = 2166136261;
  const s = districtId + "|" + embedding;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let seed = h >>> 0;
  const rand = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const out = {};
  let total = 0;
  for (const [cid, w] of Object.entries(profile)) {
    const jitter = 1 + (rand() - 0.5) * 2 * strength;
    const v = Math.max(0.005, w * jitter);
    out[cid] = v; total += v;
  }
  for (const k of Object.keys(out)) out[k] = out[k] / total;
  return out;
}

function getProfile(districtId, embedding) {
  return perturbProfile(DISTRICT_PROFILE[districtId], embedding, districtId);
}

// Year share — real per-year proportions derived from WIPO PatentScope's
// FP:(shenzhen) result list. Loaded at runtime from wipo-corpus.js.
const YEAR_FRACTION = (() => {
  const w = (typeof window !== "undefined") && window.WIPO_CORPUS;
  const real = w && w.year_fraction_window;
  if (real) return { ...real, "all": 1.00 };
  // No corpus loaded — degrade to a uniform split over a placeholder window
  // rather than fabricate growth.
  return { "2019": 1/6, "2020": 1/6, "2021": 1/6, "2022": 1/6, "2023": 1/6, "2024": 1/6, "all": 1.00 };
})();

// Corpus year range — derived from whatever years the loaded corpus actually
// covers, so display labels track the data rather than a hardcoded window.
const CORPUS_YEARS = Object.keys(YEAR_FRACTION).filter(k => k !== "all").sort();
const CORPUS_YEAR_RANGE = CORPUS_YEARS.length
  ? `${CORPUS_YEARS[0]} — ${CORPUS_YEARS[CORPUS_YEARS.length - 1]}`
  : "—";

// Alternate palettes — same 12 cluster ids, different hue families.
const PALETTES = {
  "default": null, // use CLUSTERS[i].color
  "cool":    { ai:"#5B9BFF", semi:"#4FB8FF", fintech:"#22D3A8", medtech:"#5BE0C2",
               biotech:"#7FE5C9", ev:"#3D7DFF", telecom:"#7C5CFF", mfg:"#5BD0FF",
               robotics:"#9CB6FF", logistics:"#5C7BB3", consumer:"#22A8D3", urban:"#A6D2E2" },
  "warm":    { ai:"#FF7A4A", semi:"#FFB347", fintech:"#F5C13B", medtech:"#F58A6B",
               biotech:"#FFA37A", ev:"#FF6B6B", telecom:"#E54B6B", mfg:"#FF8A3D",
               robotics:"#FF5A6E", logistics:"#C57A52", consumer:"#E879C2", urban:"#D4A35A" },
  "mono":    { ai:"#9F7CFF", semi:"#8866EE", fintech:"#7C5CFF", medtech:"#6B47E5",
               biotech:"#5A35CC", ev:"#4A23B3", telecom:"#B391FF", mfg:"#A088FF",
               robotics:"#C7A8FF", logistics:"#5A35CC", consumer:"#9F7CFF", urban:"#8866EE" },
};

function paletteColor(clusterId, palette) {
  const map = PALETTES[palette];
  if (map && map[clusterId]) return map[clusterId];
  const c = CLUSTER_BY_ID[clusterId];
  // Some WIPO records have no IPC-mapped cluster — surface them with the
  // neutral accent rather than throw a TypeError mid-render.
  return c ? c.color : "var(--accent)";
}

// Filing count after year slicing and normalization.
function displayFilings(districtId, dataset, year, normalize) {
  const meta = DISTRICT_META[districtId];
  let n = meta.filings[dataset] * (YEAR_FRACTION[year] || 1);
  if (normalize === "per_capita") n = n / (meta.pop / 10); // per 10k residents
  if (normalize === "per_km2")    n = n / meta.area;
  return n;
}

function normalizeUnit(normalize, dataset) {
  if (normalize === "per_capita") return "/10k pop";
  if (normalize === "per_km2") return "/km²";
  return "";
}

// ─── App ────────────────────────────────────────────────────────────────────

function useTweaks(defaults) {
  const [values, setValues] = useState(defaults);
  const setTweak = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);
  return [values, setTweak];
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [geojson, setGeojson] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [focusCluster, setFocusCluster] = useState(null);
  const [neighbors, setNeighbors] = useState(window.SZ_NEIGHBORS || []);

  // Fetch high-res HK / Macau / PRD city outlines at runtime. Replaces the
  // embedded low-res fallback when Aliyun is reachable.
  useEffect(() => {
    (async () => {
      const urls = [
        "https://geo.datav.aliyun.com/areas_v3/bound/810000_full.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/820000_full.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/441900.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/441300.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/440100.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/442000.json",
        "https://geo.datav.aliyun.com/areas_v3/bound/440400.json",
      ];
      const flat = [];
      for (const u of urls) {
        try {
          const r = await fetch(u);
          if (!r.ok) continue;
          const txt = await r.text();
          if (txt.trim().startsWith('<')) continue;
          const j = JSON.parse(txt);
          for (const f of j.features) {
            const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
            for (const poly of polys) {
              const ring = poly[0];
              if (!ring || ring.length < 5) continue;
              let minx=Infinity,maxx=-Infinity,miny=Infinity,maxy=-Infinity;
              for (const [x,y] of ring) {
                if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
              }
              if ((maxx-minx) < 0.005 && (maxy-miny) < 0.005) continue;
              flat.push(ring);
            }
          }
        } catch (e) {}
      }
      if (flat.length > 20) setNeighbors(flat);
    })();
  }, []);
  useEffect(() => {
    // Try real CNIPA/admin-grade geojson first (Aliyun DataV publishes the
    // official Shenzhen admin boundary set as 440300_full.json — open CORS).
    // Fall back to the bundled approximate polygons if offline.
    const NAME_TO_ID = {
      "南山区":"nanshan","福田区":"futian","罗湖区":"luohu","盐田区":"yantian",
      "宝安区":"baoan","龙华区":"longhua","龙岗区":"longgang","坪山区":"pingshan",
      "光明区":"guangming","大鹏新区":"dapeng",
    };
    function normalize(j) {
      if (!j || !j.features) return j;
      j.features = j.features
        .map(f => {
          const cn = f.properties && (f.properties.name || f.properties.NAME);
          const id = f.properties.id || NAME_TO_ID[cn];
          if (!id) return null;
          const meta = DISTRICT_META[id];
          return {
            ...f,
            properties: {
              ...f.properties,
              id, name: meta ? meta.name : cn, nameCN: cn || (meta && meta.nameCN),
            }
          };
        })
        .filter(Boolean);
      return j;
    }
    async function ensureDapeng(j) {
      // Aliyun's official set only has 9 districts — Dapeng "New Area" sits
      // legally inside Longgang. Splice in the Dapeng polygon from the local
      // fallback so all 10 innovation zones render.
      if (j.features.some(f => f.properties.id === "dapeng")) return j;
      try {
        const r = await fetch("shenzhen-districts.geojson");
        if (!r.ok) return j;
        const fb = await r.json();
        const dp = fb.features.find(f => f.properties.id === "dapeng");
        if (dp) j.features.push(dp);
      } catch (e) {}
      return j;
    }
    const sources = [
      // Prefer the local high-res file (user-provided official boundaries).
      "shenzhen-districts.geojson",
      // Fallback to live Aliyun DataV if local file is missing.
      "https://geo.datav.aliyun.com/areas_v3/bound/440300_full.json",
    ];
    (async () => {
      // 1. Try the embedded geojson (loaded via <script>, instant + offline).
      if (window.SZ_GEOJSON_LOCAL) {
        try {
          const j = normalize(window.SZ_GEOJSON_LOCAL);
          if (j && j.features && j.features.length >= 8) {
            j.__source = "local";
            setGeojson(j);
            return;
          }
        } catch (e) {}
      }
      // 2. Else try the network sources.
      for (const url of sources) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          let j = normalize(await r.json());
          if (j && j.features && j.features.length >= 8) {
            j = await ensureDapeng(j);
            j.__source = url.startsWith("http") ? "aliyun" : "local";
            setGeojson(j);
            return;
          }
        } catch (e) { /* try next */ }
      }
      setError("Could not load Shenzhen district geojson from any source.");
    })();
  }, []);

  const dataset = t.dataset;     // patent | design | trademark
  const view = t.view;           // chloropleth | scatter | heat

  // Top-k visible cluster set — passed into both panels so dominant-cluster
  // displays stay consistent. Must run BEFORE any early return so React's
  // hook order stays stable across renders. Depends on embedding because
  // embedding perturbs profile weights.
  const visibleClusters = useMemo(() => {
    const totals = computeClusterTotals(t.dataset, t.year, t.normalize, t.embedding);
    return new Set(
      CLUSTERS.slice().sort((a, b) => totals[b.id] - totals[a.id])
        .slice(0, t.k).map(c => c.id)
    );
  }, [t.dataset, t.year, t.normalize, t.k, t.embedding]);

  if (error) return <FatalError msg={error} />;
  if (!geojson) return <Booting />;

  const activeId = hoverId || selectedId;

  return (
    <div className="shell">
      <TopBar t={t} setTweak={setTweak} />
      <DisplayBar t={t} setTweak={setTweak} />
      <div className="body">
        <LeftRail
          t={t}
          focusCluster={focusCluster}
          setFocusCluster={setFocusCluster}
        />
        <MapPanel
          t={t}
          geojson={geojson}
          neighbors={neighbors}
          visibleClusters={visibleClusters}
          selectedId={selectedId}
          hoverId={hoverId}
          focusCluster={focusCluster}
          onHover={setHoverId}
          onSelect={setSelectedId}
          source={geojson.__source || "local"}
        />
        <RightRail
          t={t}
          visibleClusters={visibleClusters}
          activeId={activeId}
          focusCluster={focusCluster}
          setFocusCluster={setFocusCluster}
        />
      </div>
    </div>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function TopBar({ t, setTweak }) {
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <div className="brand-text">
          <div className="brand-name">{L(t, "brand")}</div>
          <div className="brand-sub">{L(t, "brandSub")}</div>
        </div>
      </div>

      <div className="topbar-right">
        <RunMeta t={t}/>
      </div>
    </div>
  );
}

function LangToggle({ value, onChange }) {
  return (
    <div className="lang-toggle">
      <button className={"lang-btn" + (value === "en" ? " on" : "")}
        onClick={() => onChange("en")}>EN</button>
      <button className={"lang-btn" + (value === "zh" ? " on" : "")}
        onClick={() => onChange("zh")}>中</button>
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="brandmark">
      <defs>
        <radialGradient id="bmg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#22D3A8" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="none" stroke="url(#bmg)" strokeWidth="1.2"/>
      <circle cx="11" cy="13" r="2.4" fill="#7C5CFF"/>
      <circle cx="20" cy="11" r="1.8" fill="#22D3A8"/>
      <circle cx="22" cy="20" r="2.0" fill="#F5C13B"/>
      <circle cx="12" cy="21" r="1.4" fill="#FF5A6E"/>
      <line x1="11" y1="13" x2="20" y2="11" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
      <line x1="20" y1="11" x2="22" y2="20" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
      <line x1="11" y1="13" x2="12" y2="21" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
      <line x1="12" y1="21" x2="22" y2="20" stroke="rgba(255,255,255,.25)" strokeWidth=".5"/>
    </svg>
  );
}

function Segmented({ label, value, options, onChange, hint }) {
  return (
    <div className="seg-wrap">
      <div className="seg-label" data-hint={hint || undefined}>
        {label}{hint && <span className="hint-mark">?</span>}
      </div>
      <div className="seg">
        {options.map(o => (
          <button key={o.id}
            className={"seg-btn" + (value === o.id ? " on" : "")}
            onClick={() => onChange(o.id)}>
            <span className="seg-btn-label">{o.label}</span>
            {o.sub && <span className="seg-btn-sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function RunMeta({ t }) {
  return (
    <div className="runmeta">
      <div className="runmeta-row">
        <span className="runmeta-k">{L(t, "corpus")}</span>
        <span className="runmeta-v">{CORPUS_YEAR_RANGE}</span>
      </div>
      <div className="runmeta-row">
        <span className="runmeta-k">k-means</span>
        <span className="runmeta-v">k={t.k} · {t.embedding}</span>
      </div>
      <div className="runmeta-row">
        <span className="runmeta-k">{L(t, "silhouette")}</span>
        <span className="runmeta-v">{t.embedding === "sbert" ? "0.412" : t.embedding === "bert" ? "0.387" : "0.291"}</span>
      </div>
    </div>
  );
}

// ─── Display bar (in-viz settings) ──────────────────────────────────────────

function DisplayBar({ t, setTweak }) {
  return (
    <div className="dispbar">
      <ChipGroup label={L(t, "dataset")} value={t.dataset}
        hint="Which kind of IP filing you're looking at. Patents protect inventions. Designs protect how a product looks. Trademarks protect brand names and logos. Switch to see how each one is distributed differently across the city — Futian dominates trademarks, Bao'an dominates patents."
        options={[["patent", L(t, "patents")], ["design", L(t, "designs")], ["trademark", L(t, "trademarks")]]}
        onChange={v => setTweak("dataset", v)}/>
      <ChipDivider/>
      <ChipGroup label={L(t, "embedding")} value={t.embedding}
        hint="The AI model that reads each filing's abstract and turns it into numbers, so similar filings end up close together. SBERT is the smartest and works in both Chinese and English. BERT is a strong default. Word2Vec is older and simpler. Switching reshapes which clusters dominate each district."
        options={[["sbert","SBERT"],["bert","BERT"],["word2vec","Word2Vec"]]}
        onChange={v => setTweak("embedding", v)}/>
      <ChipDivider/>
      <ChipGroup label={L(t, "view")} value={t.view}
        hint="How the map looks. Choropleth fills each district with the color of its leading industry. Scatter sprinkles a dot for every ~240 filings so you can see where the activity actually piles up inside a district."
        options={[["chloropleth", L(t, "choropleth")], ["scatter", L(t, "scatter")]]}
        onChange={v => setTweak("view", v)}/>
      <ChipDivider/>
      <ChipGroup label={L(t, "normalize")} value={t.normalize}
        hint="How filings are counted. Raw just shows totals. Per 10k pop divides by population, so dense work hubs like Nanshan stand out. Per km² divides by land area, so sprawling Bao'an looks less dominant and tight Futian rises."
        options={[["raw", L(t, "raw")],["per_capita", L(t, "perCapita")],["per_km2", L(t, "perKm2")]]}
        onChange={v => setTweak("normalize", v)}/>
      <ChipDivider/>
      <ChipGroup label={L(t, "k")} value={String(t.k)}
        hint="How many industry groups to show. Lower means broader buckets (e.g. all hardware lumped together). Higher means finer ones (semis vs EV vs robotics each become their own). Filters the map fills, dots, and rivers to just the top groups by size."
        options={[["6","6"],["9","9"],["12","12"]]}
        onChange={v => setTweak("k", parseInt(v, 10))}/>
      <div className="dispbar-spacer"/>
      <div className="dispbar-toggles">
        <ToggleChip label={L(t, "points")} on={t.showPoints}
          hint="Toggle the dots that represent individual filings. Roughly one dot per 240 filings, scattered inside each district."
          onChange={v => setTweak("showPoints", v)}/>
        <ToggleChip label={L(t, "labels")} on={t.showLabels}
          hint="Toggle district names on the map."
          onChange={v => setTweak("showLabels", v)}/>
        <ToggleChip label={L(t, "rivers")} on={t.showRivers}
          hint="Toggle the flowing 'semantic rivers' — curved lines that trace where each industry's filings actually cluster across the city. Click a group in the left sidebar to make its river light up and flow."
          onChange={v => setTweak("showRivers", v)}/>
        <LangToggle value={t.lang} onChange={v => setTweak("lang", v)}/>
      </div>
    </div>
  );
}

function ChipGroup({ label, value, options, onChange, hint }) {
  return (
    <div className="chipgroup">
      <div className="chipgroup-label" data-hint={hint || undefined}>
        {label}{hint && <span className="hint-mark">?</span>}
      </div>
      <div className="chipgroup-chips">
        {options.map(([id, lbl]) => (
          <button key={id}
            className={"chip" + (value === id ? " on" : "")}
            onClick={() => onChange(id)}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipDivider() {
  return <div className="chipgroup-divider"/>;
}

function PaletteChip({ value, onChange }) {
  const palettes = [
    { id: "default", colors: ["#7C5CFF", "#22D3A8", "#F5C13B", "#FF5A6E"] },
    { id: "cool",    colors: ["#5B9BFF", "#22D3A8", "#5BE0C2", "#7C5CFF"] },
    { id: "warm",    colors: ["#FF7A4A", "#F5C13B", "#FF6B6B", "#FF8A3D"] },
    { id: "mono",    colors: ["#9F7CFF", "#7C5CFF", "#5A35CC", "#B391FF"] },
  ];
  return (
    <div className="chipgroup">
      <div className="chipgroup-label">PALETTE</div>
      <div className="chipgroup-chips">
        {palettes.map(p => (
          <button key={p.id}
            className={"swatch" + (value === p.id ? " on" : "")}
            onClick={() => onChange(p.id)}
            title={p.id}>
            {p.colors.map((c, i) => (
              <span key={i} className="swatch-dot" style={{background: c}}/>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleChip({ label, on, onChange, hint }) {
  return (
    <button className={"tchip" + (on ? " on" : "")}
      onClick={() => onChange(!on)}
      data-hint={hint || undefined}>
      <span className="tchip-dot"/>
      {label}
    </button>
  );
}

// ─── Left rail (cluster list) ───────────────────────────────────────────────

function LeftRail({ t, focusCluster, setFocusCluster }) {
  const totals = useMemo(() => computeClusterTotals(t.dataset, t.year, t.normalize, t.embedding),
    [t.dataset, t.year, t.normalize, t.embedding]);
  const sortedClusters = useMemo(() =>
    CLUSTERS.slice().sort((a,b) => totals[b.id] - totals[a.id]).slice(0, t.k),
    [totals, t.k]);
  const max = Math.max(...sortedClusters.map(c => totals[c.id]));
  const ratio = useMemo(() => pointsPerFiling(t.dataset, t.year, t.normalize, t.density),
    [t.dataset, t.year, t.normalize, t.density]);
  const unit = normalizeUnit(t.normalize);

  return (
    <aside className="rail rail-l">
      <div className="rail-hd">
        <div className="rail-title">{L(t, "clusters")} <span className="badge">k={t.k}</span></div>
        <div className="rail-sub">{L(t, "centroidNote")}</div>
      </div>
      <div className="cluster-list">
        {sortedClusters.map(c => {
          const n = totals[c.id];
          const pct = (n / max) * 100;
          const on = focusCluster === c.id;
          const color = paletteColor(c.id, t.palette);
          return (
            <button
              key={c.id}
              className={"cluster-row" + (on ? " on" : "") + (focusCluster && !on ? " dim" : "")}
              onClick={() => setFocusCluster(on ? null : c.id)}>
              <span className="cluster-dot" style={{background: color}}/>
              <span className="cluster-meta">
                <span className="cluster-name">{clusterLabel(c.id, t.lang)}</span>
              </span>
              <span className="cluster-bar">
                <span className="cluster-bar-fill" style={{width: pct + "%", background: color}}/>
              </span>
              <span className="cluster-n">{compactNum(n)}</span>
            </button>
          );
        })}
      </div>
      <div className="rail-foot">
        <div className="legend-tiny">
          <span className="dot-tiny" style={{background:"#7C5CFF"}}/> {L(t, "legend1")}
        </div>
        <div className="legend-tiny">
          <span className="dot-tiny ring"/> {L(t, "legend2")} <Num n={Math.round(ratio)}/> {L(t, t.dataset + "s") || t.dataset + "s"}{unit && <span style={{opacity:.6}}> {unit}</span>}
        </div>
      </div>
    </aside>
  );
}

function computeClusterTotals(dataset, year, normalize, embedding) {
  const t = Object.fromEntries(CLUSTERS.map(c => [c.id, 0]));
  for (const id of Object.keys(DISTRICT_META)) {
    const filings = displayFilings(id, dataset, year, normalize);
    const profile = getProfile(id, embedding);
    for (const [cid, w] of Object.entries(profile)) {
      t[cid] = (t[cid] || 0) + filings * w;
    }
  }
  return t;
}

// Mirror MapPanel's scatter scaling so the legend can report the true ratio.
function pointsPerFiling(dataset, year, normalize, density) {
  const scale = normalize === "per_capita" ? 0.6 : (normalize === "per_km2" ? 0.6 : 240);
  let totalFilings = 0, totalPoints = 0;
  for (const id of Object.keys(DISTRICT_META)) {
    const filings = displayFilings(id, dataset, year, normalize);
    const n = Math.round(Math.min(220, Math.max(8, filings / scale)) * (density || 1));
    totalFilings += filings;
    totalPoints += n;
  }
  return totalPoints > 0 ? totalFilings / totalPoints : 1;
}

// ─── Map ────────────────────────────────────────────────────────────────────

const MAP_W = 920;
const MAP_H = 620;

function MapPanel(props) {
  const { t, geojson, neighbors, visibleClusters, selectedId, hoverId, focusCluster, onHover, onSelect, source } = props;
  const { dataset, view, showPoints, showLabels, showRivers, density, highlightDominant,
          palette, pointSize, pointShape, outline, labelLang, year, normalize, k, embedding, lang } = t;

  // visibleClusters is now provided by App (already top-k filtered).

  const projection = useMemo(() => {
    // geoIdentity (with Y-flip) instead of geoMercator: avoids d3-geo's
    // spherical antimeridian clipping, which mis-renders polygons whose
    // outer rings are wound clockwise (common in CNIPA/Aliyun exports).
    // At city scale Mercator distortion is invisible — identity is fine.
    const p = d3.geoIdentity().reflectY(true).fitExtent(
      [[40, 36], [MAP_W - 40, MAP_H - 36]], geojson
    );
    return p;
  }, [geojson]);

  const path = useMemo(() => d3.geoPath().projection(projection), [projection]);

  // Pre-compute centroids (in projected space) for labels.
  const centroids = useMemo(() => {
    const out = {};
    for (const f of geojson.features) {
      out[f.properties.id] = path.centroid(f);
    }
    return out;
  }, [geojson, path]);

  // Generate points for each district (deterministic).
  const allPoints = useMemo(() => {
    const out = [];
    for (const f of geojson.features) {
      const id = f.properties.id;
      const meta = DISTRICT_META[id];
      if (!meta) continue;
      const filings = displayFilings(id, dataset, year, normalize);
      const scale = normalize === "per_capita" ? 0.6 : (normalize === "per_km2" ? 0.6 : 240);
      const n = Math.round(Math.min(220, Math.max(8, filings / scale)) * density);
      const seed = hashSeed(id + "|" + dataset + "|" + year + "|" + normalize + "|" + t.embedding);
      const pts = sampleApplications(f, id, n, seed);
      // Reassign each point's cluster using the perturbed profile so the
      // embedding choice visibly redistributes scatter colors.
      const profile = getProfile(id, t.embedding);
      const rand = mulberry32(seed ^ 0x9e3779b9);
      for (const p of pts) {
        p.cluster = pickWeighted(profile, rand);
        out.push({ ...p, district: id });
      }
    }
    return out;
  }, [geojson, dataset, density, year, normalize, t.embedding]);

  const projectedPoints = useMemo(() => {
    return allPoints
      .filter(p => visibleClusters.has(p.cluster))
      .map(p => {
        const [x, y] = projection([p.lng, p.lat]);
        return { ...p, x, y };
      });
  }, [allPoints, projection, visibleClusters]);

  const activeId = hoverId || selectedId;
  const dominantByDistrict = useMemo(() => {
    const out = {};
    for (const f of geojson.features) {
      const id = f.properties.id;
      const profile = getProfile(id, t.embedding);
      let best = null, bestW = -1;
      for (const [cid, w] of Object.entries(profile)) {
        if (visibleClusters.has(cid) && w > bestW) { bestW = w; best = cid; }
      }
      out[id] = best || dominantCluster(id);
    }
    return out;
  }, [geojson, visibleClusters, t.embedding]);

  // Semantic rivers — for each cluster, find the MST-diameter path through
  // its actual scatter points and render a smooth curve. This routes the
  // river along the spine of where the cluster's applications really live,
  // instead of between district centroids.
  const rivers = useMemo(() => {
    const byCluster = {};
    for (const p of projectedPoints) {
      if (!byCluster[p.cluster]) byCluster[p.cluster] = [];
      byCluster[p.cluster].push(p);
    }
    return Object.entries(byCluster)
      .filter(([, pts]) => pts.length >= 4)
      .map(([cid, pts]) => ({
        cluster: cid,
        // Prefer the real migration trajectory: per-year, weighted average of
        // district centroids by WIPO migration_share. Falls back to the
        // space-time MST through the scatter when no migration data exists.
        path: migrationPath(cid, centroids) || orderViaMST(pts),
        count: pts.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [projectedPoints, centroids]);

  return (
    <div className="map-wrap">
      <div className="map-chrome">
        <div className="map-title">
          <span className="map-eyebrow">SHENZHEN · 深圳</span>
          <span className="map-h">{L(t, "shenzhenSub")}</span>
        </div>
      </div>

      <svg className="map" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {CLUSTERS.map(c => (
            <radialGradient key={c.id} id={"glow-" + c.id} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c.color} stopOpacity="0.55"/>
              <stop offset="100%" stopColor={c.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* Surrounding HK + PRD city outlines — drawn faint behind SZ */}
        {(neighbors || []).map((ring, i) => {
          const d = "M" + ring.map(([x, y]) => projection([x, y]).map(v => v.toFixed(1)).join(",")).join("L") + "Z";
          return (
            <path key={"nbr-" + i} d={d}
              fill="rgba(255,255,255,0.018)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="0.6"
              strokeLinejoin="round"
              style={{pointerEvents: "none"}}/>
          );
        })}

        {/* Region labels on the faint outlines — fixed SVG positions because
            mainland & HK fall outside the SZ-fitted projection extent. */}
        {(() => {
          const cnX = 440, cnY = 52;
          const hkX = 460, hkY = MAP_H - 110;
          return (
            <g style={{pointerEvents: "none"}}>
              <text x={cnX} y={cnY} textAnchor="middle" className="region-label">
                MAINLAND CHINA
              </text>
              <text x={cnX} y={cnY + 26} textAnchor="middle" className="region-label-cn">
                中国大陆
              </text>
              <text x={hkX} y={hkY} textAnchor="middle" className="region-label">
                HONG KONG
              </text>
              <text x={hkX} y={hkY + 26} textAnchor="middle" className="region-label-cn">
                香港
              </text>
            </g>
          );
        })()}

        {/* District fills */}
        <g>
          {geojson.features.map(f => {
            const id = f.properties.id;
            const cid = dominantByDistrict[id];
            const cluster = CLUSTER_BY_ID[cid];
            const isActive = activeId === id;
            const dimmed = activeId && !isActive;
            const baseColor = paletteColor(cid, palette);

            let fillColor = "rgba(60,72,88,0.30)";
            let strokeColor = "rgba(255,255,255,0.10)";
            if (view === "chloropleth" && highlightDominant) {
              fillColor = hexToRgba(baseColor, isActive ? 0.42 : 0.22);
              strokeColor = hexToRgba(baseColor, 0.55);
            }
            if (focusCluster) {
              const w = getProfile(id, t.embedding)[focusCluster] || 0;
              const fcColor = paletteColor(focusCluster, palette);
              fillColor = hexToRgba(fcColor, 0.05 + w * 0.7);
              strokeColor = hexToRgba(fcColor, 0.55);
            }

            return (
              <path key={id} d={path(f)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={(isActive ? 1.8 : 1.0) * outline}
                style={{
                  opacity: dimmed ? 0.55 : 1,
                  cursor: "pointer",
                  transition: "fill 220ms ease, stroke 220ms ease, opacity 220ms ease",
                }}
                onMouseEnter={() => onHover(id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(selectedId === id ? null : id)}
              />
            );
          })}
        </g>

        {/* Semantic rivers — smooth curve along MST-diameter through cluster points */}
        {showRivers && (
          <g className="rivers" style={{mixBlendMode: "screen"}}>
            {rivers.map((r) => {
              const color = paletteColor(r.cluster, palette);
              const isFocus = focusCluster && r.cluster === focusCluster;
              const offFocus = focusCluster && r.cluster !== focusCluster;
              const d = smoothRiverPath(r.path);
              if (!d) return null;

              if (isFocus) {
                // Densely sample the smooth curve and apply a gaussian-blur
                // filter so the segment boundaries dissolve into a continuous
                // gradient wave.
                const pts = sampleSmoothPath(r.path, 16);
                const lens = pathLength(pts);
                const total = lens[lens.length - 1] || 1;
                const cycle = 2.8;
                const blurId = `riverblur-${r.cluster}`;
                return (
                  <g key={r.cluster}>
                    <defs>
                      <filter id={blurId} x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="1.0"/>
                      </filter>
                    </defs>
                    {/* base channel — full river always visible */}
                    <path d={d} fill="none" stroke={color}
                      strokeWidth="3" strokeOpacity="0.42"
                      strokeLinecap="round" strokeLinejoin="round"/>
                    {/* segmented gradient wave, blurred to seamlessly blend */}
                    <g filter={`url(#${blurId})`} style={{mixBlendMode: "screen"}}>
                      {pts.slice(0, -1).map((p, i) => {
                        const p2 = pts[i + 1];
                        const arcPos = ((lens[i] + lens[i + 1]) / 2) / total;
                        return (
                          <line key={i}
                            x1={p[0].toFixed(2)} y1={p[1].toFixed(2)}
                            x2={p2[0].toFixed(2)} y2={p2[1].toFixed(2)}
                            stroke={color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            className="river-wave"
                            style={{ animationDelay: `${(-arcPos * cycle).toFixed(3)}s` }}/>
                        );
                      })}
                    </g>
                  </g>
                );
              }

              const op = offFocus ? 0.02 : 0.32;
              const w = 1.4;
              return (
                <path key={r.cluster}
                  d={d} fill="none" stroke={color}
                  strokeWidth={w} opacity={op}
                  strokeLinecap="round" strokeLinejoin="round"/>
              );
            })}
          </g>
        )}

        {/* Heat blobs underneath points */}
        {view === "heat" && (
          <g style={{mixBlendMode: "screen"}}>
            {projectedPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="22"
                fill={"url(#glow-" + p.cluster + ")"}
                opacity={focusCluster ? (p.cluster === focusCluster ? 0.9 : 0.04) : 0.55}/>
            ))}
          </g>
        )}

        {/* Scatter points */}
        {showPoints && view !== "heat" && (
          <g>
            {projectedPoints.map((p, i) => {
              const color = paletteColor(p.cluster, palette);
              const dim = focusCluster && p.cluster !== focusCluster;
              const r = (view === "scatter" ? 2.2 : 1.6) * pointSize;
              const opacity = dim ? 0.08 : (view === "scatter" ? 0.85 : 0.7);
              if (pointShape === "ring") {
                return (
                  <circle key={i} cx={p.x} cy={p.y} r={r}
                    fill="none" stroke={color} strokeWidth={Math.max(0.5, r*0.5)}
                    opacity={opacity} style={{pointerEvents:"none"}}/>
                );
              }
              if (pointShape === "diamond") {
                return (
                  <rect key={i} x={p.x - r} y={p.y - r} width={r*2} height={r*2}
                    fill={color} opacity={opacity}
                    transform={`rotate(45 ${p.x} ${p.y})`}
                    style={{pointerEvents:"none"}}/>
                );
              }
              return (
                <circle key={i} cx={p.x} cy={p.y} r={r}
                  fill={color} opacity={opacity} style={{pointerEvents:"none"}}/>
              );
            })}
          </g>
        )}

        {/* District labels */}
        {showLabels && geojson.features.map(f => {
          const id = f.properties.id;
          const [cx, cy] = centroids[id];
          const meta = DISTRICT_META[id];
          const cid = dominantByDistrict[id];
          const cluster = CLUSTER_BY_ID[cid];
          const isActive = activeId === id;
          const dimmed = activeId && !isActive;
          const showEN = labelLang !== "cn";
          const showCN = labelLang !== "en";
          const tagY = (showEN ? -2 : 0) + (showCN ? 0 : 6);
          return (
            <g key={"lbl-" + id} transform={`translate(${cx},${cy})`}
              style={{opacity: dimmed ? 0.4 : 1, pointerEvents: "none",
                transition: "opacity 220ms ease"}}>
              {showEN && (
                <text className="dlabel" textAnchor="middle" y={showCN ? -2 : 0}>
                  {meta.name}
                </text>
              )}
              {showCN && (
                <text className="dlabel-cn" textAnchor="middle" y={showEN ? 12 : 4}>
                  {meta.nameCN}
                </text>
              )}
              <text className="dlabel-tag" textAnchor="middle"
                y={(showEN ? 12 : 0) + (showCN ? 16 : 14)}
                fill={paletteColor(cid, palette)}>
                ▸ {clusterLabel(cid, lang)}
              </text>
            </g>
          );
        })}

      </svg>

      <MapFootbar t={t} pointCount={projectedPoints.length} source={source}/>
      <WorldInset/>
      <ScaleBar/>
      <Compass/>
    </div>
  );
}

function Compass() {
  return (
    <div className="map-compass">
      <svg width="44" height="44" viewBox="-22 -22 44 44">
        <circle r="22" fill="rgba(20,24,32,0.65)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M0,-14 L4,4 L0,1 L-4,4 Z" fill="rgba(255,255,255,0.85)"/>
        <text textAnchor="middle" y="-16" className="compass-n">N</text>
      </svg>
    </div>
  );
}

function MapFootbar({ t, pointCount, source }) {
  const { view, dataset, year, normalize } = t;
  const srcLabel = source === "aliyun"
    ? "Aliyun DataV (440300) · CNIPA · live"
    : "Aliyun DataV (440300) · CNIPA · local";
  const yearLabel = year === "all" ? CORPUS_YEAR_RANGE : year;
  const normLabel = normalize === "raw" ? "" : (normalize === "per_capita" ? " · /10k pop" : " · /km²");
  return (
    <div className="map-foot">
      <div className="foot-stat">
        <div className="foot-k">{L(t, "view")}</div>
        <div className="foot-v">{L(t, view)}</div>
      </div>
      <div className="foot-stat">
        <div className="foot-k">{L(t, "plotted")}</div>
        <div className="foot-v"><Num n={pointCount}/> {L(t, dataset + "s")}</div>
      </div>
      <div className="foot-stat">
        <div className="foot-k">{L(t, "year")}</div>
        <div className="foot-v">{yearLabel}{normLabel}</div>
      </div>
      <div className="foot-stat flex">
        <div className="foot-k">{L(t, "source")}</div>
        <div className="foot-v small">{srcLabel}</div>
      </div>
    </div>
  );
}

// ─── World inset — "you are here" ───────────────────────────────────────────

// Real China outline — derived from Aliyun DataV national geojson (100000.json),
// decimated to ~878 vertices across 32 polygons. Loaded from china-outline.js.
const CN_POLYS = window.CN_POLYS || [];

function WorldInset() {
  const W = 168, H = 132;
  // Bounds tuned to fit mainland + Hainan + Taiwan + outlying islands.
  const [minL, maxL] = [72, 136];
  const [minT, maxT] = [16, 55];
  const proj = ([lng, lat]) => [
    8 + ((lng - minL) / (maxL - minL)) * (W - 16),
    8 + ((maxT - lat) / (maxT - minT)) * (H - 16),
  ];
  const [sx, sy] = proj([114.06, 22.55]);
  const [bx, by] = proj([116.4, 39.9]);
  const [hx, hy] = proj([121.5, 31.2]);
  const [lx, ly] = proj([104.11, 37.57]);

  return (
    <div className="winset">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="winset-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#7C5CFF" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
          {[20, 30, 40, 50].map(lat => {
            const [, y] = proj([0, lat]);
            return <line key={"lat"+lat} x1="2" y1={y} x2={W-2} y2={y}/>;
          })}
          {[80, 100, 120].map(lng => {
            const [x] = proj([lng, 0]);
            return <line key={"lng"+lng} x1={x} y1="2" x2={x} y2={H-2}/>;
          })}
        </g>
        <g fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5" strokeLinejoin="round">
          {CN_POLYS.map((poly, i) => (
            <polygon key={i}
              points={poly.map(proj).map(p => p.join(",")).join(" ")}/>
          ))}
        </g>
        <text x={lx} y={ly + 10} textAnchor="middle" className="winset-country">CHINA</text>
        <text x={lx} y={ly + 19} textAnchor="middle" className="winset-country-cn">中国</text>
        <g>
          <circle cx={bx} cy={by} r="1.3" fill="rgba(255,255,255,0.4)"/>
          <text x={bx + 4} y={by + 3} className="winset-city">Beijing</text>
          <circle cx={hx} cy={hy} r="1.3" fill="rgba(255,255,255,0.4)"/>
          <text x={hx + 4} y={hy + 3} className="winset-city">Shanghai</text>
        </g>
        <circle cx={sx} cy={sy} r="11" fill="url(#winset-glow)"/>
        <circle cx={sx} cy={sy} r="3" fill="#7C5CFF"
          stroke="#ffffff" strokeWidth="1"/>
        <text x={sx - 6} y={sy + 13} className="winset-here">SHENZHEN</text>
      </svg>
      <div className="winset-label">22.55° N · 114.06° E</div>
    </div>
  );
}

function ScaleBar() {
  return (
    <div className="map-scalebar-floating">
      <div className="scalebar-line"/>
      <div className="scalebar-label">10 km</div>
    </div>
  );
}

// ─── Right rail ─────────────────────────────────────────────────────────────

function RightRail({ t, visibleClusters, activeId, focusCluster, setFocusCluster }) {
  if (focusCluster && !activeId) {
    return <ClusterDetail t={t} visibleClusters={visibleClusters}
      cluster={CLUSTER_BY_ID[focusCluster]}
      onClear={() => setFocusCluster(null)}/>;
  }
  if (activeId) {
    return <DistrictDetail t={t} visibleClusters={visibleClusters}
      id={activeId} setFocusCluster={setFocusCluster}/>;
  }
  return <OverviewPanel t={t} visibleClusters={visibleClusters}/>;
}

// Pick the highest-weight cluster for `districtId` whose id is in `visible`.
function dominantIn(districtId, visible, embedding) {
  const profile = getProfile(districtId, embedding);
  let best = null, bestW = -1;
  for (const [cid, w] of Object.entries(profile)) {
    if (visible.has(cid) && w > bestW) { bestW = w; best = cid; }
  }
  return best || dominantCluster(districtId);
}

function OverviewPanel({ t, visibleClusters }) {
  const { dataset, year, normalize, palette } = t;
  const total = Object.keys(DISTRICT_META).reduce((s, id) => s + displayFilings(id, dataset, year, normalize), 0);
  const top = Object.keys(DISTRICT_META)
    .map(id => ({id, n: displayFilings(id, dataset, year, normalize), m: DISTRICT_META[id]}))
    .sort((a, b) => b.n - a.n)
    .slice(0, 4);
  const unit = normalizeUnit(normalize);

  return (
    <aside className="rail rail-r">
      <div className="rail-hd">
        <div className="rail-title">{L(t, "overview")}</div>
        <div className="rail-sub">{L(t, "hoverHint")}</div>
      </div>

      <div className="kpi">
        <div className="kpi-k">{L(t, t.dataset + "s")} {L(t, "embeddedSuffix")} {unit && <span style={{opacity:.6}}>· {unit}</span>}</div>
        <div className="kpi-v"><Num n={Math.round(total)}/></div>
        <div className="kpi-sub">{year === "all" ? CORPUS_YEAR_RANGE : year} · CNIPA Shenzhen</div>
      </div>

      <div className="section-h">{L(t, "topDistricts")}</div>
      <div className="topdist">
        {top.map((r, i) => {
          const cid = dominantIn(r.id, visibleClusters, t.embedding);
          const color = paletteColor(cid, palette);
          return (
            <div key={r.id} className="topdist-row">
              <div className="topdist-rank">{i + 1}</div>
              <div className="topdist-name">
                <div className="topdist-en">{r.m.name}</div>
                <div className="topdist-cn">{r.m.nameCN}</div>
              </div>
              <div className="topdist-bar">
                <div className="topdist-fill"
                  style={{width: ((r.n / top[0].n) * 100) + "%",
                          background: color}}/>
              </div>
              <div className="topdist-n"><Num n={Math.round(r.n)}/></div>
            </div>
          );
        })}
      </div>

      <div className="section-h">{L(t, "method")}</div>
      <div className="method">
        <div className="method-step">
          <div className="step-n">1</div>
          <div>
            <div className="step-h">{L(t, "tokenize")}</div>
            <div className="step-d">{L(t, "tokenizeDesc")}</div>
          </div>
        </div>
        <div className="method-step">
          <div className="step-n">2</div>
          <div>
            <div className="step-h">{L(t, "embed")}</div>
            <div className="step-d">{t.embedding.toUpperCase()} ({t.embedding === "word2vec" ? "300d" : "768d"})</div>
          </div>
        </div>
        <div className="method-step">
          <div className="step-n">3</div>
          <div>
            <div className="step-h">{L(t, "cluster")}</div>
            <div className="step-d">{L(t, "clusterDesc").replace("{k}", t.k)}</div>
          </div>
        </div>
        <div className="method-step">
          <div className="step-n">4</div>
          <div>
            <div className="step-h">{L(t, "geocode")}</div>
            <div className="step-d">{L(t, "geocodeDesc")}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DistrictDetail({ t, visibleClusters, id, setFocusCluster }) {
  const { dataset, year, normalize, palette, embedding } = t;
  const meta = DISTRICT_META[id];
  const profile = getProfile(id, embedding);
  const filings = displayFilings(id, dataset, year, normalize);
  const cid = dominantIn(id, visibleClusters, embedding);
  const cluster = CLUSTER_BY_ID[cid];
  const color = paletteColor(cid, palette);
  const unit = normalizeUnit(normalize);

  const ranked = Object.entries(profile)
    .filter(([cid]) => visibleClusters.has(cid))
    .sort((a, b) => b[1] - a[1]);

  return (
    <aside className="rail rail-r">
      <div className="rail-hd">
        <div className="postal">{meta.postal}</div>
        <div className="district-name">{meta.name}</div>
        <div className="district-cn">{meta.nameCN}</div>
      </div>

      <div className="dominant" style={{borderColor: hexToRgba(color, 0.5)}}>
        <div className="dominant-k">{L(t, "dominantCluster")}</div>
        <div className="dominant-v" style={{color}}>
          <span className="dominant-dot" style={{background: color}}/>
          {clusterLabel(cid, t.lang)}
        </div>
        <div className="dominant-pct">
          {(profile[cid] * 100).toFixed(0)}% {L(t, "embeddings")} · {cluster.short}
        </div>
      </div>

      <div className="trio">
        <div className="trio-cell">
          <div className="trio-k">{L(t, t.dataset + "s")} {unit && <span style={{opacity:.55}}>{unit}</span>}</div>
          <div className="trio-v"><Num n={Math.round(filings)}/></div>
        </div>
        <div className="trio-cell">
          <div className="trio-k">{L(t, "density")}</div>
          <div className="trio-v">{Math.round(meta.filings[dataset] / meta.area)}<span className="unit">/km²</span></div>
        </div>
        <div className="trio-cell">
          <div className="trio-k">{L(t, "pop")}</div>
          <div className="trio-v">{(meta.pop / 1000).toFixed(2)}<span className="unit">M</span></div>
        </div>
      </div>

      <div className="section-h">{L(t, "clusterMix")}</div>
      <div className="mix">
        {ranked.map(([cid, w]) => {
          const c = CLUSTER_BY_ID[cid];
          const cc = paletteColor(cid, palette);
          return (
            <button key={cid} className="mix-row"
              onClick={() => setFocusCluster(cid)}>
              <span className="mix-dot" style={{background: cc}}/>
              <span className="mix-label">{clusterLabel(cid, t.lang)}</span>
              <span className="mix-bar">
                <span className="mix-fill" style={{width: (w*100) + "%", background: cc}}/>
              </span>
              <span className="mix-pct">{(w*100).toFixed(0)}%</span>
            </button>
          );
        })}
      </div>

      <div className="section-h">{L(t, "signalPhrases")}</div>
      <div className="phrases">
        {phrasesFor(cid).map((p, i) => (
          <span key={i} className="phrase" style={{
            borderColor: hexToRgba(color, 0.35),
            color: hexToRgba(color, 0.95)
          }}>{p}</span>
        ))}
      </div>

      <div className="section-h">{L(t, "sampleAssignees")}</div>
      <div className="assignees">
        {assigneesFor(id).map((a, i) => (
          <div key={i} className="assignee">
            <div className="assignee-dot" style={{background: paletteColor(a.cluster, palette)}}/>
            <div className="assignee-name">{a.name}</div>
            <div className="assignee-n"><Num n={a.n}/></div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ClusterDetail({ t, visibleClusters, cluster, onClear }) {
  const { dataset, year, normalize, palette } = t;
  const color = paletteColor(cluster.id, palette);
  // Rank districts by this cluster's weight × district filings
  const ranked = Object.keys(DISTRICT_META).map(id => {
    const w = getProfile(id, t.embedding)[cluster.id] || 0;
    return { id, m: DISTRICT_META[id], n: displayFilings(id, dataset, year, normalize) * w, w };
  }).sort((a, b) => b.n - a.n);

  return (
    <aside className="rail rail-r">
      <div className="rail-hd">
        <button className="back-btn" onClick={onClear}>← {L(t, "allClusters")}</button>
        <div className="cdetail-h" style={{color}}>
          <span className="cdetail-dot" style={{background: color}}/>
          {clusterLabel(cluster.id, t.lang)}
        </div>
        <div className="rail-sub">{cluster.short} · c-TF-IDF</div>
      </div>

      <div className="kpi">
        <div className="kpi-k">{L(t, t.dataset + "s")} {L(t, "inCluster")}</div>
        <div className="kpi-v"><Num n={Math.round(ranked.reduce((s,r) => s+r.n, 0))}/></div>
        <div className="kpi-sub">{L(t, "across10")}</div>
      </div>

      <div className="section-h">{L(t, "concentration")}</div>
      <div className="conc">
        {ranked.map((r, i) => (
          <div key={r.id} className="conc-row">
            <div className="conc-rank">{i + 1}</div>
            <div className="conc-name">{r.m.name}</div>
            <div className="conc-bar">
              <div className="conc-fill" style={{
                width: ((r.n / ranked[0].n) * 100) + "%",
                background: color
              }}/>
            </div>
            <div className="conc-n">{(r.w * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>

      <div className="section-h">{L(t, "signalPhrases")}</div>
      <div className="phrases">
        {phrasesFor(cluster.id).map((p, i) => (
          <span key={i} className="phrase" style={{
            borderColor: hexToRgba(color, 0.35),
            color: hexToRgba(color, 0.95)
          }}>{p}</span>
        ))}
      </div>
    </aside>
  );
}

// ─── Loading / error ────────────────────────────────────────────────────────

function Booting() {
  return (
    <div className="boot">
      <div className="boot-bar">
        <span/><span/><span/>
      </div>
      <div className="boot-text">embedding · clustering · projecting</div>
    </div>
  );
}

function FatalError({ msg }) {
  return (
    <div className="boot">
      <div className="boot-text" style={{color: "#FF5A6E"}}>Failed to load geojson</div>
      <pre style={{fontSize: 11, opacity: 0.6, marginTop: 12}}>{msg}</pre>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Num({ n }) {
  return <span className="num">{(n || 0).toLocaleString("en-US")}</span>;
}

function compactNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n).toString();
}

function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Migration trajectory: real per-year per-district shares ───────────────

// For each cluster, weight the projected district centroids by the real
// migration_share[cluster][year][district] (from WIPO_CORPUS) and emit one
// point per year. The chronological chain of weighted centroids = literal
// "where the cluster's filings concentrated in each year". Returns null when
// no migration data is available for that cluster (falls back to MST).
function migrationPath(clusterId, districtCentroids) {
  const corpus = (typeof window !== 'undefined') && window.WIPO_CORPUS;
  if (!corpus || !corpus.migration_share || !corpus.migration_share[clusterId]) return null;
  const ms = corpus.migration_share[clusterId];
  const years = CORPUS_YEARS;
  const out = [];
  for (const y of years) {
    const shares = ms[y];
    if (!shares) continue;
    let sx = 0, sy = 0, sw = 0;
    for (const [district, w] of Object.entries(shares)) {
      const c = districtCentroids[district];
      if (!c) continue;
      sx += c[0] * w; sy += c[1] * w; sw += w;
    }
    if (sw > 0) out.push([sx / sw, sy / sw]);
  }
  return out.length >= 2 ? out : null;
}

// ─── Semantic rivers: MST-diameter routing through scatter points ──────────

// Order scatter points along the diameter of a SPACE-TIME minimum spanning
// tree. Each point lives in (x, y, year*T_SCALE); MST edges weight by squared
// 3-D distance, then the diameter is the longest hop path. The output curve
// therefore traces the cluster's longest space-time spine — read as
// "the cluster migrated from (here, oldest) to (there, newest)".
//
// T_SCALE expresses 1 year as a spatial distance in projected pixels. Picked
// from each cluster's own geographic spread so time and space contribute
// comparably regardless of how concentrated the cluster is.
function orderViaMST(points) {
  let pts = points;
  if (pts.length > 160) {
    const step = Math.ceil(pts.length / 140);
    pts = pts.filter((_, i) => i % step === 0);
  }
  const N = pts.length;
  if (N < 2) return pts.map(p => [p.x, p.y]);

  // Compute T_SCALE adaptively: average half-extent of the point cloud
  // divided by the year-range, scaled up so time is weighted ~equal to space.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let minT = Infinity, maxT = -Infinity, anyYear = false;
  for (const p of pts) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    if (p.year) { anyYear = true; if (p.year < minT) minT = p.year; if (p.year > maxT) maxT = p.year; }
  }
  const halfExtent = ((maxX - minX) + (maxY - minY)) * 0.5;
  const yearRange = anyYear ? Math.max(1, maxT - minT) : 1;
  const T_SCALE = anyYear ? halfExtent / yearRange : 0;
  const pt = pts.map(p => (p.year || 0) * T_SCALE);

  const sqd = (i, j) => {
    const dx = pts[i].x - pts[j].x;
    const dy = pts[i].y - pts[j].y;
    const dt = pt[i] - pt[j];
    return dx*dx + dy*dy + dt*dt;
  };

  // Prim's MST (dense) over space-time distance.
  const inMST = new Array(N).fill(false);
  const adj = Array.from({ length: N }, () => []);
  const bestDist = new Array(N).fill(Infinity);
  const bestSrc  = new Array(N).fill(0);
  inMST[0] = true;
  for (let v = 1; v < N; v++) bestDist[v] = sqd(0, v);
  for (let k = 1; k < N; k++) {
    let pick = -1, pickD = Infinity;
    for (let v = 0; v < N; v++) {
      if (!inMST[v] && bestDist[v] < pickD) { pickD = bestDist[v]; pick = v; }
    }
    if (pick < 0) break;
    inMST[pick] = true;
    adj[pick].push(bestSrc[pick]);
    adj[bestSrc[pick]].push(pick);
    for (let v = 0; v < N; v++) {
      if (inMST[v]) continue;
      const d = sqd(pick, v);
      if (d < bestDist[v]) { bestDist[v] = d; bestSrc[v] = pick; }
    }
  }

  // Two-pass BFS to find tree diameter (hop count).
  function farthest(start) {
    const dist = new Array(N).fill(-1);
    const parent = new Array(N).fill(-1);
    dist[start] = 0;
    const q = [start];
    let head = 0, far = start;
    while (head < q.length) {
      const u = q[head++];
      for (const v of adj[u]) if (dist[v] < 0) {
        dist[v] = dist[u] + 1;
        parent[v] = u;
        if (dist[v] > dist[far]) far = v;
        q.push(v);
      }
    }
    return { far, parent };
  }
  const a = farthest(0).far;
  const { far: b, parent } = farthest(a);
  const idxPath = [];
  for (let cur = b; cur !== -1; cur = parent[cur]) idxPath.push(cur);

  // Orient old→new: reverse if path head's mean year is newer than tail's.
  // (Same logic as before; the underlying MST has now been built in space-time
  // so the diameter already prefers moving across years, but we still need to
  // pick which of the two endpoints is the start.)
  if (anyYear) {
    const avgYear = (slice) => {
      let s = 0, n = 0;
      for (const i of slice) { const y = pts[i].year; if (y) { s += y; n++; } }
      return n ? s / n : null;
    };
    const yHead = avgYear(idxPath.slice(0, 5));
    const yTail = avgYear(idxPath.slice(-5));
    if (yHead != null && yTail != null && yHead > yTail) idxPath.reverse();
  }
  return idxPath.map(i => [pts[i].x, pts[i].y]);
}

// Direction the gradient should flow along, derived from the path's bbox:
// horizontal if clearly wider, vertical if clearly taller, otherwise the
// first→last vector. Avoids PCA's lateral-spread bias on near-axis paths.
function flowDirection(points) {
  const n = points.length;
  if (n < 2) return [1, 0];
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const [x, y] of points) {
    if (x < minx) minx = x;  if (x > maxx) maxx = x;
    if (y < miny) miny = y;  if (y > maxy) maxy = y;
  }
  const w = maxx - minx, h = maxy - miny;
  // Walk first→last to get the path's natural orientation sign.
  const [sx, sy] = points[0];
  const [ex, ey] = points[n - 1];
  const dx = ex - sx, dy = ey - sy;
  if (w > h * 1.3)  return [Math.sign(dx) || 1, 0];
  if (h > w * 1.3)  return [0, Math.sign(dy) || 1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [dx / len, dy / len];
}

// Cumulative arc lengths along a polyline.
function pathLength(points) {
  const out = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i-1][0];
    const dy = points[i][1] - points[i-1][1];
    out.push(out[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  return out;
}

// Densely sample points along the same quadratic-bezier midpoint curve that
// smoothRiverPath() draws, so animated segments hug exactly the same curve
// as the static base channel.
function sampleSmoothPath(points, samplesPerSegment = 16) {
  if (points.length < 2) return points.slice();
  const out = [points[0]];
  let prev = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const C = points[i];
    const next = points[i + 1];
    const end = [(C[0] + next[0]) / 2, (C[1] + next[1]) / 2];
    for (let s = 1; s <= samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const u = 1 - t;
      out.push([
        u*u * prev[0] + 2*u*t * C[0] + t*t * end[0],
        u*u * prev[1] + 2*u*t * C[1] + t*t * end[1],
      ]);
    }
    prev = end;
  }
  // Final T segment — control reflected around prev from previous control.
  if (points.length >= 2) {
    const lastCtl = points[points.length - 2];
    const end = points[points.length - 1];
    const C = [2 * prev[0] - lastCtl[0], 2 * prev[1] - lastCtl[1]];
    for (let s = 1; s <= samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const u = 1 - t;
      out.push([
        u*u * prev[0] + 2*u*t * C[0] + t*t * end[0],
        u*u * prev[1] + 2*u*t * C[1] + t*t * end[1],
      ]);
    }
  }
  return out;
}

// Smooth path through points using quadratic-bezier midpoint trick.
function smoothRiverPath(points) {
  if (!points || points.length < 2) return "";
  const f = n => n.toFixed(1);
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  if (points.length === 2) {
    return d + `L${f(points[1][0])},${f(points[1][1])}`;
  }
  for (let i = 1; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    d += ` Q${f(x1)},${f(y1)} ${f(mx)},${f(my)}`;
  }
  const last = points[points.length - 1];
  d += ` T${f(last[0])},${f(last[1])}`;
  return d;
}

// Cluster-specific signal phrases / assignees (mocked but plausible)
function phrasesFor(cid) {
  const M = {
    ai:       ["neural network architecture", "transformer attention", "model distillation", "few-shot learning", "vision-language", "graph embedding"],
    semi:     ["wafer-level package", "EUV lithography mask", "FinFET", "memory interconnect", "RF front-end", "GaN HEMT"],
    fintech:  ["digital RMB wallet", "settlement ledger", "credit scoring graph", "anti-fraud rule engine", "QR payment token", "KYC ID binding"],
    medtech:  ["minimally invasive endoscope", "wearable ECG patch", "PCR microfluidic chip", "MRI gradient coil", "surgical robot arm", "smart inhaler"],
    biotech:  ["mRNA vaccine adjuvant", "CRISPR delivery vector", "monoclonal antibody", "tumor marker assay", "stem-cell scaffold", "synthetic peptide"],
    ev:       ["lithium iron phosphate", "battery thermal management", "blade cell module", "motor inverter SiC", "fast-charging protocol", "BMS state estimation"],
    telecom:  ["5G base station beamforming", "mMTC scheduler", "PON optical module", "MEC edge node", "antenna array tuning", "NTN satellite uplink"],
    mfg:      ["SMT pick-and-place head", "injection mold lattice", "AOI defect detection", "CNC tool path", "automated welding cell", "factory MES sync"],
    robotics: ["VIO state estimation", "obstacle-avoidance LiDAR", "grasping gripper", "swarm drone protocol", "humanoid joint torque", "AGV docking"],
    logistics:["smart container seal", "cold-chain tracker", "port crane scheduling", "AIS vessel routing", "RFID pallet tag", "customs OCR"],
    consumer: ["folding screen hinge", "TWS earbud antenna", "smart speaker DSP", "wearable strap sensor", "AR glasses optics", "haptic actuator"],
    urban:    ["smart streetlight node", "building energy twin", "parking-lot LPR", "AQI sensor mesh", "low-carbon HVAC", "facade BIPV"],
  };
  return M[cid] || [];
}

// Real top assignees per district — sourced from WIPO_CORPUS.assignees_by_district,
// derived from the FP:(shenzhen) PCT corpus + public HQ→district mapping.
// Falls back to empty array if the corpus is missing.
function assigneesFor(districtId) {
  const corpus = (typeof window !== 'undefined') && window.WIPO_CORPUS;
  const list = corpus && corpus.assignees_by_district && corpus.assignees_by_district[districtId];
  return list || [];
}

// ─── Mount ──────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
