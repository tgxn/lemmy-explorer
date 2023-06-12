import redis from "redis";

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

async function connectIfNeeded() {
  if (!client.isOpen) {
    await client.connect();
  }
}

// data that we scan on other fediverse servers
export async function storeUnknownInstance(baseUrl, data) {
  await connectIfNeeded();
  return await putRedis(`fediverse:${baseUrl}`, JSON.stringify(data));
}

export async function storeOtherError(baseUrl, data) {
  await connectIfNeeded();
  return await putRedis(`error:${baseUrl}`, JSON.stringify(data));
}

export async function putInstanceData(baseUrl, value) {
  await connectIfNeeded();
  return await putRedis(`instance:${baseUrl}`, JSON.stringify(value));
}

export async function putCommunityData(baseUrl, data) {
  await connectIfNeeded();
  return await putRedis(
    `community:${baseUrl}:${data.community.name}`,
    JSON.stringify(data)
  );
}

export async function getInstanceData(key) {
  await connectIfNeeded();
  return await getRedis(`instance:${key}`);
}

export async function getCommunityData(key) {
  await connectIfNeeded();
  return await getRedis(`community:${key}`);
}

export async function listInstanceData() {
  await connectIfNeeded();
  return await listRedis(`instance:*`);
}

export async function listCommunityData() {
  await connectIfNeeded();
  return await listRedis(`community:*`);
}

async function putRedis(key, value) {
  //   console.log(`putRedis: ${key} ${value}`);
  return client.set(key, value);
}

async function getRedis(key) {
  return client.get(key);
}

async function listRedis(key) {
  const keys = await client.keys(key);
  return Promise.all(
    keys.map((key) => {
      return client.get(key);
    })
  );
}
