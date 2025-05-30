const ConfluenceClient = require("../confluence");
const config = require("../config");

const confluenceClient = new ConfluenceClient({
  host: config.confluence.baseUrl,
  clientId: config.confluence.clientId,
  clientSecret: config.confluence.clientSecret,
});

module.exports = {
  get() {
    return confluenceClient;
  },
};
