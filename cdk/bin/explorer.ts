#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { DataStack } from "../lib/data-stack";
import { AccessStack } from "../lib/access-stack";
import { applyTags } from "../lib/tags";

import config from "../config.json";

const app = new cdk.App();

const certStackName = `cdk-${config.environment}-LemmyExplorer-Cert`;
const certStack = new CertStack(app, certStackName, {
  env: { region: "us-east-1", account: config.account },
  crossRegionReferences: true,
});
applyTags(certStack, {
  stackName: certStackName,
  purpose: "certificate",
  billingCategory: "certificate",
  service: "acm",
});

const dataStackName = `cdk-${config.environment}-LemmyExplorer-Data`;
const dataStack = new DataStack(app, dataStackName, {
  env: { region: "us-east-1", account: config.account },
  environment: config.environment,
});
applyTags(dataStack, {
  stackName: dataStackName,
  purpose: "storage",
  billingCategory: "storage",
  service: "s3",
});

const accessStackName = `cdk-${config.environment}-LemmyExplorer-Access`;
const accessStack = new AccessStack(app, accessStackName, {
  env: { region: "us-east-1", account: config.account },
  dataBucket: dataStack.dataBucket,
  environment: config.environment,
});
applyTags(accessStack, {
  stackName: accessStackName,
  purpose: "access",
  billingCategory: "iam",
  service: "iam",
});
accessStack.addDependency(dataStack);

const frontendStackName = `cdk-${config.environment}-LemmyExplorer-Frontend`;
const frontendStack = new FrontendStack(app, frontendStackName, {
  env: { region: "us-east-1", account: config.account },
  cert: certStack.cert,
  environment: config.environment,
});
applyTags(frontendStack, {
  stackName: frontendStackName,
  purpose: "distribution",
  billingCategory: "cdn",
  service: "cloudfront",
});
frontendStack.addDependency(certStack);
