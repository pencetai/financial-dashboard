const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("./server/config");

const PORT = config.port;
const ROOT = config.publicRoot;
const DATA_DIR = config.dataDir;
const STORE_FILE = config.storeFile;
const WATCH_NEWS_CACHE_KEY = config.watchNews.cacheKey;
const WATCH_NEWS_REFRESH_MS = config.watchNews.refreshMs;
const WATCH_NEWS_WINDOW_MS = config.watchNews.windowMs;
const WATCH_NEWS_RETENTION_MS = config.watchNews.retentionMs;
const WATCH_NEWS_MIN_ITEMS = config.watchNews.minItems;
const WATCH_NEWS_MAX_ITEMS = config.watchNews.maxItems;
const sessions = new Map();
let isRefreshingWatchNews = false;

const defaultWatchTargets = [
  {
    id: "zhongji",
    title: "中际旭创",
    meta: "300308 · A 股 · CPO/光模块",
    group: "cn",
    type: "stock",
    names: ["中际旭创", "300308"],
    query: "中际旭创 300308 财报 OR 业绩 OR 订单 OR 光模块 OR CPO OR 算力 OR 机构 OR 证券"
  },
  {
    id: "nvidia",
    title: "NVIDIA",
    meta: "NVDA · 美股 · AI 芯片",
    group: "us",
    type: "stock",
    names: ["NVIDIA", "Nvidia", "NVDA", "英伟达"],
    yahooSymbol: "NVDA",
    query: "NVIDIA OR NVDA OR 英伟达 earnings OR revenue OR guidance OR AI chip OR data center OR analyst OR Reuters OR CNBC"
  },
  {
    id: "tesla",
    title: "Tesla",
    meta: "TSLA · 美股 · 智能汽车",
    group: "us",
    type: "stock",
    names: ["Tesla", "TSLA", "特斯拉"],
    yahooSymbol: "TSLA",
    query: "Tesla OR TSLA OR 特斯拉 deliveries OR earnings OR margin OR robotaxi OR FSD OR analyst OR Reuters OR CNBC"
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const assets = [
  { symbol: "000001", name: "上证指数", market: "A 股", group: "cn", price: 3182.44, change: 0.46, alert: "政策预期升温", isTrading: false },
  { symbol: "399006", name: "创业板指", market: "A 股", group: "cn", price: 1848.16, change: -0.22, alert: "量能偏弱", isTrading: false },
  { symbol: "300308", name: "中际旭创", market: "A 股", group: "cn", price: 173.28, change: 2.34, alert: "CPO 主线活跃", isTrading: false },
  { symbol: "600519", name: "贵州茅台", market: "A 股", group: "cn", price: 1588.2, change: 0.81, alert: "北向净流入", isTrading: false },
  { symbol: "300750", name: "宁德时代", market: "A 股", group: "cn", price: 204.36, change: -1.12, alert: "板块分歧", isTrading: false },
  { symbol: "NDX", name: "纳斯达克 100", market: "美股", group: "us", price: 18712.08, change: -0.18, alert: "等待通胀数据", isTrading: true },
  { symbol: "AAPL", name: "Apple", market: "美股", group: "us", price: 196.52, change: 0.34, alert: "新品周期关注", isTrading: true },
  { symbol: "NVDA", name: "NVIDIA", market: "美股", group: "us", price: 124.91, change: 1.68, alert: "AI 需求强", isTrading: true },
  { symbol: "TSLA", name: "Tesla", market: "美股", group: "us", price: 181.64, change: -2.06, alert: "交付预期波动", isTrading: true },
  { symbol: "XAU", name: "现货黄金", market: "全球资产", group: "global", price: 2354.2, change: 0.31, alert: "央行购金预期", isTrading: true },
  { symbol: "DXY", name: "美元指数", market: "全球资产", group: "global", price: 104.28, change: -0.09, alert: "降息路径交易", isTrading: true }
];

const watchGroups = [
  stockGroup("zhongji", "中际旭创", "300308 · A 股 · CPO/光模块", "cn", "英伟达 光模块 CPO", [
    news("zj-1", "CPO 板块放量走强，中际旭创成交额进入市场前列", "5 分钟前", 0, 94, "资金继续围绕 AI 算力链交易，光模块龙头获得高弹性溢价。", "盘中光模块板块成交明显放大，中际旭创强于多数同类标的。模拟数据显示，短线资金更关注订单预期、海外云厂资本开支和英伟达产业链景气度。", "若放量上涨能维持，说明资金认可 AI 算力链的业绩兑现路径；若冲高回落，则可能是高位情绪交易，需观察成交额和板块联动。", "偏利多，注意高位波动"),
    news("zj-2", "海外 AI 资本开支预期上修，光模块订单能见度提升", "28 分钟前", 0, 87, "云厂商投入增加会强化上游光模块需求预期。", "多家云服务商继续强调 AI 基础设施投入，市场将其映射到高速光模块需求。中际旭创作为核心供应链标的，容易成为资金追踪对象。", "这类新闻通常先影响估值和情绪，再等待订单、毛利率和交付节奏验证。若后续业绩不及预期，估值回撤也会比较快。", "中期偏利多")
  ]),
  stockGroup("nvidia", "NVIDIA", "NVDA · 美股 · AI 芯片", "us", "英伟达 黄仁勋 AI芯片", [
    news("nvda-1", "AI 芯片订单预期上修，NVIDIA 盘前延续强势", "12 分钟前", 0, 96, "市场继续交易 AI 基础设施扩张，半导体链条风险偏好升温。", "模拟新闻显示，机构上调 AI 加速卡出货预期，带动 NVIDIA 与相关服务器、散热、光模块方向同步受关注。", "对 NVIDIA 本身偏利多，对 A 股 CPO、服务器和先进封装方向也有映射。需要关注估值已经反映多少增长，以及财报指引是否继续上修。", "偏利多 AI 产业链"),
    news("nvda-2", "美国科技股估值分化，资金更偏好盈利确定性资产", "41 分钟前", 0, 82, "高增长龙头继续吸引资金，但非核心科技股承压。", "在利率预期反复的背景下，资金倾向选择盈利可见度更高的 AI 龙头，而对估值高但业绩不稳定的公司更谨慎。", "这可能让 NVIDIA 相对强势，但也意味着财报和指引容错率下降。若出现供应、毛利率或监管扰动，波动会加大。", "结构性利多")
  ]),
  {
    id: "macro",
    title: "外围与宏观",
    meta: "美联储 · 美国政府 · 中国央行 · 黄金/宽基",
    group: "global",
    type: "macro",
    aliases: "美联储 央行 黄金 宽基",
    items: [
      news("macro-1", "美联储官员释放谨慎信号，市场下调短期降息概率", "3 分钟前", 0, 98, "利率预期重新定价，成长股估值和黄金价格都可能出现波动。", "官员讲话强调通胀仍需观察，市场对短期降息的押注下降。美元指数走强时，黄金和高估值成长股通常承压；若后续通胀数据回落，交易方向可能快速反转。", "对美股成长股偏压制，对美元偏利多；A 股可能受到外部风险偏好影响，但若国内流动性宽松，影响会被部分对冲。", "偏利空成长股，偏利多美元"),
      news("macro-2", "央行公开市场净投放扩大，宽基指数成交活跃", "16 分钟前", 0, 91, "流动性预期改善，宽基和低估值蓝筹关注度提升。", "模拟数据显示，公开市场净投放加大后，市场对国内流动性环境更乐观。宽基 ETF 成交增加，说明资金可能先通过指数产品表达风险偏好。", "对 A 股整体情绪偏利多，尤其是估值较低、流动性较好的方向。若政策连续性不足，市场可能重新回到结构性行情。", "偏利多 A 股风险偏好"),
      news("macro-3", "黄金 ETF 持仓回升，央行购金叙事重新升温", "37 分钟前", 0, 78, "避险需求与央行购金预期支撑贵金属关注度。", "黄金 ETF 持仓小幅回升，同时市场关注多国央行储备配置变化。若美元走弱或地缘风险升温，黄金可能继续获得配置需求。", "对黄金和贵金属板块偏利多；但若美债实际利率上行，黄金估值会受压。", "偏利多黄金")
    ]
  },
  stockGroup("kweichow", "贵州茅台", "600519 · A 股 · 白酒", "cn", "茅台 白酒 消费", [
    news("mt-1", "白酒板块估值修复，贵州茅台获北向资金净流入", "1 天前", 1, 84, "消费权重回暖，低估值修复逻辑增强。", "模拟新闻显示，北向资金对白酒龙头出现连续净流入，市场关注春节备货、渠道库存和批价稳定性。", "若批价稳定且成交放大，可能带动消费权重估值修复；若量能不足，行情可能偏防御。", "偏利多消费权重"),
    news("mt-2", "渠道反馈动销平稳，高端酒价格体系仍需观察", "3 天前", 3, 66, "基本面没有显著恶化，但缺少强催化。", "渠道调研显示动销保持平稳，库存压力可控，但价格弹性仍有限。", "对股价影响偏中性，更多取决于市场风格是否回到核心资产。", "中性偏稳")
  ]),
  stockGroup("catl", "宁德时代", "300750 · A 股 · 新能源", "cn", "宁王 电池 储能", [
    news("catl-1", "新能源车链分化，宁德时代大单资金出现回补", "2 天前", 2, 79, "资金尝试回流龙头，但板块一致性不足。", "模拟成交数据显示，宁德时代在回调后出现资金回补，市场关注海外储能订单和动力电池价格。", "若板块放量共振，龙头可能先修复；若行业价格战升温，估值仍受压。", "短线观察"),
    news("catl-2", "储能订单预期改善，电池龙头盈利弹性受关注", "5 天前", 5, 73, "储能可能成为新能源链条的新催化。", "海外储能需求预期改善，市场重新评估电池龙头的订单结构。", "对中期预期偏正面，但需要看到毛利率和出货数据验证。", "中期偏利多")
  ]),
  stockGroup("tesla", "Tesla", "TSLA · 美股 · 智能汽车", "us", "特斯拉 马斯克 智能汽车", [
    news("tsla-1", "Tesla 交付预期波动，市场关注价格策略", "6 小时前", 0, 82, "交付与毛利率仍是股价核心矛盾。", "模拟新闻显示，市场对 Tesla 季度交付预期分歧加大，价格调整和库存变化成为关注点。", "若交付改善但毛利承压，股价可能震荡；若自动驾驶催化增强，估值弹性会提升。", "波动加大"),
    news("tsla-2", "自动驾驶版本更新带动软件收入想象空间", "4 天前", 4, 69, "软件叙事回暖，但仍需商业化数据验证。", "新版自动驾驶能力升级后，市场重新讨论软件订阅和长期利润率。", "对估值偏利多，但短期仍受交付和价格战影响。", "结构性利多")
  ]),
  stockGroup("apple", "Apple", "AAPL · 美股 · 消费电子", "us", "苹果 iPhone", [
    news("aapl-1", "Apple 新品周期临近，供应链订单预期小幅上修", "2 天前", 2, 72, "新品周期带动供应链情绪修复。", "模拟供应链消息显示，新品备货预期略有改善，市场关注 AI 功能落地节奏。", "对 Apple 和部分消费电子链偏利多，但需要销量验证。", "温和利多"),
    news("aapl-2", "服务收入保持韧性，硬件增长仍待新品催化", "6 天前", 6, 63, "利润结构稳定，但硬件端缺少强增长。", "服务收入继续提供利润支撑，硬件业务等待新品周期和 AI 功能刺激。", "偏防御属性，短期弹性不如 AI 芯片链。", "偏中性")
  ])
];

const hotMoneyCandidates = [
  { rank: 1, name: "中际旭创", symbol: "300308", theme: "CPO/算力", funds: "章盟主、作手新一、机构席位", score: 96, signal: "多席位反复参与，板块辨识度高", risk: "高位波动" },
  { rank: 2, name: "剑桥科技", symbol: "603083", theme: "光模块", funds: "炒股养家、方新侠", score: 92, signal: "题材延续性强，短线承接活跃", risk: "追高风险" },
  { rank: 3, name: "万丰奥威", symbol: "002085", theme: "低空经济", funds: "小鳄鱼、上塘路", score: 89, signal: "资金围绕低空经济反复切换", risk: "情绪退潮" },
  { rank: 4, name: "工业富联", symbol: "601138", theme: "AI 服务器", funds: "机构席位、量化席位", score: 87, signal: "大成交容量，适合趋势资金参与", risk: "弹性偏低" },
  { rank: 5, name: "赛力斯", symbol: "601127", theme: "智能汽车", funds: "方新侠、葛老大", score: 84, signal: "人气股属性强，消息刺激敏感", risk: "兑现压力" },
  { rank: 6, name: "北方铜业", symbol: "000737", theme: "有色金属", funds: "湖里大道、量化席位", score: 81, signal: "资源品涨价线有资金回流", risk: "商品价格扰动" },
  { rank: 7, name: "宗申动力", symbol: "001696", theme: "低空经济", funds: "上塘路、首板挖掘席位", score: 78, signal: "主题扩散时容易被短线资金攻击", risk: "持续性待验证" },
  { rank: 8, name: "高新发展", symbol: "000628", theme: "算力/重组", funds: "作手新一、机构席位", score: 76, signal: "趋势与题材复合，资金关注度仍在", risk: "重组预期波动" },
  { rank: 9, name: "中信海直", symbol: "000099", theme: "低空经济", funds: "章盟主、游资联动席位", score: 73, signal: "板块情绪修复时常被优先选择", risk: "板块分化" },
  { rank: 10, name: "沃尔核材", symbol: "002130", theme: "高速铜缆", funds: "量化席位、短线接力资金", score: 71, signal: "AI 硬件分支轮动标的", risk: "资金轮动快" }
];

ensureStore();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: "server_error", message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Financial dashboard server running on http://127.0.0.1:${PORT}`);
  startWatchNewsScheduler();
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/auth/me") return sendJson(res, 200, { user: getUser(req) });
  if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
  if (req.method === "POST" && url.pathname === "/api/auth/logout") return logout(req, res);
  if (req.method === "GET" && url.pathname === "/api/market/overview") return marketOverview(res);
  if (req.method === "GET" && url.pathname === "/api/watchlist") return sendJson(res, 200, { watchlist: readStore().watchlist });
  if (req.method === "GET" && url.pathname === "/api/watch/news") return watchNewsOverview(res);
  if (req.method === "POST" && url.pathname === "/api/watchlist") return updateWatchlist(req, res);
  if (req.method === "POST" && url.pathname === "/api/news/search") return searchNews(req, res);
  if (req.method === "POST" && url.pathname === "/api/strategy/hot-money") return hotMoneyStrategy(res);
  sendJson(res, 404, { error: "not_found" });
}

function marketOverview(res) {
  const now = new Date().toISOString();
  sendJson(res, 200, {
    updatedAt: now,
    source: "mock-cache",
    refreshPolicy: "交易中标的低频刷新，休市标的使用上一交易日数据",
    assets: assets.map((asset) => ({ ...asset, updatedAt: now, dataDate: asset.isTrading ? "current-session" : "previous-session" }))
  });
}

async function searchNews(req, res) {
  const user = getUser(req);
  const body = await readBody(req);
  const keyword = String(body.keyword || "").trim();
  if (!keyword) return sendJson(res, 400, { error: "missing_keyword" });

  const store = readStore();
  const today = new Date().toISOString().slice(0, 10);
  store.usage[today] = store.usage[today] || {};
  const userKey = user?.name || "anonymous";
  store.usage[today][userKey] = store.usage[today][userKey] || { newsSearches: 0 };
  const limit = user ? 50 : 10;
  if (store.usage[today][userKey].newsSearches >= limit) {
    writeStore(store);
    return sendJson(res, 429, { error: "rate_limited", message: "今日新闻搜索次数已用完。" });
  }

  const cacheKey = keyword.toLowerCase();
  const cached = store.newsCache[cacheKey];
  const ttlMs = 30 * 60 * 1000;
  if (cached && Date.now() - cached.savedAt < ttlMs) {
    return sendJson(res, 200, { ...cached.payload, cache: "hit", remaining: limit - store.usage[today][userKey].newsSearches });
  }

  store.usage[today][userKey].newsSearches += 1;
  const remoteGroups = await fetchGoogleNewsGroups(keyword).catch(() => []);
  const groups = remoteGroups.length ? remoteGroups : localNewsSearch(keyword);
  const payload = {
    keyword,
    generatedAt: new Date().toISOString(),
    source: remoteGroups.length ? "google-news-rss" : "mock-codex-search",
    rule: "近 7 日、两星及以上、按重要性排序，最多 20 条",
    groups
  };
  store.newsCache[cacheKey] = { savedAt: Date.now(), payload };
  writeStore(store);
  sendJson(res, 200, { ...payload, cache: "miss", remaining: limit - store.usage[today][userKey].newsSearches });
}

async function watchNewsOverview(res) {
  const store = readStore();
  const cached = store.newsCache?.[WATCH_NEWS_CACHE_KEY];
  const isFresh = cached && Date.now() - cached.savedAt < WATCH_NEWS_REFRESH_MS;
  if (!isFresh) refreshWatchedNewsCache("api-stale").catch((error) => console.error("watch news refresh failed", error.message));

  const payload = cached?.payload || buildWatchNewsPayload([], "fallback");
  sendJson(res, 200, {
    ...payload,
    cache: cached ? (isFresh ? "hit" : "stale") : "fallback",
    nextRefreshAt: new Date((cached?.savedAt || Date.now()) + WATCH_NEWS_REFRESH_MS).toISOString(),
    refreshIntervalMs: WATCH_NEWS_REFRESH_MS
  });
}

async function hotMoneyStrategy(res) {
  const candidates = await fetchEastmoneyHotMoneyCandidates().catch(() => []);
  sendJson(res, 200, {
    generatedAt: new Date().toISOString(),
    source: candidates.length ? "eastmoney-lhb" : "mock-hot-money",
    candidates: candidates.length ? candidates : hotMoneyCandidates
  });
}

function startWatchNewsScheduler() {
  refreshWatchedNewsCache("startup").catch((error) => console.error("watch news startup refresh failed", error.message));
  setInterval(() => {
    refreshWatchedNewsCache("schedule").catch((error) => console.error("watch news scheduled refresh failed", error.message));
  }, WATCH_NEWS_REFRESH_MS);
}

async function refreshWatchedNewsCache(reason) {
  if (isRefreshingWatchNews) return;
  isRefreshingWatchNews = true;
  try {
    const store = readStore();
    const previousPayload = store.newsCache?.[WATCH_NEWS_CACHE_KEY]?.payload;
    const remoteGroups = await fetchWatchedNewsGroups().catch(() => []);
    const payload = buildWatchNewsPayload(remoteGroups, reason, previousPayload);
    store.newsCache = store.newsCache || {};
    pruneExpiredWatchNewsCaches(store);
    store.newsCache[WATCH_NEWS_CACHE_KEY] = { savedAt: Date.now(), payload };
    writeStore(store);
    console.log(`watch news refreshed: ${payload.source}, ${payload.groups.length} groups`);
  } finally {
    isRefreshingWatchNews = false;
  }
}

function buildWatchNewsPayload(remoteGroups, reason, previousPayload = null) {
  const remoteById = new Map(remoteGroups.map((group) => [group.id, group]));
  const fallbackIds = new Set(defaultWatchTargets.map((target) => target.id));
  const fallbackById = new Map(
    watchGroups
      .filter((group) => fallbackIds.has(group.id))
      .map((group) => [group.id, { ...group, source: "fallback-watch-data" }])
  );
  const previousById = new Map((previousPayload?.groups || []).map((group) => [group.id, group]));
  const groups = defaultWatchTargets
    .map((target) => mergeWatchGroupNews(target, remoteById.get(target.id), previousById.get(target.id), fallbackById.get(target.id)))
    .filter(Boolean)
    .map((group) => normalizeNewsGroupForCache(group));
  return {
    generatedAt: new Date().toISOString(),
    source: remoteGroups.length === defaultWatchTargets.length ? "scheduled-watch-feeds" : remoteGroups.length ? "mixed-scheduled-watch-feeds" : "mock-watch-news",
    refreshReason: reason,
    rule: "已关注股票自动热榜：服务端每 30 分钟定向刷新，搜寻 24 小时内新闻，7 天内缓存补足，去重后每只 10-20 条",
    groups
  };
}

function mergeWatchGroupNews(target, remoteGroup, previousGroup, fallbackGroup) {
  const sourceGroup = remoteGroup || fallbackGroup;
  if (!sourceGroup) return null;
  const now = Date.now();
  const freshItems = (remoteGroup?.items || []).filter((item) => isWithinWindow(item.publishedAt, WATCH_NEWS_WINDOW_MS));
  const retainedItems = (previousGroup?.items || []).filter((item) => isWithinWindow(item.publishedAt || item.analyzedAt, WATCH_NEWS_RETENTION_MS));
  const fallbackItems = (fallbackGroup?.items || []).map((item) => ({ ...item, sourceType: "fallback" }));
  const items = dedupeSimilarNews([...freshItems, ...retainedItems, ...fallbackItems])
    .sort(compareWatchNews)
    .slice(0, WATCH_NEWS_MAX_ITEMS);

  return {
    ...sourceGroup,
    meta: remoteGroup ? sourceGroup.meta : `${target.meta} · 缓存/备用`,
    source: remoteGroup ? sourceGroup.source : "fallback-watch-data",
    items: items.length >= WATCH_NEWS_MIN_ITEMS ? items : items.slice(0, WATCH_NEWS_MAX_ITEMS)
  };
}

async function fetchWatchedNewsGroups() {
  const groups = await Promise.all(defaultWatchTargets.map((target) => fetchPreciseStockNewsGroup(target).catch(() => null)));
  return groups.filter((group) => group && group.items.length);
}

async function fetchPreciseStockNewsGroup(target) {
  const feeds = [];
  if (target.yahooSymbol) {
    feeds.push(
      fetchText(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(target.yahooSymbol)}&region=US&lang=en-US`, 9000, {
        "User-Agent": "Mozilla/5.0"
      })
        .then((xml) => parseRssItems(xml, "Yahoo Finance"))
        .catch(() => [])
    );
  }
  if (Array.isArray(target.rssFeeds)) {
    for (const feed of target.rssFeeds) {
      feeds.push(fetchText(feed.url, 9000, { "User-Agent": "Mozilla/5.0" }).then((xml) => parseRssItems(xml, feed.source)).catch(() => []));
    }
  }
  if (!feeds.length) return { ...target, source: "no-direct-feed", items: [] };

  const feedItems = (await Promise.all(feeds)).flat();
  const strictItems = uniqueRawNews(feedItems).filter((item) => isUsefulTargetNews(item, target));
  const relaxedItems = uniqueRawNews(feedItems)
    .filter((item) => !strictItems.some((strict) => normalizeText(strict.title).toLowerCase() === normalizeText(item.title).toLowerCase()))
    .filter((item) => isSupplementalTargetNews(item, target));
  const initialItems = [...strictItems, ...relaxedItems];
  const retainedItems = initialItems.length >= WATCH_NEWS_MIN_ITEMS
    ? []
    : uniqueRawNews(feedItems)
        .filter((item) => !initialItems.some((existing) => normalizeText(existing.title).toLowerCase() === normalizeText(item.title).toLowerCase()))
        .filter((item) => isRetainedTargetNews(item, target));
  const rawItems = [...initialItems, ...retainedItems].slice(0, WATCH_NEWS_MAX_ITEMS);
  const items = rawItems
    .map((item, index) => buildRemoteNewsItem(item, target.title, index))
    .filter((item) => isWithinWindow(item.publishedAt, WATCH_NEWS_RETENTION_MS) && importanceStars(item.importance) >= 2)
    .sort(compareWatchNews)
    .slice(0, WATCH_NEWS_MAX_ITEMS);

  return {
    id: target.id,
    title: target.title,
    meta: `${target.meta} · 24 小时收集 / 7 天保留`,
    group: target.group,
    type: target.type,
    aliases: target.names.join(" "),
    source: target.yahooSymbol ? "yahoo-finance-rss" : "direct-feed",
    items
  };
}

async function fetchGoogleNewsGroups(keyword) {
  const query = `${keyword} 股票 财报 OR 业绩 OR 订单 OR 监管 OR 政策 OR 股东大会 OR 产业链 when:7d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
  const xml = await fetchText(url, 8000);
  const items = parseRssItems(xml)
    .filter((item) => isUsefulNews(item, keyword))
    .slice(0, 40)
    .map((item, index) => {
      return buildRemoteNewsItem(item, keyword, index);
    })
    .filter((item) => item.daysAgo <= 7 && importanceStars(item.importance) >= 2)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 20);

  if (!items.length) return [];
  return [
    {
      id: `remote-${crypto.createHash("md5").update(keyword).digest("hex").slice(0, 8)}`,
      title: keyword,
      meta: "近 7 日联网新闻",
      group: "remote",
      type: "stock",
      aliases: keyword,
      items
    }
  ];
}

async function fetchEastmoneyHotMoneyCandidates() {
  const end = new Date();
  const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
  const filter = `(TRADE_DATE>='${formatDate(start)}')(TRADE_DATE<='${formatDate(end)}')`;
  const url = new URL("https://datacenter-web.eastmoney.com/api/data/v1/get");
  url.searchParams.set("reportName", "RPT_DAILYBILLBOARD_DETAILS");
  url.searchParams.set("columns", "SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,TRADE_DATE,EXPLAIN,BILLBOARD_NET_AMT,BILLBOARD_BUY_AMT,BILLBOARD_SELL_AMT,CHANGE_RATE,TURNOVERRATE");
  url.searchParams.set("sortColumns", "TRADE_DATE,BILLBOARD_NET_AMT");
  url.searchParams.set("sortTypes", "-1,-1");
  url.searchParams.set("pageSize", "80");
  url.searchParams.set("pageNumber", "1");
  url.searchParams.set("filter", filter);
  const payload = await fetchJson(url.toString(), 9000, {
    Referer: "https://data.eastmoney.com/",
    "User-Agent": "Mozilla/5.0"
  });
  const rows = payload?.result?.data || [];
  const merged = new Map();
  for (const row of rows) {
    const code = row.SECURITY_CODE || row.SECUCODE || "";
    if (!code) continue;
    const current = merged.get(code) || {
      name: row.SECURITY_NAME_ABBR || code,
      symbol: code,
      theme: row.EXPLAIN || "龙虎榜",
      net: 0,
      count: 0,
      change: Number(row.CHANGE_RATE || 0),
      turnover: Number(row.TURNOVERRATE || 0)
    };
    current.net += Number(row.BILLBOARD_NET_AMT || 0);
    current.count += 1;
    current.change = Math.max(current.change, Number(row.CHANGE_RATE || 0));
    current.turnover = Math.max(current.turnover, Number(row.TURNOVERRATE || 0));
    merged.set(code, current);
  }
  return [...merged.values()]
    .sort((a, b) => b.net - a.net || b.count - a.count)
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      name: item.name,
      symbol: item.symbol,
      theme: item.theme,
      funds: "龙虎榜活跃资金",
      score: Math.max(60, Math.min(99, Math.round(70 + item.count * 4 + Math.min(item.turnover, 20) / 2))),
      signal: `近两周上榜 ${item.count} 次，榜单净额约 ${formatMoney(item.net)}`,
      risk: item.change > 8 ? "高位波动" : "持续性待验证"
    }));
}

