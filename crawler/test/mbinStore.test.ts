import MBinStore from "../src/lib/storage/mbin";

const listRedisWithKeysMock = jest.fn();

const storageMock = {
  listRedisWithKeys: listRedisWithKeysMock,
};

const store = new MBinStore(storageMock as any);

describe("MBinStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listRedisWithKeysMock.mockResolvedValue({
      "mbin_magazine:example.com:foo": { name: "foo" },
    });
  });

  test("getAll adds baseurl to records", async () => {
    const result = await store.getAll();
    expect(listRedisWithKeysMock).toHaveBeenCalledWith("mbin_magazine:*");
    expect(result).toEqual([{ name: "foo", baseurl: "example.com" }]);
  });
});
