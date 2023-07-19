export default class AxiosClient {
    axios: import("axios").AxiosInstance;
    getUrl(url: any, options?: {}): Promise<import("axios").AxiosResponse<any, any>>;
    getUrlWithRetry(url: any, options?: {}, maxRetries?: number, current?: number): any;
}
