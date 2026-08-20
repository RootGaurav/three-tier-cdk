import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {

    constructor(
        scope: Construct,
        id: string,
        vpc: ec2.Vpc,
        sg: ec2.SecurityGroup,
        props?: cdk.StackProps
    ) {

        super(scope, id, props);

        new rds.DatabaseInstance(
            this,
            'MysqlDb',
            {
                engine: rds.DatabaseInstanceEngine.mysql({
                    version: rds.MysqlEngineVersion.VER_8_4_6
                }),

                instanceType:
                    ec2.InstanceType.of(
                        ec2.InstanceClass.T3,
                        ec2.InstanceSize.MICRO
                    ),

                vpc,

                securityGroups: [sg],

                allocatedStorage: 20,

                credentials:
                    rds.Credentials.fromGeneratedSecret(
                        'admin'
                    ),

                databaseName: 'appdb',

                publiclyAccessible: false
            }
        );
    }
}