#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib';

import { NetworkStack } from '../lib/network-stack';
import { SecurityStack } from '../lib/security-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { BackendStack } from '../lib/backend-stack';
import { AlbStack } from '../lib/alb-stack';
import { DatabaseStack } from '../lib/database-stack';
import { InternalAlbStack } from '../lib/internal-alb-stack';
import { IamStack } from '../lib/iam-stack';

const app = new cdk.App();

const network =
  new NetworkStack(
    app,
    'NetworkStack'
  );

const iamStack =
  new IamStack(
    app,
    'IamStack'
  );

const security =
  new SecurityStack(
    app,
    'SecurityStack',
    network.vpc
  );



const backend =
  new BackendStack(
    app,
    'BackendStack',
    network.vpc,
    security.backendSg,
    iamStack.ec2Role
  );
 const internalAlb =
  new InternalAlbStack(
    app,
    'InternalAlbStack',
    network.vpc,
    security.internalAlbSg,
    backend.asg
  );

  

 const frontend =
  new FrontendStack(
    app,
    'FrontendStack',
    network.vpc,
    security.frontendSg,
    iamStack.ec2Role,
    internalAlb.dnsName
  );


new AlbStack(
  app,
  'AlbStack',
  network.vpc,
  security.albSg,
  frontend.asg
);

new DatabaseStack(
  app,
  'DatabaseStack',
  network.vpc,
  security.rdsSg
);