/* eslint-disable */
// Build wipo-corpus.js from resultList.xls. Re-run after replacing the XLS.
// Requires xlsx — `npm install --no-save xlsx` first.
const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('resultList.xls');
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' }).slice(6);
console.log('Records:', rows.length);

// ── IPC → cluster (WIPO IPC Concordance class-prefixes) ──────────────────────
const IPC_RULES = [
  [/^H01M/, 'ev'], [/^H02J/, 'ev'], [/^H01G/, 'ev'], [/^B60L/, 'ev'], [/^B60K/, 'ev'], [/^B60W/, 'ev'],
  [/^H01L/, 'semi'], [/^H01S/, 'semi'], [/^G02F/, 'semi'], [/^G02B/, 'semi'],
  [/^H04W/, 'telecom'], [/^H04B/, 'telecom'], [/^H04J/, 'telecom'], [/^H04Q/, 'telecom'], [/^H04L/, 'telecom'],
  [/^H04N/, 'consumer'], [/^H04R/, 'consumer'], [/^H04M/, 'consumer'], [/^G09G/, 'consumer'],
  [/^G06N/, 'ai'], [/^G06K/, 'ai'], [/^G06V/, 'ai'], [/^G06T/, 'ai'], [/^G10L/, 'ai'], [/^G06F/, 'ai'],
  [/^G06Q/, 'fintech'],
  [/^A61B/, 'medtech'], [/^A61M/, 'medtech'], [/^A61N/, 'medtech'], [/^G01N/, 'medtech'], [/^A61F/, 'medtech'],
  [/^A61K/, 'biotech'], [/^A61P/, 'biotech'], [/^C12N/, 'biotech'], [/^C12Q/, 'biotech'], [/^C07/, 'biotech'],
  [/^B25J/, 'robotics'], [/^B64/, 'robotics'], [/^G05D/, 'robotics'], [/^B62D/, 'robotics'],
  [/^B23/, 'mfg'], [/^B22/, 'mfg'], [/^B26/, 'mfg'], [/^B29/, 'mfg'], [/^B25/, 'mfg'],
  [/^B65G/, 'logistics'], [/^B65D/, 'logistics'],
  [/^E04/, 'urban'], [/^F24/, 'urban'], [/^G08G/, 'urban'], [/^G01S/, 'urban'],
];
const ipcToCluster = (ipc) => { for (const [re, c] of IPC_RULES) if (re.test(ipc)) return c; return null; };

// ── Applicant → known HQ district (public corporate HQ locations) ───────────
const APPLICANT_RULES = [
  [/HUAWEI DEVICE/, 'longgang'], [/HISILICON/, 'longgang'], [/HUAWEI CLOUD/, 'longgang'], [/HUAWEI/, 'longgang'],
  [/SHENZHEN BYD AUTO|BYD AUTO/, 'pingshan'], [/BYD/, 'pingshan'],
  [/TENCENT/, 'nanshan'],
  [/ZTE MICROELECTRON/, 'nanshan'], [/ZTE\b/, 'nanshan'],
  [/SZ DJI|\bDJI\b/, 'nanshan'],
  [/CHINA STAR OPTOELECTRONICS|CSOT|SHENZHEN TCL/, 'baoan'], [/\bTCL\b/, 'baoan'],
  [/BGI\b|BGI SHENZHEN/, 'yantian'],
  [/GOODIX/, 'nanshan'],
  [/MINDRAY/, 'futian'],
  [/PING AN/, 'futian'], [/WEBANK|WE-BANK/, 'futian'], [/SF EXPRESS|SHUNFENG/, 'futian'],
  [/SKYWORTH/, 'baoan'], [/KONKA/, 'futian'], [/HISENSE/, 'nanshan'], [/COOLPAD/, 'nanshan'],
  [/HAN.?S LASER|HANS LASER/, 'baoan'], [/SUNWODA/, 'baoan'], [/O-FILM|OFILM/, 'baoan'],
  [/AAC ACOUSTIC|AAC TECHNOLOGIES/, 'baoan'],
  [/FOXCONN|HONGFUJIN|HON HAI/, 'longhua'], [/MOBI ANTENNA/, 'longhua'],
  [/CHINA RESOURCES MICROELECT|HUARUN/, 'longhua'],
  [/SHENZHEN UNIVERSITY/, 'nanshan'], [/PEKING UNIVERSITY SHENZHEN/, 'nanshan'],
  [/HARBIN INSTITUTE OF TECHNOLOGY SHENZHEN|HIT.?SHENZHEN/, 'nanshan'],
  [/TSINGHUA.{0,12}SHENZHEN/, 'nanshan'],
  [/SOUTHERN UNIVERSITY OF SCIENCE|SUSTECH/, 'nanshan'],
  [/CHINESE UNIVERSITY OF HONG KONG.?SHENZHEN|CUHK.?SHENZHEN/, 'longgang'],
  [/UBTECH/, 'nanshan'], [/EHANG/, 'nanshan'], [/INSTA360/, 'nanshan'],
  [/KUANG.?CHI|GUANGQI/, 'nanshan'], [/NATIONZ TECHNOLOG/, 'nanshan'], [/XPECTVISION/, 'nanshan'],
  [/OCEAN.?S KING/, 'baoan'], [/JRD COMMUNICATION/, 'nanshan'],
  [/COLAND/, 'luohu'],
  [/SHENZHEN COSCO|COSCO SHIPPING/, 'yantian'], [/YANTIAN INTERNATIONAL/, 'yantian'],
  [/INNOVENT|MABWORKS/, 'guangming'],
  [/MICROPORT/, 'nanshan'],
  [/SHENZHEN ROYOLE|ROYOLE/, 'longgang'],
  [/SHENZHEN QIANHAI|\bQIANHAI/, 'nanshan'],
];
const applicantToDistrict = (name) => { const u = name.toUpperCase(); for (const [re, d] of APPLICANT_RULES) if (re.test(u)) return d; return null; };

