#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { BuildStack } from "../lib/build-stack";
import { RolesStack } from "../lib/roles-stack";

import config from "../config.json";

const app = new cdk.App();

const certStack = new CertStack(app, `cdk-${config.environment}-LemmyExplorer-Cert`, {
  env: { region: "us-east-1", account: config.account },
  crossRegionReferences: true,
});

const buildStack = new BuildStack(app, `cdk-${config.environment}-LemmyExplorer-Build`, {
  env: { region: "us-east-1", account: config.account },
});

const rolesStack = new RolesStack(app, `cdk-${config.environment}-LemmyExplorer-Roles`, {
  env: { region: "us-east-1", account: config.account },
  buildBucket: buildStack.buildBucket,
});

rolesStack.addDependency(buildStack);

const frontendStack = new FrontendStack(app, `cdk-${config.environment}-LemmyExplorerUS-Frontend`, {
  env: { region: "us-east-1", account: config.account },
  cert: certStack.cert,
});

frontendStack.addDependency(certStack);
