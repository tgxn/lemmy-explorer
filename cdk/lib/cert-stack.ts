import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

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

export class CertStack extends Stack {
  public cert: acm.Certificate;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // get existing hosted zone and add cname
    const myHostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: config.base_zone,
    });

    this.cert = new acm.Certificate(this, "Certificate", {
      domainName: config.domain,
      validation: acm.CertificateValidation.fromDns(myHostedZone),
    });
  }
}
