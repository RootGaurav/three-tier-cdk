import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AlbStack extends cdk.Stack {

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    sg: ec2.SecurityGroup,
    frontendAsg: autoscaling.AutoScalingGroup,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    const alb =
      new elbv2.ApplicationLoadBalancer(
        this,
        'Alb',
        {
          vpc,
          internetFacing:true,
          securityGroup:sg
        }
      );

    const listener =
      alb.addListener(
        'HttpListener',
        {
          port:80,
          open:true
        }
      );

    listener.addTargets(
      'FrontendTarget',
      {
        port:80,
        targets:[frontendAsg]
      }
    );

    new cdk.CfnOutput(
      this,
      'AlbDns',
      {
        value:alb.loadBalancerDnsName
      }
    );
  }
}