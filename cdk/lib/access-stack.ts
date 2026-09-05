import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface AccessStackProps extends StackProps {
  dataBucket: s3.Bucket;
  environment: string;
}

export class AccessStack extends Stack {
  public readonly dataBucketWriterGroup: iam.Group;
  public readonly dataBucketReaderGroup: iam.Group;

  constructor(scope: Construct, id: string, props: AccessStackProps) {
    super(scope, id, props);

    const { dataBucket, environment } = props;

    // data bucket policies

    const dataBucketWriterPolicy = new iam.ManagedPolicy(this, "DataBucketWriterPolicy", {
      managedPolicyName: `policy-lemmyexplorer-${environment}-data-bucket-writer`,
      description: "Policy for uploading artifacts to the data bucket",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:PutObject", "s3:PutObjectAcl"],
          resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`],
        }),
      ],
    });

    const dataBucketReaderPolicy = new iam.ManagedPolicy(this, "DataBucketReaderPolicy", {
      managedPolicyName: `policy-lemmyexplorer-${environment}-data-bucket-reader`,
      description: "Policy for reading artifacts from the data bucket",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:GetObject", "s3:ListBucket"],
          resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`],
        }),
      ],
    });

    // data bucket groups

    this.dataBucketWriterGroup = new iam.Group(this, "DataBucketWriterGroup", {
      groupName: `group-lemmyexplorer-${environment}-data-bucket-writer`,
    });
    this.dataBucketWriterGroup.addManagedPolicy(dataBucketWriterPolicy);
    this.dataBucketWriterGroup.addManagedPolicy(dataBucketReaderPolicy);

    this.dataBucketReaderGroup = new iam.Group(this, "DataBucketReaderGroup", {
      groupName: `group-lemmyexplorer-${environment}-data-bucket-reader`,
    });
    this.dataBucketReaderGroup.addManagedPolicy(dataBucketReaderPolicy);
  }
}
