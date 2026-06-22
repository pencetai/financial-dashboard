const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const sessions = new Map();

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
});

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/auth/me") return sendJson(res, 200, { user: getUser(req) });
  if (req.method === "POST" && url.pathname === "/api/auth/login") return login(req, res);
  if (req.method === "POST" && url.pathname === "/api/auth/logout") return logout(req, res);
  if (req.method === "GET" && url.pathname === "/api/market/overview") return marketOverview(res);
  if (req.method === "GET" && url.pathname === "/api/watchlist") return sendJson(res, 200, { watchlist: readStore().watchlist });
  if (req.method === "POST" && url.pathname === "/api/watchlist") return updateWatchlist(req, res);
  if (req.method === "POST" && url.pathname === "/api/news/search") return searchNews(req, res);
  if (req.method === "POST" && url.pathname === "/api/strategy/hot-money") return sendJson(res, 200, { generatedAt: new Date().toISOString(), candidates: hotMoneyCandidates });
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
  const groups = localNewsSearch(keyword);
  const payload = {
    keyword,
    generatedAt: new Date().toISOString(),
    source: "mock-codex-search",
    rule: "近 7 日、两星及以上、按重要性排序，最多 20 条",
    groups
  };
  store.newsCache[cacheKey] = { savedAt: Date.now(), payload };
  writeStore(store);
  sendJson(res, 200, { ...payload, cache: "miss", remaining: limit - store.usage[today][userKey].newsSearches });
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
    writeStore({ watchlist: ["中际旭创", "NVIDIA", "外围与宏观", "贵州茅台", "宁德时代", "Tesla", "Apple", "黄金"], newsCache: {}, usage: {} });
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
