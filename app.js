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
  {
    id: "zhongji",
    title: "中际旭创",
    meta: "300308 · A 股 · CPO/光模块",
    group: "cn",
    type: "stock",
    items: [
      {
        id: "zj-1",
        title: "CPO 板块放量走强，中际旭创成交额进入市场前列",
        time: "5 分钟前",
        importance: 94,
        summary: "资金继续围绕 AI 算力链交易，光模块龙头获得高弹性溢价。",
        detail: "盘中光模块板块成交明显放大，中际旭创强于多数同类标的。模拟数据显示，短线资金更关注订单预期、海外云厂资本开支和英伟达产业链景气度。",
        analysis: "若放量上涨能维持，说明资金认可 AI 算力链的业绩兑现路径；若冲高回落，则可能是高位情绪交易，需观察成交额和板块联动。",
        impact: "偏利多，注意高位波动"
      },
      {
        id: "zj-2",
        title: "海外 AI 资本开支预期上修，光模块订单能见度提升",
        time: "28 分钟前",
        importance: 87,
        summary: "云厂商投入增加会强化上游光模块需求预期。",
        detail: "多家云服务商继续强调 AI 基础设施投入，市场将其映射到高速光模块需求。中际旭创作为核心供应链标的，容易成为资金追踪对象。",
        analysis: "这类新闻通常先影响估值和情绪，再等待订单、毛利率和交付节奏验证。若后续业绩不及预期，估值回撤也会比较快。",
        impact: "中期偏利多"
      }
    ]
  },
  {
    id: "nvidia",
    title: "NVIDIA",
    meta: "NVDA · 美股 · AI 芯片",
    aliases: "英伟达 黄仁勋 AI芯片",
    group: "us",
    type: "stock",
    items: [
      {
        id: "nvda-1",
        title: "AI 芯片订单预期上修，NVIDIA 盘前延续强势",
        time: "12 分钟前",
        importance: 96,
        summary: "市场继续交易 AI 基础设施扩张，半导体链条风险偏好升温。",
        detail: "模拟新闻显示，机构上调 AI 加速卡出货预期，带动 NVIDIA 与相关服务器、散热、光模块方向同步受关注。",
        analysis: "对 NVIDIA 本身偏利多，对 A 股 CPO、服务器和先进封装方向也有映射。需要关注估值已经反映多少增长，以及财报指引是否继续上修。",
        impact: "偏利多 AI 产业链"
      },
      {
        id: "nvda-2",
        title: "美国科技股估值分化，资金更偏好盈利确定性资产",
        time: "41 分钟前",
        importance: 82,
        summary: "高增长龙头继续吸引资金，但非核心科技股承压。",
        detail: "在利率预期反复的背景下，资金倾向选择盈利可见度更高的 AI 龙头，而对估值高但业绩不稳定的公司更谨慎。",
        analysis: "这可能让 NVIDIA 相对强势，但也意味着财报和指引容错率下降。若出现供应、毛利率或监管扰动，波动会加大。",
        impact: "结构性利多"
      }
    ]
  },
  {
    id: "macro",
    title: "外围与宏观",
    meta: "美联储 · 美国政府 · 中国央行 · 黄金/宽基",
    group: "global",
    type: "macro",
    items: [
      {
        id: "macro-1",
        title: "美联储官员释放谨慎信号，市场下调短期降息概率",
        time: "3 分钟前",
        importance: 98,
        summary: "利率预期重新定价，成长股估值和黄金价格都可能出现波动。",
        detail: "官员讲话强调通胀仍需观察，市场对短期降息的押注下降。美元指数走强时，黄金和高估值成长股通常承压；若后续通胀数据回落，交易方向可能快速反转。",
        analysis: "对美股成长股偏压制，对美元偏利多；A 股可能受到外部风险偏好影响，但若国内流动性宽松，影响会被部分对冲。",
        impact: "偏利空成长股，偏利多美元"
      },
      {
        id: "macro-2",
        title: "央行公开市场净投放扩大，宽基指数成交活跃",
        time: "16 分钟前",
        importance: 91,
        summary: "流动性预期改善，宽基和低估值蓝筹关注度提升。",
        detail: "模拟数据显示，公开市场净投放加大后，市场对国内流动性环境更乐观。宽基 ETF 成交增加，说明资金可能先通过指数产品表达风险偏好。",
        analysis: "对 A 股整体情绪偏利多，尤其是估值较低、流动性较好的方向。若政策连续性不足，市场可能重新回到结构性行情。",
        impact: "偏利多 A 股风险偏好"
      },
      {
        id: "macro-3",
        title: "黄金 ETF 持仓回升，央行购金叙事重新升温",
        time: "37 分钟前",
        importance: 78,
        summary: "避险需求与央行购金预期支撑贵金属关注度。",
        detail: "黄金 ETF 持仓小幅回升，同时市场关注多国央行储备配置变化。若美元走弱或地缘风险升温，黄金可能继续获得配置需求。",
        analysis: "对黄金和贵金属板块偏利多；但若美债实际利率上行，黄金估值会受压。",
        impact: "偏利多黄金"
      }
    ]
  }
];

