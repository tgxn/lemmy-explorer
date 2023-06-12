#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { Aspects } from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";

import config from "../config.json";

const app = new cdk.App();

const certStack = new CertStack(app, `LemmyExplorer-Cert-${config.environment}`, {
  env: { region: "us-east-1" },
  crossRegionReferences: true,
});

const frontendStack = new FrontendStack(app, `LemmyExplorer-Frontend-${config.environment}`, {
  env: { region: "ap-southeast-2" },
  cert: certStack.cert,
  crossRegionReferences: true,
});
frontendStack.addDependency(certStack);
