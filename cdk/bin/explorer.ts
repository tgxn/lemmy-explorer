#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";

import { CertStack } from "../lib/cert-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { DataStack } from "../lib/data-stack";
import { RolesStack } from "../lib/roles-stack";

import config from "../config.json";

const app = new cdk.App();

const certStack = new CertStack(app, `cdk-usea1-${config.environment}-LemmyExplorer-Cert`, {
  env: { region: "us-east-1", account: config.account },
  crossRegionReferences: true,
});

const dataStack = new DataStack(app, `cdk-usea1-${config.environment}-LemmyExplorer-Data`, {
  env: { region: "us-east-1", account: config.account },
});

const rolesStack = new RolesStack(app, `cdk-usea1-${config.environment}-LemmyExplorer-Roles`, {
  env: { region: "us-east-1", account: config.account },
  dataBucket: dataStack.dataBucket,
});

rolesStack.addDependency(dataStack);

const frontendStack = new FrontendStack(app, `cdk-${config.environment}-LemmyExplorer-Frontend`, {
  env: { region: "us-east-1", account: config.account },
  cert: certStack.cert,
});

frontendStack.addDependency(certStack);