const extraWatchGroups = [
  {
    id: "kweichow",
    title: "贵州茅台",
    meta: "600519 · A 股 · 白酒",
    group: "cn",
    type: "stock",
    items: [
      { id: "mt-1", title: "白酒板块估值修复，贵州茅台获北向资金净流入", time: "1 天前", daysAgo: 1, importance: 84, summary: "消费权重回暖，低估值修复逻辑增强。", detail: "模拟新闻显示，北向资金对白酒龙头出现连续净流入，市场关注春节备货、渠道库存和批价稳定性。", analysis: "若批价稳定且成交放大，可能带动消费权重估值修复；若量能不足，行情可能偏防御。", impact: "偏利多消费权重" },
      { id: "mt-2", title: "渠道反馈动销平稳，高端酒价格体系仍需观察", time: "3 天前", daysAgo: 3, importance: 66, summary: "基本面没有显著恶化，但缺少强催化。", detail: "渠道调研显示动销保持平稳，库存压力可控，但价格弹性仍有限。", analysis: "对股价影响偏中性，更多取决于市场风格是否回到核心资产。", impact: "中性偏稳" }
    ]
  },
  {
    id: "catl",
    title: "宁德时代",
    meta: "300750 · A 股 · 新能源",
    group: "cn",
    type: "stock",
    items: [
      { id: "catl-1", title: "新能源车链分化，宁德时代大单资金出现回补", time: "2 天前", daysAgo: 2, importance: 79, summary: "资金尝试回流龙头，但板块一致性不足。", detail: "模拟成交数据显示，宁德时代在回调后出现资金回补，市场关注海外储能订单和动力电池价格。", analysis: "若板块放量共振，龙头可能先修复；若行业价格战升温，估值仍受压。", impact: "短线观察" },
      { id: "catl-2", title: "储能订单预期改善，电池龙头盈利弹性受关注", time: "5 天前", daysAgo: 5, importance: 73, summary: "储能可能成为新能源链条的新催化。", detail: "海外储能需求预期改善，市场重新评估电池龙头的订单结构。", analysis: "对中期预期偏正面，但需要看到毛利率和出货数据验证。", impact: "中期偏利多" }
    ]
  },
  {
    id: "tesla",
    title: "Tesla",
    meta: "TSLA · 美股 · 智能汽车",
    group: "us",
    type: "stock",
    items: [
      { id: "tsla-1", title: "Tesla 交付预期波动，市场关注价格策略", time: "6 小时前", daysAgo: 0, importance: 82, summary: "交付与毛利率仍是股价核心矛盾。", detail: "模拟新闻显示，市场对 Tesla 季度交付预期分歧加大，价格调整和库存变化成为关注点。", analysis: "若交付改善但毛利承压，股价可能震荡；若自动驾驶催化增强，估值弹性会提升。", impact: "波动加大" },
      { id: "tsla-2", title: "自动驾驶版本更新带动软件收入想象空间", time: "4 天前", daysAgo: 4, importance: 69, summary: "软件叙事回暖，但仍需商业化数据验证。", detail: "新版自动驾驶能力升级后，市场重新讨论软件订阅和长期利润率。", analysis: "对估值偏利多，但短期仍受交付和价格战影响。", impact: "结构性利多" }
    ]
  },
  {
    id: "apple",
    title: "Apple",
    meta: "AAPL · 美股 · 消费电子",
    group: "us",
    type: "stock",
    items: [
      { id: "aapl-1", title: "Apple 新品周期临近，供应链订单预期小幅上修", time: "2 天前", daysAgo: 2, importance: 72, summary: "新品周期带动供应链情绪修复。", detail: "模拟供应链消息显示，新品备货预期略有改善，市场关注 AI 功能落地节奏。", analysis: "对 Apple 和部分消费电子链偏利多，但需要销量验证。", impact: "温和利多" },
      { id: "aapl-2", title: "服务收入保持韧性，硬件增长仍待新品催化", time: "6 天前", daysAgo: 6, importance: 63, summary: "利润结构稳定，但硬件端缺少强增长。", detail: "服务收入继续提供利润支撑，硬件业务等待新品周期和 AI 功能刺激。", analysis: "偏防御属性，短期弹性不如 AI 芯片链。", impact: "偏中性" }
    ]
  }
];

