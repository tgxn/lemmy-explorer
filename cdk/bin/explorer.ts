#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { DataStack } from "../lib/data-stack";
import { AccessStack } from "../lib/access-stack";

import config from "../config.json";

const app = new cdk.App();

const certStack = new CertStack(app, `cdk-${config.environment}-LemmyExplorer-Cert`, {
  env: { region: "us-east-1", account: config.account },
  crossRegionReferences: true,
});

const dataStack = new DataStack(app, `cdk-${config.environment}-LemmyExplorer-Data`, {
  env: { region: "us-east-1", account: config.account },
  environment: config.environment,
});

const accessStack = new AccessStack(app, `cdk-${config.environment}-LemmyExplorer-Access`, {
  env: { region: "us-east-1", account: config.account },
  dataBucket: dataStack.dataBucket,
  environment: config.environment,
});

accessStack.addDependency(dataStack);

const frontendStack = new FrontendStack(app, `cdk-${config.environment}-LemmyExplorer-Frontend`, {
  env: { region: "us-east-1", account: config.account },
  cert: certStack.cert,
  environment: config.environment,
});

frontendStack.addDependency(certStack);
