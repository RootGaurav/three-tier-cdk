import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamStack extends cdk.Stack {

  public readonly ec2Role: iam.Role;

  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps
  ) {

    super(scope,id,props);

    this.ec2Role = new iam.Role(
      this,
      'Ec2Role',
      {
        assumedBy:
          new iam.ServicePrincipal(
            'ec2.amazonaws.com'
          )
      }
    );

    this.ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonEC2ContainerRegistryReadOnly'
      )
    );

    this.ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonSSMManagedInstanceCore'
      )
    );
  }
}