watchGroups.push(...extraWatchGroups);

const watchlist = ["中际旭创", "NVIDIA", "Tesla"];
let activeMarket = "all";
let activeNewsId = "macro-1";
let activeWatchGroupId = "zhongji";
let expandedNewsId = "";
let remoteSearchResults = null;
let remoteSearchKeyword = "";
let isSearchingNews = false;
let isLoadingWatchNews = false;
let watchNewsSource = "备用数据";
let watchNewsNextRefreshAt = "";

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

const strategies = [
  {
    id: "hot-money",
    title: "游资跟踪策略",
    scope: "仅限 A 股",
    status: "已启用",
    summary: "跟踪知名游资与龙虎榜活跃席位，输出 10 只短线资金关注股票。",
    prompt: "游资跟踪策略：仅限 A 股，搜集知名游资动向，观察他们集中持有哪些股票，总结并输出 10 只游资炒作活跃股票。"
  },
  {
    id: "institution-flow",
    title: "机构资金跟踪",
    scope: "A 股 / 美股",
    status: "待接入",
    summary: "跟踪机构增持、ETF 配置、北向资金和大额成交方向。",
    prompt: "机构资金跟踪：识别机构资金持续流入且趋势结构保持健康的标的。"
  },
  {
    id: "event-driven",
    title: "事件驱动策略",
    scope: "多市场",
    status: "待接入",
    summary: "围绕政策、财报、并购、产品发布等事件筛选短中期机会。",
    prompt: "事件驱动策略：寻找由重大新闻或公告触发的交易机会。"
  }
];

let activeStrategyId = "hot-money";
let hotMoneyApiCandidates = null;
let hotMoneySource = "";
let isLoadingHotMoney = false;

const viewCopy = {
  monitor: { eyebrow: "多市场实时工作台", title: "全球金融监控" },
  watch: { eyebrow: "按标的分组追踪", title: "关注新闻与影响分析" },
  strategy: { eyebrow: "自然语言策略", title: "选股策略工作台" }
};

