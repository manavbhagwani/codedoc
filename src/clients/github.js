const GithubClient = require("../github");

const githubClient = new GithubClient();

module.exports = {
  get() {
    return githubClient;
  },
};