// ── Tally ────────────────────────────────────────────────────────────────────
const years = {}, clusters = {}, clusterByYear = {}, migration = {}, assigneeCount = {};
let mapped = 0, applicantUnmapped = 0;
for (const r of rows) {
  const mY = String(r[2]).match(/(\d{4})$/);
  const year = mY ? mY[1] : null;
  if (year) years[year] = (years[year] || 0) + 1;
  const ipcs = String(r[5]).split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const recordClusters = new Set();
  for (const ipc of ipcs) { const c = ipcToCluster(ipc); if (c) recordClusters.add(c); }
  const apps = String(r[6]).split(';').map(s => s.trim()).filter(Boolean);
  const firstApp = apps[0] || '';
  const district = applicantToDistrict(firstApp);
  if (recordClusters.size > 0) mapped++;
  if (!district) applicantUnmapped++;
  for (const c of recordClusters) {
    clusters[c] = (clusters[c] || 0) + 1;
    if (year) { clusterByYear[c] = clusterByYear[c] || {}; clusterByYear[c][year] = (clusterByYear[c][year] || 0) + 1; }
    if (year && district) {
      migration[c] = migration[c] || {};
      migration[c][year] = migration[c][year] || {};
      migration[c][year][district] = (migration[c][year][district] || 0) + 1;
    }
  }
  if (district && firstApp) {
    const key = firstApp.toUpperCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
    if (!assigneeCount[key]) assigneeCount[key] = { name: firstApp, district, _clusters: {}, n: 0 };
    assigneeCount[key].n++;
    // Track every cluster this assignee has filed in so we can pick the modal
    // one at the end (more honest than locking in the first record's IPC).
    for (const c of recordClusters) assigneeCount[key]._clusters[c] = (assigneeCount[key]._clusters[c] || 0) + 1;
  }
}
console.log('IPC mapped:', mapped, '/', rows.length);
console.log('Attributed to district:', rows.length - applicantUnmapped, '/', rows.length);

const win = ['2019', '2020', '2021', '2022', '2023', '2024'];
const winTotal = win.reduce((s, y) => s + (years[y] || 0), 0);
const yearFrac = {}; for (const y of win) yearFrac[y] = +((years[y] || 0) / winTotal).toFixed(4);

const cluTotal = Object.values(clusters).reduce((s, x) => s + x, 0);
const cluShare = {}; for (const [c, n] of Object.entries(clusters)) cluShare[c] = +(n / cluTotal).toFixed(4);

const migrationShare = {};
for (const [cl, byYear] of Object.entries(migration)) {
  migrationShare[cl] = {};
  for (const [yr, byDist] of Object.entries(byYear)) {
    const t = Object.values(byDist).reduce((s, n) => s + n, 0);
    if (!t) continue;
    migrationShare[cl][yr] = {};
    for (const [d, n] of Object.entries(byDist)) migrationShare[cl][yr][d] = +(n / t).toFixed(4);
  }
}

const assigneesByDistrict = {};
for (const a of Object.values(assigneeCount)) {
  // Modal cluster across this assignee's filings — null when no IPC mapped.
  const ent = Object.entries(a._clusters || {});
  ent.sort((x, y) => y[1] - x[1]);
  const cluster = ent[0] ? ent[0][0] : null;
  (assigneesByDistrict[a.district] = assigneesByDistrict[a.district] || []).push({ name: a.name, district: a.district, cluster, n: a.n });
}
for (const d in assigneesByDistrict) { assigneesByDistrict[d].sort((a, b) => b.n - a.n); assigneesByDistrict[d] = assigneesByDistrict[d].slice(0, 6); }

const out = {
  source: 'WIPO PatentScope FP:(shenzhen) result list, ' + rows.length + ' records',
  records: rows.length,
  attributed: rows.length - applicantUnmapped,
  year_fraction_window: yearFrac,
  cluster_counts: clusters,
  cluster_share: cluShare,
  cluster_by_year: clusterByYear,
  migration,
  migration_share: migrationShare,
  assignees_by_district: assigneesByDistrict,
};
fs.writeFileSync('wipo-corpus.js',
  '// Real per-year + per-cluster + per-district counts derived from WIPO PatentScope\n' +
  '// result list. Query: FP:(shenzhen), 10,000 PCT records.\n' +
  '// Applicant→district attribution uses public HQ-location mapping in _build_corpus.js.\n' +
  'window.WIPO_CORPUS = ' + JSON.stringify(out, null, 2) + ';\n');
console.log('Wrote wipo-corpus.js');