function localNewsSearch(keyword) {
  const normalized = keyword.trim().toLowerCase();
  return watchGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const haystack = `${group.title} ${group.aliases || ""} ${group.meta} ${item.title} ${item.summary} ${item.detail}`.toLowerCase();
        return (item.daysAgo ?? 0) <= 7 && importanceStars(item.importance) >= 2 && fuzzyMatch(haystack, normalized);
      })
    }))
    .filter((group) => group.items.length > 0);
}

async function login(req, res) {
  const body = await readBody(req);
  const username = String(body.username || "");
  const password = String(body.password || "");
  if (username !== "demo" || password !== "demo123") {
    return sendJson(res, 401, { error: "invalid_credentials", message: "测试账号是 demo / demo123" });
  }
  const sid = crypto.randomBytes(24).toString("hex");
  const user = { name: "demo", role: "tester" };
  sessions.set(sid, user);
  res.setHeader("Set-Cookie", `sid=${sid}; HttpOnly; Path=/; SameSite=Lax`);
  sendJson(res, 200, { user });
}

function logout(req, res) {
  const sid = getCookie(req, "sid");
  if (sid) sessions.delete(sid);
  res.setHeader("Set-Cookie", "sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  sendJson(res, 200, { ok: true });
}

async function updateWatchlist(req, res) {
  const body = await readBody(req);
  const next = Array.isArray(body.watchlist) ? body.watchlist.map(String).slice(0, 100) : [];
  const store = readStore();
  store.watchlist = next;
  writeStore(store);
  sendJson(res, 200, { watchlist: store.watchlist });
}

function serveStatic(res, pathname) {
  const clean = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const filePath = path.resolve(ROOT, clean.replace(/^\/+/, ""));
  if (!filePath.startsWith(ROOT)) return sendText(res, 403, "Forbidden");
  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(ROOT, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) return sendText(res, 404, "Not found");
        res.writeHead(200, { "Content-Type": mimeTypes[".html"], "Cache-Control": "no-cache" });
        res.end(fallback);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  });
}

