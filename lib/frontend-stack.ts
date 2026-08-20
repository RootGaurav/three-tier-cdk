import * as fs from 'fs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {

  public readonly asg: autoscaling.AutoScalingGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    sg: ec2.SecurityGroup,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    const userData = fs.readFileSync(
      'userdata/frontend.sh',
      'utf8'
    );

    this.asg = new autoscaling.AutoScalingGroup(
      this,
      'FrontendAsg',
      {
        vpc,
        instanceType:new ec2.InstanceType('t3.micro'),
        machineImage:
          ec2.MachineImage.latestAmazonLinux2(),

        minCapacity:2,
        desiredCapacity:2,
        maxCapacity:4,

        securityGroup:sg,

        userData:
          ec2.UserData.custom(userData),

        vpcSubnets:{
          subnetType:
            ec2.SubnetType.PRIVATE_WITH_EGRESS
        }
      }
    );
  }
}