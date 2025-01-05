#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { BuildStack } from "../lib/build-stack";

import config from "../config.json";

const app = new cdk.App();

const certStack = new CertStack(app, `LemmyExplorer-Cert-${config.environment}`, {
  env: { region: "us-east-1", account: config.account },
  crossRegionReferences: true,
});

const buildStack = new BuildStack(app, `LemmyExplorer-Build-${config.environment}`, {
  env: { region: "ap-southeast-2", account: config.account },
});

const frontendStack = new FrontendStack(app, `LemmyExplorer-Frontend-${config.environment}`, {
  env: { region: "ap-southeast-2", account: config.account },
  cert: certStack.cert,
  crossRegionReferences: true,
});
frontendStack.addDependency(certStack);