function getUser(req) {
  const sid = getCookie(req, "sid");
  return sid ? sessions.get(sid) || null : null;
}

function getCookie(req, name) {
  const cookie = req.headers.cookie || "";
  const parts = cookie.split(";").map((item) => item.trim());
  const target = parts.find((item) => item.startsWith(`${name}=`));
  return target ? decodeURIComponent(target.slice(name.length + 1)) : "";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("request_too_large"));
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(STORE_FILE)) {
    writeStore({ watchlist: ["中际旭创", "NVIDIA", "Tesla"], newsCache: {}, usage: {} });
  }
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch {
    return { watchlist: [], newsCache: {}, usage: {} };
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

async function fetchText(url, timeoutMs, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, timeoutMs, headers = {}) {
  const text = await fetchText(url, timeoutMs, headers);
  return JSON.parse(text);
}

function parseRssItems(xml, defaultSource = "") {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return itemMatches.map((raw) => ({
    title: decodeXml(readXml(raw, "title")),
    link: decodeXml(readXml(raw, "link")),
    pubDate: decodeXml(readXml(raw, "pubDate")),
    source: decodeXml(readXml(raw, "source")) || defaultSource,
    description: stripHtml(decodeXml(readXml(raw, "description")))
  }));
}

function readXml(raw, tag) {
  const match = raw.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "") : "";
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isUsefulNews(item, keyword) {
  const text = normalizeText(`${item.title} ${item.description} ${item.source}`);
  if (!text) return false;
  if (daysAgo(item.pubDate) > 7) return false;
  if (!keywordMatchesNews(text, keyword)) return false;

  return passesNewsQualityGate(text);
}

function passesNewsQualityGate(text) {
  const noisyPatterns = [
    /股价预测|价格预测|股票价格预测|走势预测|目标价预测|未来[0-9]{4}.*预测|[0-9]{4}.*[0-9]{4}.*预测/,
    /price forecast|stock forecast|price prediction|stock prediction|target price prediction|screaming buy|massive gains|best .*stocks? to invest|bull and bear|prediction markets|预测.*2030/i,
    /如何购买|怎么买|值得买吗|能买吗|投资指南|新手指南|开户|交易教程/,
    /加密货币|彩票|博彩|返利|优惠券|下载/
  ];
  if (noisyPatterns.some((pattern) => pattern.test(text))) return false;

  const weakPatterns = [/观点|评论|专栏|盘前异动|盘中异动|短讯|快讯/];
  const hasHardSignal = /财报|业绩|营收|净利|利润|指引|订单|合同|产能|交付|监管|调查|制裁|出口|禁令|并购|回购|分红|减持|增持|股东大会|发布会|新品|降息|加息|通胀|非农|CPI|PCE|关税|产业链|供应链|机构评级|上调|下调|龙虎榜|北向|资金流/.test(text);
  if (weakPatterns.some((pattern) => pattern.test(text)) && !hasHardSignal) return false;

  return true;
}

function isUsefulTargetNews(item, target) {
  const title = normalizeText(item.title);
  const text = normalizeText(`${item.title} ${item.description} ${item.source}`);
  if (!text) return false;
  if (daysAgo(item.pubDate) > 7) return false;
  if (!target.names.some((name) => title.toLowerCase().includes(name.toLowerCase()))) return false;

  const unrelatedCompanyPatterns = target.id === "nvidia"
    ? [/NVIDIA Shield/i, /GeForce Now/i]
    : target.id === "tesla"
    ? [/Tesla Model.*二手|特斯拉二手|车主投诉|充电桩故障/]
    : [];
  if (unrelatedCompanyPatterns.some((pattern) => pattern.test(text))) return false;

  return passesNewsQualityGate(text);
}

function isSupplementalTargetNews(item, target) {
  const title = normalizeText(item.title);
  const text = normalizeText(`${item.title} ${item.description} ${item.source}`);
  if (!target.names.some((name) => title.toLowerCase().includes(name.toLowerCase()))) return false;
  if (!isWithinWindow(item.pubDate, WATCH_NEWS_WINDOW_MS)) return false;
  if (/彩票|博彩|开户|交易教程|如何购买|怎么买|下载|优惠券/i.test(text)) return false;
  if (/price forecast|stock forecast|price prediction|target price prediction|预测.*2030|未来[0-9]{4}.*预测/i.test(text)) return false;
  return true;
}

function isRetainedTargetNews(item, target) {
  const title = normalizeText(item.title);
  const text = normalizeText(`${item.title} ${item.description} ${item.source}`);
  if (!target.names.some((name) => title.toLowerCase().includes(name.toLowerCase()))) return false;
  if (!isWithinWindow(item.pubDate, WATCH_NEWS_RETENTION_MS)) return false;
  if (/彩票|博彩|开户|交易教程|如何购买|怎么买|下载|优惠券/i.test(text)) return false;
  if (/price forecast|stock forecast|price prediction|target price prediction|预测.*2030|未来[0-9]{4}.*预测/i.test(text)) return false;
  return true;
}

function scoreNewsImportance(item, index) {
  const text = normalizeText(`${item.title} ${item.description} ${item.source}`);
  let score = Math.max(45, 95 - index * 4);
  if (/财报|业绩|营收|净利|利润|指引|订单|合同|产能|交付/.test(text)) score += 14;
  if (/监管|调查|制裁|出口|禁令|关税|反垄断|安全审查/.test(text)) score += 14;
  if (/降息|加息|央行|美联储|通胀|CPI|PCE|非农|美元|国债/.test(text)) score += 12;
  if (/并购|重组|回购|分红|减持|增持|停牌|复牌|股东大会/.test(text)) score += 10;
  if (/机构评级|上调|下调|目标价|龙虎榜|北向|资金流|成交额/.test(text)) score += 8;
  if (/产业链|供应链|新品|发布会|AI|算力|芯片|光模块|CPO|数据中心/.test(text)) score += 6;
  if (/华尔街见闻|财联社|证券时报|中国证券报|上海证券报|路透|彭博|Reuters|Bloomberg|CNBC|MarketWatch|Barron/.test(text)) score += 6;
  if (/证券时报|中国证券报|上海证券报|证券日报|经济参考报|财联社|华尔街见闻|Reuters|Bloomberg|CNBC|MarketWatch|Barron|Yahoo Finance|SEC|NASDAQ|NYSE/.test(text)) score += 8;
  if (/Motley Fool|Stocktwits|247wallst|Benzinga/i.test(text) || /fool\.com|stocktwits\.com|247wallst\.com|benzinga\.com/i.test(item.link || "")) score -= 12;
  if (/传闻|小幅|观点|评论|专栏|值得买吗|预测|forecast|prediction/i.test(text)) score -= 18;
  score -= newsFreshnessDecay(item);
  return Math.max(20, Math.min(98, score));
}

function buildRemoteNewsItem(item, keyword, index) {
  const analyzedAt = new Date().toISOString();
  const importance = scoreNewsImportance(item, index);
  const brief = buildNewsBrief(item, keyword, importance);
  return {
    id: `remote-${crypto.createHash("md5").update(item.link || item.title).digest("hex").slice(0, 10)}`,
    title: item.title,
    time: formatRelativeTime(item.pubDate),
    publishedAt: parseDateIso(item.pubDate),
    collectedAt: analyzedAt,
    analyzedAt,
    daysAgo: daysAgo(item.pubDate),
    importance,
    summary: brief.summary,
    detail: brief.detail,
    analysis: brief.analysis,
    impact: brief.impact,
    url: item.link
  };
}

function applyFreshnessToNewsItem(item, index = 0) {
  const analyzedAt = new Date().toISOString();
  const ageDays = Number.isFinite(Number(item.daysAgo)) ? Number(item.daysAgo) : 0;
  const decay = Math.min(42, ageDays * 8 + Math.floor(index / 4) * 2);
  const next = {
    ...item,
    collectedAt: item.collectedAt || item.analyzedAt || analyzedAt,
    analyzedAt: item.analyzedAt || analyzedAt,
    importance: Math.max(20, Math.min(98, Number(item.importance || 50) - decay))
  };
  return { ...next, rankScore: newsRankScore(next) };
}

function normalizeNewsGroupForCache(group) {
  return {
    ...group,
    items: (group.items || [])
      .map((item, index) => applyFreshnessToNewsItem(item, index))
      .filter((item) => isWithinWindow(item.publishedAt || item.analyzedAt, WATCH_NEWS_RETENTION_MS))
      .sort(compareWatchNews)
      .slice(0, WATCH_NEWS_MAX_ITEMS)
  };
}

function buildNewsBrief(item, keyword, importance) {
  const source = item.source || "联网新闻";
  const title = normalizeText(item.title);
  const description = normalizeText(item.description || title);
  const trigger = detectNewsTrigger(`${title} ${description}`);
  const attention = importance >= 90 ? "高" : importance >= 70 ? "中高" : "中";

  return {
    summary: `${source}｜${trigger.label}`,
    detail: description && description !== title ? description : title,
    analysis: `${keyword} 这条消息的核心触发点是“${trigger.label}”。当前测试版依据新闻来源、发布时间、事件类型和关键词强度排序，后续接入 Codex 后会继续补全更细的因果链和交叉验证。`,
    impact: `${attention}关注。${trigger.impact}`
  };
}

function detectNewsTrigger(text) {
  const rules = [
    { pattern: /财报|业绩|营收|净利|利润|指引/, label: "业绩与指引", impact: "优先观察收入增速、利润率和管理层展望是否改变市场预期。" },
    { pattern: /订单|合同|产能|交付|供应链|产业链/, label: "订单与产业链", impact: "可能影响短中期景气度判断，重点看是否能转化为收入和利润。" },
    { pattern: /监管|调查|制裁|出口|禁令|关税|反垄断/, label: "监管与政策风险", impact: "可能改变估值容忍度和资金风险偏好，需要关注后续政策细则。" },
    { pattern: /降息|加息|央行|美联储|通胀|CPI|PCE|非农|美元|国债/, label: "宏观流动性", impact: "会影响成长股估值、汇率和跨市场风险偏好。" },
    { pattern: /并购|重组|回购|分红|减持|增持|停牌|复牌|股东大会/, label: "资本动作", impact: "容易带来短期重估或波动，需区分一次性事件和基本面改善。" },
    { pattern: /机构评级|上调|下调|目标价|龙虎榜|北向|资金流|成交额/, label: "资金与机构观点", impact: "对短线情绪有直接影响，但持续性需要成交量和后续消息验证。" },
    { pattern: /AI|算力|芯片|光模块|CPO|数据中心|新品|发布会/, label: "产业催化", impact: "偏利于主题热度和估值弹性，但要防止预期已经提前交易。" }
  ];
  return rules.find((rule) => rule.pattern.test(text)) || { label: "市场关注事件", impact: "先作为观察项处理，等待更多来源确认影响方向。" };
}

function newsFreshnessDecay(item) {
  const hours = newsAgeHours(item.pubDate);
  if (!Number.isFinite(hours)) return 8;
  if (hours <= 1) return 0;
  if (hours <= 3) return 2;
  if (hours <= 6) return 4;
  if (hours <= 12) return 7;
  if (hours <= 24) return 10;
  return Math.min(42, 10 + Math.floor((hours - 24) / 24) * 8);
}

function newsAgeHours(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return NaN;
  return Math.max(0, (Date.now() - date.getTime()) / 3_600_000);
}

function parseDateIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function isWithinWindow(value, windowMs) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const age = Date.now() - date.getTime();
  return age >= 0 && age <= windowMs;
}