const marketRows = document.querySelector("#marketRows");
const newsList = document.querySelector("#newsList");
const watchCards = document.querySelector("#watchCards");
const watchSearch = document.querySelector("#watchSearch");
const watchSearchButton = document.querySelector("#watchSearchButton");
const watchSearchStatus = document.querySelector("#watchSearchStatus");
const strategyCards = document.querySelector("#strategyCards");
const strategyOutput = document.querySelector("#strategyOutput");
const pageEyebrow = document.querySelector("#pageEyebrow");
const pageTitle = document.querySelector("#pageTitle");

function formatPrice(value) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function buildSeries(asset) {
  if (asset.series) return asset.series;
  const points = [];
  let value = 100;
  const bias = asset.change >= 0 ? 0.16 : -0.16;
  for (let index = 0; index < 24; index += 1) {
    const wave = Math.sin(index * 0.7 + asset.symbol.length) * 0.48;
    const drift = (Math.random() - 0.5) * 0.55 + bias;
    value = Math.max(94, Math.min(108, value + wave + drift));
    points.push(Number(value.toFixed(2)));
  }
  asset.series = points;
  return points;
}

function sparkline(series, isUp) {
  const width = 180;
  const height = 38;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series.map((value, index) => {
    const x = (index / (series.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return [x, y];
  });
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return `
    <svg class="sparkline ${isUp ? "up" : "down"}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <path class="spark-area" d="${area}"></path>
      <path class="line" d="${line}"></path>
    </svg>
  `;
}

function visibleAssets() {
  if (activeMarket === "all") return assets;
  return assets.filter((asset) => asset.group === activeMarket || asset.group === "global");
}

function visibleNewsGroups() {
  const groups = selectedWatchGroups().filter((group) => activeMarket === "all" || group.group === activeMarket || group.group === "global");

  if (remoteSearchResults) {
    return remoteSearchResults;
  }

  return groups
    .filter((group) => group.id === activeWatchGroupId)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => importanceStars(item.importance) >= 2)
    }))
    .filter((group) => group.items.length > 0);
}

function selectedWatchGroups() {
  const selected = new Set(watchlist.map((item) => item.toLowerCase()));
  return watchGroups.filter((group) => selected.has(group.title.toLowerCase()) || selected.has((group.meta || "").split("·")[0].trim().toLowerCase()));
}

function findNewsItem(id = activeNewsId) {
  for (const group of watchGroups) {
    const item = group.items.find((candidate) => candidate.id === id);
    if (item) return { group, item };
  }
  return { group: watchGroups[0], item: watchGroups[0].items[0] };
}

function importanceStars(importance) {
  return Math.max(1, Math.min(5, Math.ceil(importance / 20)));
}

