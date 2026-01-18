import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface RolesStackProps extends StackProps {
  buildBucket: s3.Bucket;
}

export class RolesStack extends Stack {
  constructor(scope: Construct, id: string, props: RolesStackProps) {
    super(scope, id, props);

    const { buildBucket } = props;

    // Role for writing to the build bucket
    const buildBucketWriterRole = new iam.Role(this, "BuildBucketWriterRole", {
      roleName: "buildbucketwriter",
      assumedBy: new iam.AccountPrincipal(this.account),
      description: "Role for GitHub Actions to upload artifacts to the build bucket",
    });

    buildBucketWriterRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject", "s3:PutObjectAcl", "s3:GetObject", "s3:ListBucket"],
        resources: [buildBucket.bucketArn, `${buildBucket.bucketArn}/*`],
      }),
    );

    // Role for reading from the build bucket
    const buildBucketReaderRole = new iam.Role(this, "BuildBucketReaderRole", {
      roleName: "buildbucketreader",
      assumedBy: new iam.AccountPrincipal(this.account),
      description: "Role for reading artifacts from the build bucket",
    });

    buildBucketReaderRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:ListBucket"],
        resources: [buildBucket.bucketArn, `${buildBucket.bucketArn}/*`],
      }),
    );
  }
}
