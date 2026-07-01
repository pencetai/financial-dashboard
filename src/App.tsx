import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bell,
  Bookmark,
  ChevronDown,
  Clock,
  Flame,
  LineChart,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavKey = "monitor" | "watch" | "picks";

type MarketAsset = {
  symbol: string;
  name: string;
  market?: string;
  group?: string;
  price: number;
  change: number;
  alert?: string;
  isTrading?: boolean;
  updatedAt?: string;
  dataDate?: string;
};

type WatchNewsItem = {
  id: string;
  title: string;
  source?: string;
  summary?: string;
  detail?: string;
  analysis?: string;
  impact?: string;
  importance?: number;
  rankScore?: number;
  collectedAt?: string;
  analyzedAt?: string;
  publishedAt?: string;
  url?: string;
};

type WatchGroup = {
  id: string;
  title: string;
  meta?: string;
  group?: string;
  type?: string;
  items: WatchNewsItem[];
};

type HotMoneyCandidate = {
  rank: number;
  name: string;
  symbol: string;
  theme: string;
  funds?: string;
  score?: number;
  signal?: string;
  risk?: string;
};

const titles: Record<NavKey, string> = {
  monitor: "监控",
  watch: "关注",
  picks: "选股",
};

const navItems: { key: NavKey; label: string; icon: typeof Activity; hint: string }[] = [
  { key: "monitor", label: "监控", icon: Activity, hint: "全球市场概览" },
  { key: "watch", label: "关注", icon: Bookmark, hint: "自选股与新闻热榜" },
  { key: "picks", label: "选股", icon: LineChart, hint: "策略与信号" },
];

function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

function App() {
  const [nav, setNav] = useState<NavKey>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash === "watch" || hash === "picks" ? hash : "monitor";
  });

  useEffect(() => {
    window.history.replaceState(null, "", `#${nav}`);
  }, [nav]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar active={nav} onChange={setNav} />
      <main className="flex-1 min-w-0">
        <header className="h-14 sticky top-0 z-10 bg-surface/85 backdrop-blur border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>工作台</span>
            <span className="text-border-strong">/</span>
            <span className="text-foreground font-medium">{titles[nav]}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
              接口连接正常
            </span>
            <span className="text-border-strong">·</span>
            <span className="num">测试版</span>
          </div>
        </header>
        {nav === "monitor" && <MonitorPage />}
        {nav === "watch" && <WatchPage />}
        {nav === "picks" && <StockPickPage />}
      </main>
    </div>
  );
}

function Sidebar({ active, onChange }: { active: NavKey; onChange: (key: NavKey) => void }) {
  return (
    <aside className="w-56 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-elev">FD</div>
        <div className="text-sm font-semibold tracking-tight">Financial Desk</div>
      </div>
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input className="w-full h-8 pl-7 pr-2 text-xs rounded-md bg-surface-muted border border-transparent focus:border-primary focus:bg-surface outline-none transition-colors" placeholder="搜索代码/名称" />
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">工作台</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-left transition-colors group",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
              title={item.hint}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1">{item.label}</span>
              {isActive && <span className="w-1 h-4 rounded-full bg-primary" />}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/60">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left">提醒</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning-soft text-warning">3</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/60">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left">设置</span>
        </button>
      </div>
    </aside>
  );
}