function renderStars(importance) {
  const count = importanceStars(importance);
  return `<span class="stars stars-${count}" aria-label="重要性 ${count} 星">${"★".repeat(count)}</span>`;
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

function mockCodexNewsSearch(keyword) {
  isSearchingNews = true;
  remoteSearchKeyword = keyword;
  remoteSearchResults = null;
  activeNewsId = "";
  expandedNewsId = "";
  renderWatchCards();
  renderNews();
  updateSearchStatus();

  apiFetchJson("/api/news/search", {
    method: "POST",
    body: JSON.stringify({ keyword })
  })
    .then((payload) => {
      remoteSearchResults = Array.isArray(payload.groups) ? payload.groups : localNewsSearch(keyword);
    })
    .catch(() => {
      remoteSearchResults = localNewsSearch(keyword);
    })
    .finally(() => {
      isSearchingNews = false;
      activeNewsId = "";
      expandedNewsId = "";
      renderWatchCards();
      renderNews();
      updateSearchStatus();
    });
}

function clearRemoteSearch() {
  remoteSearchResults = null;
  remoteSearchKeyword = "";
  isSearchingNews = false;
  expandedNewsId = "";
  updateSearchStatus();
}

function updateSearchStatus() {
  if (isSearchingNews) {
    watchSearchStatus.textContent = `Codex 正在联网搜索并分析「${remoteSearchKeyword}」近 7 日新闻...`;
    return;
  }
  if (remoteSearchKeyword) {
    const count = remoteSearchResults?.reduce((sum, group) => sum + group.items.length, 0) || 0;
    watchSearchStatus.textContent = `测试结果：已按两星以上规则筛出 ${count} 条近 7 日新闻。后续这里会调用 Codex 联网搜索。`;
    return;
  }
  watchSearchStatus.textContent = isLoadingWatchNews
    ? "正在读取已关注股票的自动新闻热榜..."
    : `关注热榜来源：${watchNewsSource}${watchNewsNextRefreshAt ? `，下次自动刷新：${watchNewsNextRefreshAt}` : ""}。搜索框仅作为临时补充入口。`;
}

function groupTopNews(group) {
  return [...(group.items || [])].sort((a, b) => b.importance - a.importance)[0] || {
    id: `${group.id}-empty`,
    title: "暂无两星以上新闻",
    importance: 20,
    impact: "等待更多消息"
  };
}

async function apiFetchJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

async function loadMarketOverview() {
  try {
    const payload = await apiFetchJson("/api/market/overview");
    if (Array.isArray(payload.assets)) {
      assets.splice(0, assets.length, ...payload.assets.map((asset) => ({ ...asset, series: undefined })));
    }
  } catch {
    // Static deployment fallback keeps local mock data.
  }
  renderMarketRows();
  updateIndexCards();
}

async function loadWatchNews() {
  isLoadingWatchNews = true;
  updateSearchStatus();
  renderWatchCards();
  renderNews();
  try {
    const payload = await apiFetchJson("/api/watch/news");
    if (Array.isArray(payload.groups) && payload.groups.length) {
      watchGroups.splice(0, watchGroups.length, ...payload.groups);
      activeWatchGroupId = watchGroups.some((group) => group.id === activeWatchGroupId) ? activeWatchGroupId : watchGroups[0].id;
      const group = watchGroups.find((item) => item.id === activeWatchGroupId) || watchGroups[0];
      activeNewsId = groupTopNews(group).id;
      watchNewsSource =
        payload.source === "scheduled-watch-feeds"
          ? "定时定向数据源"
          : payload.source === "mixed-scheduled-watch-feeds"
          ? "定向数据源 + 备用数据"
          : "备用数据";
      watchNewsNextRefreshAt = payload.nextRefreshAt ? new Date(payload.nextRefreshAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "";
    }
  } catch {
    watchNewsSource = "备用数据";
  } finally {
    isLoadingWatchNews = false;
    renderWatchCards();
    renderNews();
    updateSearchStatus();
  }
}

function renderMarketRows() {
  marketRows.innerHTML = visibleAssets()
    .map((asset) => {
      const changeClass = asset.change >= 0 ? "up" : "down";
      const sign = asset.change >= 0 ? "+" : "";
      const alertClass = Math.abs(asset.change) > 1.5 ? "movement alert" : "movement";
      const sessionClass = asset.isTrading ? "session-pill trading" : "session-pill closed";
      const sessionText = asset.isTrading ? "交易中" : "未开盘";
      const dataText = asset.isTrading ? "当前交易日" : "上一交易日";
      return `
        <article class="market-card">
          <div class="market-card-head">
            <span class="market-card-title"><strong>${asset.name}</strong><small>${asset.symbol}</small></span>
            <strong class="${changeClass}">${sign}${asset.change.toFixed(2)}%</strong>
          </div>
          ${sparkline(buildSeries(asset), asset.change >= 0)}
          <div class="market-card-main">
            <strong class="market-price">${formatPrice(asset.price)}</strong>
            <em class="${alertClass}">${asset.alert}</em>
          </div>
          <div class="market-card-foot">
            <span class="${sessionClass}">${sessionText}</span>
            <span>${dataText}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNews() {
  const groups = visibleNewsGroups();
  const keyword = remoteSearchKeyword;
  if (!keyword && !groups.some((group) => group.items.some((item) => item.id === activeNewsId))) {
    activeNewsId = groups[0]?.items[0]?.id || activeNewsId;
  }

  const rows = groups
    .flatMap((group) => group.items.map((item) => ({ group, item })))
    .sort((a, b) => (b.item.rankScore || b.item.importance) - (a.item.rankScore || a.item.importance))
    .slice(0, 20);
  if (rows.length && !rows.some(({ item }) => item.id === activeNewsId)) {
    activeNewsId = rows[0].item.id;
  }

  newsList.innerHTML = `
    <section class="news-group">
      <header class="news-group-head">
        <div>
          <h3>${keyword ? "联网搜索热榜" : `${groups[0]?.title || "关注"} 新闻热榜`}</h3>
          <span>${keyword ? `近 7 日 · Codex 搜索分析：${keyword}` : groups[0]?.meta || "暂无匹配新闻"}</span>
        </div>
        <b>${isSearchingNews ? "搜索中" : `${rows.length} 条`}</b>
      </header>
      <div class="news-stack">
        ${
          isSearchingNews
            ? `<div class="empty-state">正在联网搜索、判断重要程度并生成热榜...</div>`
            : rows.length
            ? rows
                .map(
                  ({ group, item }, index) => `
                    <article class="news-entry ${item.id === expandedNewsId ? "expanded" : ""}">
                      <button class="news-row ${item.id === expandedNewsId ? "active" : ""}" data-news-id="${item.id}">
                        <span class="news-rank">${index + 1}</span>
                        <span>
                          <strong>${item.title}</strong>
                          <small>${group.title} · ${formatCollectedAnalyzedTime(item)} · ${renderStars(item.importance)}</small>
                        </span>
                        <em>${item.impact}</em>
                      </button>
                      ${item.id === expandedNewsId ? renderNewsDetail(group, item) : ""}
                    </article>
                  `
                )
                .join("")
            : `<div class="empty-state">没有找到两星以上的自动新闻</div>`
        }
      </div>
    </section>
  `;

  document.querySelectorAll(".news-row").forEach((button) => {
    button.addEventListener("click", () => {
      activeNewsId = button.dataset.newsId;
      expandedNewsId = expandedNewsId === activeNewsId ? "" : activeNewsId;
      renderNews();
    });
  });

  if (isSearchingNews) {
    return;
  }
}

function formatCollectedAnalyzedTime(item) {
  const collected = formatClockTime(item.collectedAt);
  const analyzed = formatClockTime(item.analyzedAt);
  if (collected && analyzed && collected !== analyzed) return `收集 ${collected} · 分析 ${analyzed}`;
  if (analyzed) return `收集分析 ${analyzed}`;
  return "收集分析：本轮缓存";
}

function formatClockTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function renderNewsDetail(group, item) {
  return `
    <div class="inline-news-detail">
      <section>
        <strong>收集与分析时间</strong>
        <p>${formatCollectedAnalyzedTime(item)}。热榜按新闻新鲜度和重要程度综合排序，超过 7 天的缓存会自动删除。</p>
      </section>
      <section>
        <strong>详细新闻</strong>
        <p>${item.detail}</p>
      </section>
      <section>
        <strong>详细分析</strong>
        <p>${item.analysis}</p>
      </section>
      <section>
        <strong>可能影响</strong>
        <p>${item.impact}</p>
      </section>
    </div>
  `;
}

function renderWatchCards() {
  watchCards.innerHTML = selectedWatchGroups()
    .map((group) => {
      const top = groupTopNews(group);
      const isActive = group.id === activeWatchGroupId && !watchSearch.value.trim();
      return `
        <button class="watch-card ${isActive ? "active" : ""}" data-group-id="${group.id}">
          <span class="watch-card-top">
            <strong>${group.title}</strong>
            <em>${group.type === "macro" ? "宏观" : "个股"}</em>
          </span>
          <small>${group.meta}</small>
          <span class="watch-card-bottom">
            ${renderStars(top.importance)}
            <b>${group.items.filter((item) => importanceStars(item.importance) >= 2).length} 条</b>
          </span>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".watch-card").forEach((card) => {
    card.addEventListener("click", () => {
      clearRemoteSearch();
      activeWatchGroupId = card.dataset.groupId;
      watchSearch.value = "";
      const group = selectedWatchGroups().find((item) => item.id === activeWatchGroupId);
      activeNewsId = groupTopNews(group).id;
      renderWatchCards();
      renderNews();
    });
  });
}

function renderStrategy() {
  const strategy = strategies.find((item) => item.id === activeStrategyId) || strategies[0];
  if (strategy.id !== "hot-money") {
    strategyOutput.innerHTML = `
      <div class="strategy-card">
        <strong>${strategy.title} <span class="scope-pill">${strategy.scope}</span></strong>
        <small>${strategy.prompt}</small>
        <ul>
          <li>该策略卡片已预留，后续可接入 Codex 将自然语言转成可执行筛选逻辑。</li>
          <li>接入真实数据后，可输出候选股票、回测表现、风险解释和模拟盘跟踪。</li>
          <li>当前先保留为策略入口，不展示模拟结果。</li>
        </ul>
      </div>
    `;
    return;
  }

  const trackingRules = [
    "仅筛选 A 股，不纳入美股、港股或全球资产。",
    "跟踪知名游资席位、龙虎榜活跃席位、反复上榜席位和大额净买入方向。",
    "优先选择题材辨识度高、成交额充足、席位重复参与、板块联动强的股票。",
    "剔除一日游、缩量冲高、仅靠单一消息刺激且无资金延续的标的。"
  ];
  const candidates = hotMoneyApiCandidates || hotMoneyCandidates;

  strategyOutput.innerHTML = `
    <div class="strategy-card">
      <strong>${strategy.title} <span class="scope-pill">${strategy.scope}</span></strong>
      <small>${strategy.prompt}</small>
      <ul>${trackingRules.map((rule) => `<li>${rule}</li>`).join("")}</ul>
    </div>
    <div class="strategy-card">
      <strong>游资活跃股票 Top 10 <span class="scope-pill">${isLoadingHotMoney ? "加载中" : hotMoneySource || "备用数据"}</span></strong>
      <div class="hot-money-table">
        <div class="hot-money-row hot-money-head">
          <span>排名</span>
          <span>股票</span>
          <span>题材</span>
          <span>游资动向</span>
          <span>热度</span>
          <span>风险</span>
        </div>
        ${candidates
          .map(
            (item) => `
              <div class="hot-money-row">
                <b>${item.rank}</b>
                <span><strong>${item.name}</strong><small>${item.symbol}</small></span>
                <span>${item.theme}</span>
                <span><strong>${item.funds}</strong><small>${item.signal}</small></span>
                <span class="heat-bar"><i style="width: ${item.score}%"></i><em>${item.score}</em></span>
                <span>${item.risk}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
    <div class="strategy-card">
      <strong>后续真实数据接入口</strong>
      <ul>
        <li>接入龙虎榜、交易所公开席位、资金流、公告和题材新闻。</li>
        <li>按席位重复出现次数、净买入金额、关联题材强度、次日溢价表现打分。</li>
        <li>输出是短线观察清单，不等同于直接买入建议。</li>
      </ul>
    </div>
  `;
}

async function loadHotMoneyStrategy() {
  if (activeStrategyId !== "hot-money") return;
  isLoadingHotMoney = true;
  renderStrategy();
  try {
    const payload = await apiFetchJson("/api/strategy/hot-money", { method: "POST", body: JSON.stringify({}) });
    if (Array.isArray(payload.candidates) && payload.candidates.length) {
      hotMoneyApiCandidates = payload.candidates;
      hotMoneySource = payload.source === "eastmoney-lhb" ? "龙虎榜数据" : "备用数据";
    }
  } catch {
    hotMoneyApiCandidates = null;
    hotMoneySource = "备用数据";
  } finally {
    isLoadingHotMoney = false;
    renderStrategy();
  }
}

function renderStrategyCards() {
  strategyCards.innerHTML = strategies
    .map(
      (strategy) => `
        <button class="strategy-select-card ${strategy.id === activeStrategyId ? "active" : ""}" data-strategy-id="${strategy.id}">
          <span>
            <strong>${strategy.title}</strong>
            <em>${strategy.status}</em>
          </span>
          <small>${strategy.summary}</small>
          <b>${strategy.scope}</b>
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".strategy-select-card").forEach((card) => {
    card.addEventListener("click", () => {
      activeStrategyId = card.dataset.strategyId;
      renderStrategyCards();
      renderStrategy();
      loadHotMoneyStrategy();
    });
  });
}

function nudgeData() {
  assets.forEach((asset) => {
    if (!asset.isTrading) return;
    const drift = (Math.random() - 0.48) * 0.18;
    asset.change = Math.max(-4.8, Math.min(4.8, asset.change + drift));
    asset.price = Math.max(1, asset.price * (1 + drift / 1000));
    const series = buildSeries(asset);
    const nextPoint = Math.max(94, Math.min(108, series[series.length - 1] + drift * 4 + (Math.random() - 0.5) * 0.6));
    asset.series = [...series.slice(1), Number(nextPoint.toFixed(2))];
  });
  renderMarketRows();
  updateIndexCards();
}

function updateIndexCards() {
  const sh = assets.find((asset) => asset.symbol === "000001");
  const ndx = assets.find((asset) => asset.symbol === "NDX");
  const gold = assets.find((asset) => asset.symbol === "XAU");
  const dxy = assets.find((asset) => asset.symbol === "DXY");
  document.querySelector("#shIndex").textContent = formatPrice(sh.price);
  document.querySelector("#nasdaqIndex").textContent = formatPrice(ndx.price);
  document.querySelector("#goldIndex").textContent = formatPrice(gold.price);
  document.querySelector("#dxyIndex").textContent = formatPrice(dxy.price);
}

function showSection(section) {
  const copy = viewCopy[section] || viewCopy.monitor;
  pageEyebrow.textContent = copy.eyebrow;
  pageTitle.textContent = copy.title;
  document.querySelectorAll(".view-section").forEach((view) => {
    view.classList.toggle("active-section", view.dataset.view === section);
  });
  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === section);
  });
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    activeMarket = button.dataset.market;
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderMarketRows();
    renderNews();
    renderStrategy();
  });
});

document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const section = item.dataset.section;
    history.replaceState(null, "", `#${section}`);
    showSection(section);
  });
});

document.querySelector("#refreshButton").addEventListener("click", loadMarketOverview);
document.querySelector("#addWatchButton").addEventListener("click", () => {
  const value = watchSearch.value.trim();
  if (value && !watchlist.includes(value)) {
    watchlist.unshift(value);
    renderWatchCards();
  }
});

watchSearchButton.addEventListener("click", () => {
  const keyword = watchSearch.value.trim();
  if (!keyword) return;
  mockCodexNewsSearch(keyword);
});

watchSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const keyword = watchSearch.value.trim();
    if (keyword) mockCodexNewsSearch(keyword);
  }
});

loadMarketOverview();
loadWatchNews();
renderNews();
renderWatchCards();
renderStrategyCards();
renderStrategy();
loadHotMoneyStrategy();
updateSearchStatus();
showSection(["monitor", "watch", "strategy"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "monitor");
setInterval(loadMarketOverview, 60_000);
