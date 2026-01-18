import * as s3 from "aws-cdk-lib/aws-s3";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface BuildStackProps extends StackProps {
  environment: string;
}

export class BuildStack extends Stack {
  public readonly buildBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: BuildStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Build Bucket
    this.buildBucket = new s3.Bucket(this, "BuildBucket", {
      bucketName: `s3-${this.account}-usea1-lemmyverse-${environment}-build`.toLowerCase(),
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Policy to deny access to the bucket via unencrypted connections
    this.buildBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [this.buildBucket.bucketArn],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );
  }
}
