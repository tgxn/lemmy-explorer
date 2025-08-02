import http from "node:http";
import { AddressInfo } from "node:net";

import CrawlClient from "../../src/lib/CrawlClient";

describe("CrawlClient keep-alive", () => {
  test("reuses sockets for sequential requests", async () => {
    const connections = new Set<unknown>();
    const server = http.createServer((_req, res) => {
      res.end("ok");
    });
    server.on("connection", (socket) => {
      console.log("New connection established");
      connections.add(socket);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const port = (server.address() as AddressInfo).port;
    const client = new CrawlClient(`http://127.0.0.1:${port}`);

    const res1 = await client.getUrl("/");
    await new Promise((r) => setTimeout(r, 50));
    const res2 = await client.getUrl("/");

    expect(connections.size).toBe(1);

    expect((res1.request as any).reusedSocket).toBe(false);
    expect((res2.request as any).reusedSocket).toBe(true);

    await new Promise((resolve) => server.close(resolve));
  });
});