function MonitorPage() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<{ assets: MarketAsset[] }>("/api/market/overview")
      .then((payload) => !cancelled && setAssets(payload.assets || []))
      .catch(() => !cancelled && setAssets(fallbackAssets))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = assets.filter((asset) => market === "all" || asset.group === market);
  const up = assets.filter((asset) => asset.change >= 0).length;
  const down = assets.length - up;

  return (
    <div className="p-6 space-y-5">
      <PageTitle icon={Activity} eyebrow="全球市场 · 低频监控" title="监控台" sub={`上涨 ${up} · 下跌 ${down} · ${loading ? "正在读取接口" : "已读取最新缓存"}`} />
      <div className="flex items-center gap-2">
        <Segment active={market} value="all" onClick={setMarket}>全部</Segment>
        <Segment active={market} value="cn" onClick={setMarket}>A 股</Segment>
        <Segment active={market} value="us" onClick={setMarket}>美股</Segment>
        <Segment active={market} value="global" onClick={setMarket}>全球资产</Segment>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {filtered.map((asset, index) => {
          const gain = asset.change >= 0;
          return (
            <div key={`${asset.symbol}-${index}`} className="bg-card border border-border rounded-md p-3 shadow-card hover:shadow-elev hover:border-border-strong transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">{asset.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-sm", asset.isTrading ? "bg-gain-soft text-gain" : "bg-muted text-muted-foreground")}>
                      {asset.isTrading ? "交易中" : "休市/上一交易日"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 num">{asset.symbol} · {asset.alert || "观察中"}</div>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                  <div className={cn("text-lg font-semibold num tracking-tight", gain ? "text-gain" : "text-loss")}>{formatPrice(asset.price)}</div>
                  <div className={cn("mt-0.5 inline-flex items-center gap-1 text-xs num", gain ? "text-gain" : "text-loss")}>
                    {gain ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {gain ? "+" : ""}{asset.change.toFixed(2)}%
                  </div>
                </div>
                <Sparkline data={makeSpark(index + 9, gain ? 0.05 : -0.04)} color={gain ? "gain" : "loss"} width={92} height={34} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WatchPage() {
  const [groups, setGroups] = useState<WatchGroup[]>([]);
  const [activeId, setActiveId] = useState("");
  const [openId, setOpenId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchGroups, setSearchGroups] = useState<WatchGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("自动新闻每 30 分钟刷新一次");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<{ groups: WatchGroup[]; source?: string; updatedAt?: string }>("/api/watch/news")
      .then((payload) => {
        if (cancelled) return;
        const next = payload.groups || [];
        setGroups(next);
        setActiveId(next[0]?.id || "");
        setStatus(`来源：${payload.source || "自动新闻缓存"} · ${formatCollected(payload.updatedAt)}`);
      })
      .catch(() => setStatus("自动新闻暂时不可用，请稍后刷新"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGroups = searchGroups || groups;
  const activeGroup = visibleGroups.find((group) => group.id === activeId) || visibleGroups[0];
  const news = useMemo(() => {
    return [...(activeGroup?.items || [])]
      .filter((item) => Number(item.importance || 0) >= 40)
      .sort((a, b) => Number(b.rankScore || b.importance || 0) - Number(a.rankScore || a.importance || 0))
      .slice(0, 20);
  }, [activeGroup]);

  async function searchNews() {
    if (!keyword.trim()) return;
    setLoading(true);
    setStatus("正在搜索近 7 日相关新闻并分析排序");
    try {
      const payload = await apiFetch<{ groups: WatchGroup[]; source?: string }>("/api/news/search", {
        method: "POST",
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const next = payload.groups || [];
      setSearchGroups(next);
      setActiveId(next[0]?.id || "");
      setOpenId("");
      setStatus(`搜索完成：${payload.source || "新闻搜索"} · ${formatCollected(new Date().toISOString())}`);
    } catch {
      setStatus("搜索失败或今日次数已用完");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <PageTitle icon={Bookmark} eyebrow="自选股 · 自动新闻热榜" title="关注" sub={status} />
      <div className="bg-card border border-border rounded-md shadow-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && searchNews()}
            className="h-9 flex-1 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-primary"
            placeholder="模糊搜索个股近 7 日新闻，例如：英伟达 / NVDA / 中际旭创"
          />
          <button onClick={searchNews} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1.5">
            <Search className="w-4 h-4" /> 搜索分析
          </button>
          {searchGroups && (
            <button onClick={() => { setSearchGroups(null); setActiveId(groups[0]?.id || ""); }} className="h-9 px-3 rounded-md border border-border text-sm hover:bg-surface-muted">
              返回关注
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-4">
        <div className="space-y-2">
          {visibleGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => { setActiveId(group.id); setOpenId(""); }}
              className={cn("w-full text-left bg-card border rounded-md p-3 shadow-card transition-all", activeGroup?.id === group.id ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-border-strong")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{group.title}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{group.meta || (group.type === "macro" ? "宏观/外围" : "自选标的")}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-primary-soft text-primary">{group.items?.length || 0}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{group.type === "macro" ? "宏观" : "个股"}</span>
                <span>热榜</span>
              </div>
            </button>
          ))}
        </div>
        <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
          <div className="h-12 px-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold">{activeGroup?.title || "新闻热榜"}</div>
            <div className="text-[11px] text-muted-foreground">{loading ? "更新中" : "最多 20 条"}</div>
          </div>
          <div className="divide-y divide-border">
            {news.map((item, index) => {
              const open = openId === item.id;
              return (
                <div key={item.id}>
                  <button onClick={() => setOpenId(open ? "" : item.id)} className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-muted/60 transition-colors">
                    <RankBadge rank={index + 1} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-primary-soft text-accent-foreground">{item.impact || "关注"}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                        <span>{item.source || item.summary || "新闻源"}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {formatCollected(item.analyzedAt || item.collectedAt)}</span>
                        <Stars value={item.importance || 0} />
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform", open && "rotate-180")} />
                  </button>
                  {open && <NewsDetail item={item} />}
                </div>
              );
            })}
            {!news.length && <div className="p-8 text-sm text-muted-foreground text-center">暂无可展示新闻</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsDetail({ item }: { item: WatchNewsItem }) {
  return (
    <div className="px-4 pb-4 pl-[52px] bg-surface-muted/30">
      <div className="grid grid-cols-2 gap-3 pt-1">
        <DetailBlock label="详细新闻" span>{item.detail || item.summary || item.title}</DetailBlock>
        <DetailBlock label="详细分析" span>{item.analysis || "测试版先按来源、时间、关键词和重要性评分排序；后续接入 Agent 后将输出更完整的影响路径。"}</DetailBlock>
        <DetailBlock label="可能影响" span>{item.impact || "等待更多来源交叉验证。"}</DetailBlock>
        {item.url && <DetailBlock label="原文链接" span><a className="text-primary hover:underline" href={item.url} target="_blank" rel="noreferrer">{item.url}</a></DetailBlock>}
      </div>
    </div>
  );
}

function StockPickPage() {
  const [active, setActive] = useState("hot-money");
  const [candidates, setCandidates] = useState<HotMoneyCandidate[]>([]);
  const [source, setSource] = useState("等待运行");
  const [loading, setLoading] = useState(false);

  async function runHotMoney() {
    setLoading(true);
    setSource("正在读取龙虎榜/游资接口");
    try {
      const payload = await apiFetch<{ source?: string; candidates: HotMoneyCandidate[] }>("/api/strategy/hot-money", { method: "POST", body: "{}" });
      setCandidates((payload.candidates || []).slice(0, 10));
      setSource(payload.source || "策略接口");
    } catch {
      setSource("策略接口暂时不可用");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runHotMoney();
  }, []);

  return (
    <div className="p-6 space-y-5">
      <PageTitle icon={Target} eyebrow="量化策略 · 信号盘" title="选股" sub={`当前来源：${source}`} />
      <div className="grid grid-cols-3 gap-3">
        <StrategyCard active={active === "hot-money"} icon={Flame} title="游资跟踪策略" scope="A 股" desc="追踪龙虎榜与活跃席位，输出短线资金关注度较高的 10 只股票。" onClick={() => setActive("hot-money")} />
        <StrategyCard active={active === "institution"} icon={Wallet} title="机构资金跟踪" scope="A 股 / 港股" desc="北向、机构专用席位与 ETF 配置方向，后续接入。" onClick={() => setActive("institution")} />
        <StrategyCard active={active === "event"} icon={Sparkles} title="事件驱动策略" scope="全市场" desc="财报、政策、并购重组等事件因子，后续接入自然语言策略。" onClick={() => setActive("event")} />
      </div>
      {active === "hot-money" ? (
        <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
          <div className="h-12 px-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><Flame className="w-4 h-4 text-warning" /> 游资跟踪策略 · Top 10</div>
            <button onClick={runHotMoney} className="h-8 px-3 rounded-md border border-border text-xs inline-flex items-center gap-1.5 hover:bg-surface-muted">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> 刷新
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-muted/60 text-[11px] text-muted-foreground">
              <tr>
                <Th className="w-14 text-center">排名</Th>
                <Th>股票</Th>
                <Th>题材</Th>
                <Th>资金/席位</Th>
                <Th>信号</Th>
                <Th className="text-center">风险</Th>
                <Th className="text-right">分数</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((row) => (
                <tr key={`${row.symbol}-${row.rank}`} className="hover:bg-surface-muted/40">
                  <Td className="text-center"><RankBadge rank={row.rank} /></Td>
                  <Td><div className="font-medium">{row.name}</div><div className="text-[11px] text-muted-foreground num">{row.symbol}</div></Td>
                  <Td><span className="text-xs px-1.5 py-0.5 rounded-sm bg-primary-soft text-accent-foreground">{row.theme}</span></Td>
                  <Td className="text-xs text-muted-foreground">{row.funds || "龙虎榜活跃资金"}</Td>
                  <Td className="text-xs">{row.signal || "资金关注度较高"}</Td>
                  <Td className="text-center"><span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-sm bg-warning-soft text-warning"><ShieldAlert className="w-3 h-3" /> {row.risk || "波动"}</span></Td>
                  <Td className="text-right num font-semibold">{row.score || "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md shadow-card p-8 text-center">
          <LineChart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm font-medium">该策略明细将在后续版本接入</div>
        </div>
      )}
    </div>
  );
}

function PageTitle({ icon: Icon, eyebrow, title, sub }: { icon: typeof Activity; eyebrow: string; title: string; sub: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Segment({ active, value, onClick, children }: { active: string; value: string; onClick: (value: string) => void; children: React.ReactNode }) {
  return <button onClick={() => onClick(value)} className={cn("h-8 px-3 text-xs rounded-md border", active === value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-surface-muted")}>{children}</button>;
}

function StrategyCard({ active, icon: Icon, title, scope, desc, onClick }: { active: boolean; icon: typeof Flame; title: string; scope: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("text-left bg-card border rounded-md p-4 transition-all", active ? "border-primary shadow-elev ring-1 ring-primary/20" : "border-border shadow-card hover:border-border-strong hover:shadow-elev")}>
      <div className="flex items-start justify-between">
        <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", active ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary")}><Icon className="w-4 h-4" /></div>
        {active && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gain-soft text-gain">运行中</span>}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-2"><span className="text-sm font-semibold">{title}</span><span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-surface-muted text-muted-foreground">{scope}</span></div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

function Sparkline({ data, color, width = 120, height = 36 }: { data: number[]; color: "gain" | "loss" | "neutral"; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const stroke = color === "gain" ? "hsl(var(--gain))" : color === "loss" ? "hsl(var(--loss))" : "hsl(var(--muted-foreground))";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={`${path} L ${width},${height} L 0,${height} Z`} fill={stroke} opacity="0.08" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DetailBlock({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return <div className={cn("bg-card border border-border rounded-md p-3", span && "col-span-2")}><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">{label}</div><div className="text-xs leading-relaxed break-words">{children}</div></div>;
}

function RankBadge({ rank }: { rank: number }) {
  return <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-semibold num", rank <= 3 ? "bg-loss text-loss-foreground" : rank <= 5 ? "bg-warning text-warning-foreground" : "bg-surface-muted text-muted-foreground border border-border")}>{rank}</span>;
}

function Stars({ value }: { value: number }) {
  const count = Math.max(1, Math.min(5, Math.ceil(value / 20)));
  return <span className="inline-flex items-center gap-0.5">{Array.from({ length: count }).map((_, index) => <span key={index} className={count >= 5 ? "text-loss" : "text-warning"}>★</span>)}</span>;
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-3 py-2 text-left font-medium", className)}>{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 align-middle", className)}>{children}</td>;
}

function formatPrice(value: number) {
  if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toFixed(value < 10 ? 4 : 2);
}

function formatCollected(value?: string) {
  if (!value) return "收集分析时间待更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `收集分析 ${value}`;
  return `收集分析 ${date.toLocaleString("zh-CN", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`;
}

function makeSpark(seed: number, drift = 0) {
  const data: number[] = [];
  let value = 100;
  for (let i = 0; i < 36; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    value += (seed / 233280 - 0.5) * 3 + drift;
    data.push(value);
  }
  return data;
}

const fallbackAssets: MarketAsset[] = [
  { symbol: "000001", name: "上证指数", group: "cn", price: 3182.44, change: 0.46, isTrading: false, alert: "备用缓存" },
  { symbol: "399006", name: "创业板指", group: "cn", price: 1848.16, change: -0.22, isTrading: false, alert: "备用缓存" },
  { symbol: "NVDA", name: "NVIDIA", group: "us", price: 124.91, change: 1.68, isTrading: true, alert: "备用缓存" },
  { symbol: "TSLA", name: "Tesla", group: "us", price: 181.64, change: -2.06, isTrading: true, alert: "备用缓存" },
  { symbol: "XAU", name: "现货黄金", group: "global", price: 2354.2, change: 0.31, isTrading: true, alert: "备用缓存" },
  { symbol: "DXY", name: "美元指数", group: "global", price: 104.28, change: -0.09, isTrading: true, alert: "备用缓存" },
];

export default App;
