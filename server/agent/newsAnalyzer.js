const config = require("../config");

async function analyzeNewsItem(item, context = {}) {
  if (!config.agent.openaiApiKey) {
    return fallbackAnalysis(item, context);
  }

  // Future agent integration belongs here. Keep provider tokens on the server only.
  return fallbackAnalysis(item, context);
}

function fallbackAnalysis(item, context = {}) {
  const target = context.target || "关注标的";
  return {
    analysis: item.analysis || `${target} 这条消息已进入自动新闻热榜，后续接入 agent 后会生成更完整的影响路径和风险解释。`,
    impact: item.impact || "等待更多来源确认影响方向。"
  };
}

module.exports = {
  analyzeNewsItem
};
