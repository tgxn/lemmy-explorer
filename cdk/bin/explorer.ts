#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { Aspects } from "aws-cdk-lib";

import { FrontendStack } from "../lib/frontend-stack";

import config from "../config.json";

const app = new cdk.App();

const frontendStack = new FrontendStack(app, `LemmyExplorer-${config.environment}-Frontend`, {
  env: { region: "ap-southeast-2", account: "071938183874" },
});
