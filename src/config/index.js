require("dotenv").config();

const load = (key, defaultValue = null) => {
  if (!process.env[key]) return defaultValue;
  return process.env[key];
};

module.exports.env = load("NODE_ENV", "local");

module.exports.port = load("PORT", 9000);

module.exports.github = {
  baseUrl: load("GITHUB_BASE_URL", "https://api.github.com"),
};

module.exports.confluence = {
  baseUrl: "https://manavbhagwani2000.atlassian.net/",
  clientId: load("CONFLUENCE_CLIENT_ID"),
  clientSecret: load("CONFLUENCE_CLIENT_SECRET"),
};

module.exports.gemini = {
  apiKey: load("GEMINI_API_KEY"),
};
