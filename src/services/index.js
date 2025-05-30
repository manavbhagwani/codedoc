const githubClient = require("../clients/github").get();
const confluenceClient = require("../clients/confluence").get();
const gemini = require("../gemini");

module.exports = {
  async handleMergeWebhook(payload) {
    await githubClient.getRepo(payload);
    console.log("Success: Repo pulled");
    const newDoc = await gemini();
    console.log("Success: Documentation generated");
    const oldDoc = await confluenceClient.getPage("262147");
    await confluenceClient.updatePage(
      oldDoc.id,
      oldDoc.version.number + 1,
      oldDoc.title,
      newDoc
    );
    console.log("Success: Documentation updated");
    return "success";
  },
};
