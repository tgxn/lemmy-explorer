import { jest } from "@jest/globals";

import InstanceQueue from "../../src/queue/instance";

// Mock bee-queue to avoid redis dependency
const saveMock = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
const setIdMock = jest.fn().mockReturnThis();
const timeoutMock = jest.fn().mockReturnThis();
const onMock = jest.fn().mockReturnThis();

const jobMock = {
  on: onMock,
  timeout: timeoutMock,
  setId: setIdMock,
  save: saveMock,
};

const createJobMock = jest.fn().mockReturnValue(jobMock);

class FakeBeeQueue {
  createJob = createJobMock;
  process = jest.fn();
  on = jest.fn();
  constructor() {}
}

jest.mock("bee-queue", () => {
  return jest.fn().mockImplementation(() => new FakeBeeQueue());
});

describe("InstanceQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createJob trims protocol and passes id correctly", async () => {
    const q = new InstanceQueue(false);
    await q.createJob("https://example.com");

    expect(createJobMock).toHaveBeenCalledWith({ baseUrl: "example.com" });
    expect(setIdMock).toHaveBeenCalledWith("example.com");
    expect(saveMock).toHaveBeenCalled();
  });
});
