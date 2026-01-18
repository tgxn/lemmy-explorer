import * as s3 from "aws-cdk-lib/aws-s3";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface DataStackProps extends StackProps {
  environment: string;
}

export class DataStack extends Stack {
  public readonly dataBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // Data Bucket
    this.dataBucket = new s3.Bucket(this, "DataBucket", {
      bucketName: `s3-${this.account}-usea1-lemmyverse-${environment}-data`.toLowerCase(),
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Policy to deny access to the bucket via unencrypted connections
    this.dataBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [this.dataBucket.bucketArn],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );
  }
}
