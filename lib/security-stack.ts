import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SecurityStack extends cdk.Stack {

  public readonly albSg: ec2.SecurityGroup;
  public readonly frontendSg: ec2.SecurityGroup;
  public readonly backendSg: ec2.SecurityGroup;
  public readonly rdsSg: ec2.SecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    this.albSg = new ec2.SecurityGroup(
      this,
      'AlbSg',
      { vpc }
    );

    this.frontendSg = new ec2.SecurityGroup(
      this,
      'FrontendSg',
      { vpc }
    );

    this.backendSg = new ec2.SecurityGroup(
      this,
      'BackendSg',
      { vpc }
    );

    this.rdsSg = new ec2.SecurityGroup(
      this,
      'RdsSg',
      { vpc }
    );

    this.albSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80)
    );

    this.frontendSg.addIngressRule(
      this.albSg,
      ec2.Port.tcp(80)
    );

    this.backendSg.addIngressRule(
      this.frontendSg,
      ec2.Port.tcp(3000)
    );

    this.rdsSg.addIngressRule(
      this.backendSg,
      ec2.Port.tcp(3306)
    );
  }
}