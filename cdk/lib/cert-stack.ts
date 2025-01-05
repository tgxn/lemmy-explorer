import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";

import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

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
