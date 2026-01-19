import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface RolesStackProps extends StackProps {
  dataBucket: s3.Bucket;
  environment: string;
}

export class RolesStack extends Stack {
  public readonly dataBucketWriterGroup: iam.Group;
  public readonly dataBucketReaderGroup: iam.Group;

  constructor(scope: Construct, id: string, props: RolesStackProps) {
    super(scope, id, props);

    const { dataBucket, environment } = props;

    // Role for writing to the Data bucket
    const dataBucketWriterRole = new iam.Role(this, "DataBucketWriterRole", {
      roleName: `role-lemmyexplorer-${environment}-data-bucket-writer`,
      assumedBy: new iam.AccountPrincipal(this.account),
      description: "Role for GitHub Actions to upload artifacts to the data bucket",
    });

    dataBucketWriterRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject", "s3:PutObjectAcl"],
        resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`],
      }),
    );

    // Role for reading from the data bucket
    const dataBucketReaderRole = new iam.Role(this, "DataBucketReaderRole", {
      roleName: `role-lemmyexplorer-${environment}-data-bucket-reader`,
      assumedBy: new iam.AccountPrincipal(this.account),
      description: "Role for reading artifacts from the data bucket",
    });

    dataBucketReaderRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:ListBucket"],
        resources: [dataBucket.bucketArn, `${dataBucket.bucketArn}/*`],
      }),
    );
  }
}