function compareWatchNews(a, b) {
  const scoreDiff = newsRankScore(b) - newsRankScore(a);
  if (scoreDiff) return scoreDiff;
  return new Date(b.publishedAt || b.analyzedAt || 0) - new Date(a.publishedAt || a.analyzedAt || 0);
}

function newsRankScore(item) {
  const published = new Date(item.publishedAt || item.analyzedAt || 0).getTime();
  const ageHours = Number.isFinite(published) && published > 0 ? Math.max(0, (Date.now() - published) / 3_600_000) : 168;
  const freshness = Math.max(0, 48 - ageHours * 2);
  const fallbackPenalty = item.sourceType === "fallback" ? 35 : 0;
  return Number(item.importance || 0) + freshness - fallbackPenalty;
}

function dedupeSimilarNews(items) {
  const kept = [];
  const signatures = [];
  for (const item of items) {
    const signature = newsSignature(item.title || item.detail || "");
    if (!signature) continue;
    if (signatures.some((existing) => similarityScore(existing, signature) >= 0.72 || existing.includes(signature) || signature.includes(existing))) continue;
    signatures.push(signature);
    kept.push(item);
  }
  return kept;
}

function uniqueRawNews(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText(item.title).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function newsSignature(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{Script=Han}a-z0-9]+/gu, "")
    .replace(/inc|corp|ltd|股份有限公司|有限公司|股票|新闻|快讯/g, "")
    .slice(0, 80);
}

