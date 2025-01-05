import * as s3 from "aws-cdk-lib/aws-s3";

import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class BuildStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Build Bucket
    const buildBucket = new s3.Bucket(this, "BuildBucket", {
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Policy to deny access to the bucket via unencrypted connections
    buildBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [buildBucket.bucketArn],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );
  }
}
