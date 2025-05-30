const path = require("path");
const fs = require("fs");
const unzipper = require("unzipper");
const { exponentialDelay } = require("axios-retry");
const axios = require("axios");

class GithubClient {
  constructor() {
    this.client = axios.create({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      timeout: 10000,
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 429) {
          return exponentialDelay(error);
        }
        return Promise.reject(error);
      }
    );
  }

  async getDiff(url, before, after) {
    const reqData = {
      url: `${url}/compare/${before}...${after}`,
      method: "GET",
    };
    const response = await this.client.request(reqData);
    return response.data.files;
  }

  async getRepo(payload) {
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const branch = payload.ref.split("/").pop();

    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
    const zipPath = path.join(__dirname, `${repo}.zip`);
    const extractPath = path.join(__dirname, "..", "repo");

    const response = await axios({
      url: zipUrl,
      method: "GET",
      responseType: "stream",
      headers: {
        "User-Agent": "webhook-handler",
        Accept: "application/vnd.github+json",
        // Uncomment below and add token if it's a private repo:
        // 'Authorization': `Bearer YOUR_GITHUB_TOKEN`,
      },
    });

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", () => {
          fs.unlinkSync(zipPath); // delete the zip file after extraction
        });
    });
  }
}

module.exports = GithubClient;
