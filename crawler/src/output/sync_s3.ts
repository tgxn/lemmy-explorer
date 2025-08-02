import { join, resolve } from "node:path";
import { rm, mkdir, readFile, copyFile } from "node:fs/promises";

import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

import logging from "../lib/logging";
import { AWS_REGION, PUBLISH_S3_BUCKET, CHECKPOINT_DIR, REDIS_DUMP_FILE } from "../lib/const";

// upload a copy of the file in REDIS_DUMP_FILE to S3
export async function syncCheckpoint() {
  try {
    const checkpointName = `checkpoint-${Date.now()}.rdb`;
    const checkpointPath = join(resolve(CHECKPOINT_DIR), checkpointName);
    logging.info("checkpointPath", checkpointPath);

    // copy the file to a save point
    await mkdir(CHECKPOINT_DIR, { recursive: true });
    await copyFile(REDIS_DUMP_FILE, checkpointPath);

    const fileData = await readFile(checkpointPath);

    // upload to s3
    const client = new S3Client({ region: AWS_REGION });
    if (!PUBLISH_S3_BUCKET) {
      throw new Error("PUBLISH_S3_BUCKET is not defined");
    }

    const input: PutObjectCommandInput = {
      Body: fileData,
      Bucket: PUBLISH_S3_BUCKET,
      Key: "checkpoint/dump.rdb",
      Metadata: {
        checkpoint: checkpointName,
      },
    };
    const command = new PutObjectCommand(input);
    const response = await client.send(command);

    // delete checkpointPath
    await rm(checkpointPath, { force: true });

    logging.info("syncCheckpoint success", response);
  } catch (error) {
    logging.error("syncCheckpoint error", error);
  }
}
