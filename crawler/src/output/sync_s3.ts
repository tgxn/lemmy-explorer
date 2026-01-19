import { join, resolve } from "node:path";
import { rm, mkdir, readFile, copyFile } from "node:fs/promises";

import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

import { AWS_REGION, PUBLISH_S3_BUCKET, CHECKPOINT_DIR, REDIS_DUMP_FILE } from "../lib/const";
import logging from "../lib/logging";

// upload a copy of the file in REDIS_DUMP_FILE to S3
export async function syncCheckpoint() {
  try {
    const timestamp = Date.now();
    const now = new Date(timestamp);

    // Format date as YYYY-MM-DD
    const dateFolder = now.toISOString().split("T")[0];

    // Create filename with timestamp
    const checkpointName = `checkpoint-${timestamp}.rdb`;
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

    // Upload to date-based folder with timestamp in filename
    const s3Key = `checkpoint/${dateFolder}/dump.${timestamp}.rdb`;

    const input: PutObjectCommandInput = {
      Body: fileData,
      Bucket: PUBLISH_S3_BUCKET,
      Key: s3Key,
      Metadata: {
        checkpoint: checkpointName,
      },
    };
    const command = new PutObjectCommand(input);
    const response = await client.send(command);

    logging.info("syncCheckpoint uploaded to", s3Key);

    // Upload latest.txt with the path to the latest checkpoint
    const latestInput: PutObjectCommandInput = {
      Body: s3Key,
      Bucket: PUBLISH_S3_BUCKET,
      Key: "latest.txt",
      ContentType: "text/plain",
    };
    const latestCommand = new PutObjectCommand(latestInput);
    await client.send(latestCommand);

    logging.info("latest.txt updated with", s3Key);

    // delete checkpointPath
    await rm(checkpointPath, { force: true });

    logging.info("syncCheckpoint success", response);
  } catch (error) {
    logging.error("syncCheckpoint error", error);
  }
}
