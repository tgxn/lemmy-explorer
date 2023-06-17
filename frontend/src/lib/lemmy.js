import { LemmyHttp } from "lemmy-js-client";
// let client: LemmyWebsocket = new LemmyWebsocket();

// let form: Login = {
//   username_or_email: "my_email@email.tld",
//   password: "my_pass",
// };

// this.ws.send(client.login(form));

class LemmyAPI {
  constructor() {
    // this.baseUrl = baseUrl;
    // this.client = new LemmyHttp(baseUrl, headers);
    // this.jwt = null;
  }

  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    const headers = {};
    this.client = new LemmyHttp(baseUrl, headers);
    this.jwt = null;
  }

  async login(username, password) {
    let loginForm = {
      username_or_email: username,
      password: password,
    };

    let jwt = await this.client.login(loginForm).jwt;
    console.log(this.baseUrl, "lemmy jwt: ", jwt);

    this.jwt = jwt;
  }

  async getUserDetails() {
    const comm = await this.client.listCommunities({ auth: this.jwt });
    console.log(this.baseUrl, "communities: ", comm);
  }

  async getSite() {
    return await this.client.site();
  }

  async getSubscriptions() {
    return await this.client.subscriptions();
  }

  async getCommunities() {
    return await this.client.communities();
  }
}

const lemmyApi = new LemmyAPI();
export default lemmyApi;
