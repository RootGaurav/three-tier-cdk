import * as fs from 'fs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {

  public readonly asg: autoscaling.AutoScalingGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    sg: ec2.SecurityGroup,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    const script = fs.readFileSync(
      'userdata/backend.sh',
      'utf8'
    );

    this.asg = new autoscaling.AutoScalingGroup(
      this,
      'BackendAsg',
      {
        vpc,

        instanceType:
          new ec2.InstanceType('t3.micro'),

        machineImage: ec2.MachineImage.latestAmazonLinux2023(),

        minCapacity:2,
        desiredCapacity:2,
        maxCapacity:4,

        securityGroup:sg,

        userData:
          ec2.UserData.custom(script),

        vpcSubnets:{
          subnetType:
            ec2.SubnetType.PRIVATE_WITH_EGRESS
        }
      }
    );
  }
}