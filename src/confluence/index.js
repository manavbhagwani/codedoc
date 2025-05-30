const { exponentialDelay } = require("axios-retry");
const axios = require("axios");

class ConfluenceClient {
  constructor(props) {
    this.client = axios.create({
      baseURL: props.host,
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
    this.clientId = props.clientId;
    this.clientSecret = props.clientSecret;
  }

  async getPage(id) {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");
    const reqData = {
      url: `/wiki/rest/api/content/${id}?expand=body.storage,version`,
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        Accept: "application/json",
      },
    };
    const response = await this.client.request(reqData);
    return response.data;
  }

  async updatePage(id, version, title, body) {
    const authString = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");
    const reqData = {
      url: `/wiki/rest/api/content/${id}?expand=body.storage,version`,
      method: "PUT",
      data: {
        type: "page",
        title,
        version: {
          number: version,
        },
        body: {
          storage: {
            value: body,
            representation: "storage",
          },
        },
      },
      headers: {
        Authorization: `Basic ${authString}`,
        Accept: "application/json",
      },
    };
    const response = await this.client.request(reqData);
    return response.data;
  }
}

module.exports = ConfluenceClient;
