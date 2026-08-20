import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

export class InternalAlbStack extends cdk.Stack {

  public readonly dnsName: string;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    sg: ec2.SecurityGroup,
    backendAsg: autoscaling.AutoScalingGroup,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    const alb =
      new elbv2.ApplicationLoadBalancer(
        this,
        'InternalAlb',
        {
          vpc,
          internetFacing:false,
          securityGroup:sg
        }
      );

    const listener =
      alb.addListener(
        'HttpListener',
        {
          port:80,
          protocol:elbv2.ApplicationProtocol.HTTP
        }
      );

    listener.addTargets(
      'BackendTargets',
      {
        port:3000,
        protocol:elbv2.ApplicationProtocol.HTTP,
        targets:[backendAsg],

        healthCheck:{
          path:'/health',
          healthyHttpCodes:'200'
        }
      }
    );

    this.dnsName =
      alb.loadBalancerDnsName;
  }
}