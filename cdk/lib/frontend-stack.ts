import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";

import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NagSuppressions } from "cdk-nag";

import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  CacheCookieBehavior,
  CacheHeaderBehavior,
  CachePolicy,
  CacheQueryStringBehavior,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  OriginAccessIdentity,
  AllowedMethods,
  BehaviorOptions,
  Distribution,
} from "aws-cdk-lib/aws-cloudfront";
import {
  OAuthScope,
  CfnUserPoolIdentityProvider,
  UserPoolClient,
  IUserPoolClient,
  UserPoolClientIdentityProvider,
  UserPool,
  IUserPool,
  UserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import { ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

import { WebSocketApi } from "@aws-cdk/aws-apigatewayv2-alpha";

import { AuthLambdas, CloudFrontAuth } from "@henrist/cdk-cloudfront-auth";

import config from "../config.json";

type FrontendStackProps = StackProps & {
  cert: acm.Certificate;
};

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // CloudFront Origin Access Identity
    const cloudfrontOAI = new OriginAccessIdentity(this, "cloudfront-OAI", {
      comment: `OAI for ${id}`,
    });

    // Content Bucket
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production use
      autoDeleteObjects: true, // NOT recommended for production use
    });

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

    // Grant access to cloudfront
    siteBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [siteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId),
        ],
      }),
    );
    new CfnOutput(this, "Bucket", { value: siteBucket.bucketName });

    const bucketOrigin = new origins.S3Origin(siteBucket, {
      originAccessIdentity: cloudfrontOAI,
    });

    const distribution = new Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: bucketOrigin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        compress: true,
      },

      // domain name config
      domainNames: [config.domain],
      certificate: props.cert,

      defaultRootObject: "index.html",
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      geoRestriction: cloudfront.GeoRestriction.allowlist("AU", "NZ", "TH"),

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

    new route53.AaaaRecord(this, "Alias", {
      zone: route53.HostedZone.fromLookup(this, "Zone", { domainName: config.base_zone }),
      recordName: config.domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // create route53 cname alias
    // const cname = new route53.CnameRecord(this, "SiteAliasRecord", {
    //   zone: route53.HostedZone.fromLookup(this, "Zone", { domainName: config.base_zone }),
    //   recordName: config.domain,
    //   domainName: distribution.distributionDomainName,
    // });

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
    });
  }
}
