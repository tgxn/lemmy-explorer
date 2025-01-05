import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";

import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import {
  CachePolicy,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  AllowedMethods,
  Distribution,
} from "aws-cdk-lib/aws-cloudfront";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

import { Size, CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

import config from "../config.json";

type FrontendStackProps = StackProps & {
  cert: acm.Certificate;
};

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // Content Bucket
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production use
      autoDeleteObjects: true, // NOT recommended for production use
    });
    new CfnOutput(this, "Bucket", { value: siteBucket.bucketName });

    // Policy to deny access to the bucket via unencrypted connections
    siteBucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:*"],
        resources: [siteBucket.bucketArn],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      }),
    );

    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket, {
      originAccessLevels: [cloudfront.AccessLevel.READ],
    });

    const distribution = new Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },

      // domain name config
      domainNames: [config.domain],
      certificate: props.cert,

      defaultRootObject: "index.html",
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,

      // error pages
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(0),
        },
      ],
    });

    new route53.ARecord(this, "SiteAliasRecord", {
      zone: route53.HostedZone.fromLookup(this, "Zone", { domainName: config.base_zone }),
      recordName: config.domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new CfnOutput(this, "DistributionURL", {
      value: distribution.distributionDomainName,
    });

    // Upload the pre-compiled frontend static files
    new BucketDeployment(this, `DeployApp-${new Date().toISOString()}`, {
      sources: [Source.asset("../frontend/dist/")],
      destinationBucket: siteBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
      memoryLimit: 1024,
      // useEfs: true,
      prune: true,
      ephemeralStorageSize: Size.mebibytes(1024),
      // retainOnDelete: false,
    });
  }
}
