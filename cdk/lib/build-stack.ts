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
