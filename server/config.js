const path = require("path");

const APP_ROOT = path.resolve(__dirname, "..");

const config = {
  port: Number(process.env.PORT || 3000),
  appRoot: APP_ROOT,
  publicRoot: APP_ROOT,
  dataDir: path.join(APP_ROOT, "data"),
  storeFile: path.join(APP_ROOT, "data", "store.json"),
  watchNews: {
    cacheKey: "watch:auto:scheduled:v5",
    refreshMs: Number(process.env.WATCH_NEWS_REFRESH_MS || 30 * 60 * 1000),
    windowMs: 24 * 60 * 60 * 1000,
    retentionMs: 7 * 24 * 60 * 60 * 1000,
    minItems: 10,
    maxItems: 20
  },
  agent: {
    provider: process.env.AGENT_PROVIDER || "none",
    openaiApiKey: process.env.OPENAI_API_KEY || ""
  }
};

module.exports = config;
