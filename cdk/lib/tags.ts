import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import config from "../config.json";

export interface ResourceTagsConfig {
  stackName: string;
  purpose: "certificate" | "storage" | "access" | "distribution";
  billingCategory: "certificate" | "storage" | "iam" | "cdn";
  service: "acm" | "s3" | "iam" | "cloudfront";
}

const baseTags = {
  Project: "LemmyExplorer",
  Environment: config.environment,
  ManagedBy: "CDK",
};

export function applyTags(construct: Construct, tagsConfig: ResourceTagsConfig): void {
  const { stackName, purpose, billingCategory, service } = tagsConfig;

  const tags = {
    ...baseTags,
    Stack: stackName,
    Purpose: purpose,
    BillingCategory: billingCategory,
    Service: service,
  };

  Object.entries(tags).forEach(([key, value]) => {
    cdk.Tags.of(construct).add(key, value);
  });
}