function similarityScore(a, b) {
  if (!a || !b) return 0;
  const aParts = tokenSet(a);
  const bParts = tokenSet(b);
  if (!aParts.size || !bParts.size) return 0;
  let overlap = 0;
  for (const token of aParts) {
    if (bParts.has(token)) overlap += 1;
  }
  return overlap / Math.min(aParts.size, bParts.size);
}

function tokenSet(value) {
  const tokens = value.match(/[\p{Script=Han}]{2}|[a-z0-9]{3,}/gu) || [];
  return new Set(tokens);
}

function pruneExpiredWatchNewsCaches(store) {
  const cache = store.newsCache || {};
  const cutoff = Date.now() - WATCH_NEWS_RETENTION_MS;
  for (const [key, value] of Object.entries(cache)) {
    if (key.startsWith("watch:auto:") && value?.savedAt && value.savedAt < cutoff) delete cache[key];
  }
}

function keywordMatchesNews(text, keyword) {
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = normalizeText(keyword).toLowerCase();
  if (!normalizedKeyword) return false;
  if (normalizedText.includes(normalizedKeyword)) return true;

  const tokens = normalizedKeyword
    .split(/[\s,，/|+、·.-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !/^(股票|新闻|stock|news|inc|corp|ltd|公司)$/.test(token));

  if (tokens.length) return tokens.some((token) => normalizedText.includes(token));
  return fuzzyMatch(normalizedText, normalizedKeyword);
}

function normalizeText(value) {
  return stripHtml(decodeXml(String(value || ""))).replace(/\s+/g, " ").trim();
}

function daysAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatMoney(value) {
  const abs = Math.abs(value);
  if (abs >= 100_000_000) return `${(value / 100_000_000).toFixed(2)} 亿`;
  if (abs >= 10_000) return `${(value / 10_000).toFixed(0)} 万`;
  return `${value.toFixed(0)}`;
}

function importanceStars(importance) {
  return Math.max(1, Math.min(5, Math.ceil(importance / 20)));
}

function fuzzyMatch(text, keyword) {
  if (text.includes(keyword)) return true;
  let index = 0;
  for (const char of keyword) {
    index = text.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}

function stockGroup(id, title, meta, group, aliases, items) {
  return { id, title, meta, group, aliases, type: "stock", items };
}

function news(id, title, time, daysAgo, importance, summary, detail, analysis, impact) {
  return { id, title, time, daysAgo, importance, summary, detail, analysis, impact };
}
