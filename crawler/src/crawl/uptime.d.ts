export default class CrawlUptime {
    client: AxiosClient;
    crawl(): Promise<void>;
}
import AxiosClient from "../lib/axios.js";
