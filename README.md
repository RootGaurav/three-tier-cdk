# AWS CDK Three-Tier Application with GitHub Actions CI/CD

## Overview

This project demonstrates a production-style three-tier architecture on AWS using Infrastructure as Code (IaC) with AWS CDK and automated deployments using GitHub Actions.

The application consists of:

- Frontend (Nginx Docker Container)
- Backend (Node.js Docker Container)
- Database (Amazon RDS MySQL)

The infrastructure is deployed using AWS CDK (TypeScript), while application updates are delivered independently through GitHub Actions without requiring infrastructure redeployment.

---

# Architecture

```text
                    Internet
                        │
                        ▼
                Public Application
                 Load Balancer
                        │
                        ▼
               Frontend Auto Scaling Group
                (Nginx Docker Container)
                        │
                        ▼
                 Internal Application
                  Load Balancer
                        │
                        ▼
               Backend Auto Scaling Group
                (Node.js Docker Container)
                        │
                        ▼
                  Amazon RDS MySQL
```

---

# Infrastructure Components

## Networking

### VPC

Custom VPC created through AWS CDK.

### Public Subnets

Used for:

- Public ALB
- NAT Gateway

### Private Subnets

Used for:

- Frontend EC2 Instances
- Backend EC2 Instances

### Isolated Database Subnets

Used for:

- Amazon RDS MySQL

No internet access is allowed from database subnets.

---

# Security Design

## Public ALB Security Group

Allows:

```text
80   from 0.0.0.0/0
443  from 0.0.0.0/0
```

---

## Frontend Security Group

Allows:

```text
80 from Public ALB SG
```

Frontend instances cannot be accessed directly from the internet.

---

## Internal ALB Security Group

Allows:

```text
80 from Frontend SG
```

Only frontend instances can reach the internal load balancer.

---

## Backend Security Group

Allows:

```text
3000 from Internal ALB SG
```

Backend instances cannot be accessed directly.

---

## Database Security Group

Allows:

```text
3306 from Backend SG
```

Only backend instances can access MySQL.

---

# Application Flow

## User Request

```text
Browser
   │
   ▼
Public ALB
   │
   ▼
Frontend Container
```

---

## API Request

```text
Browser
   │
   ▼
Public ALB
   │
   ▼
Frontend Container
   │
   ▼
Internal ALB
   │
   ▼
Backend Container
   │
   ▼
MySQL Database
```

---

# Technology Stack

## Infrastructure

- AWS CDK
- TypeScript
- CloudFormation

## Compute

- EC2
- Auto Scaling Groups

## Networking

- VPC
- ALB
- Internal ALB
- NAT Gateway

## Containers

- Docker
- Amazon ECR

## Database

- Amazon RDS MySQL 8.4.6

## CI/CD

- GitHub Actions
- GitHub OIDC
- IAM Roles

---

# Repository Structure

```text
aws-cdk-gitaction-infra
│
├── backend
│   ├── Dockerfile
│   └── server.js
│
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   └── default.conf.template
│
├── userdata
│   ├── frontend.sh
│   └── backend.sh
│
├── lib
│   ├── network-stack.ts
│   ├── security-stack.ts
│   ├── iam-stack.ts
│   ├── frontend-stack.ts
│   ├── backend-stack.ts
│   ├── alb-stack.ts
│   ├── internal-alb-stack.ts
│   └── database-stack.ts
│
├── bin
│   └── aws-cdk-gitaction-infra.ts
│
└── .github
    └── workflows
        ├── deploy.yml
        ├── frontend-deploy.yml
        └── backend-deploy.yml
```

---

# Why Three Separate GitHub Actions Workflows?

The project intentionally separates infrastructure deployment from application deployment.

---

## Workflow 1: Infrastructure Deployment

File:

```text
.github/workflows/deploy.yml
```

Purpose:

Deploy infrastructure using AWS CDK.

Triggered when:

```text
master
```

branch receives changes.

### Responsibilities

- Build CDK project
- Synthesize CloudFormation
- Deploy AWS resources

Resources deployed:

- VPC
- Subnets
- NAT Gateway
- Security Groups
- IAM Roles
- Public ALB
- Internal ALB
- Frontend ASG
- Backend ASG
- RDS

Flow:

```text
Git Push
   │
   ▼
GitHub Actions
   │
   ▼
CDK Synth
   │
   ▼
CDK Deploy
   │
   ▼
AWS Infrastructure
```

---

## Workflow 2: Frontend Deployment

File:

```text
.github/workflows/frontend-deploy.yml
```

Triggered on:

```text
frontend
```

branch.

Purpose:

Deploy frontend application updates.

Flow:

```text
Frontend Code Change
         │
         ▼
Build Docker Image
         │
         ▼
Push Image To ECR
         │
         ▼
Instance Refresh
         │
         ▼
New Frontend Instances
         │
         ▼
Pull Latest Image
```

Infrastructure is not redeployed.

Only frontend containers are updated.

---

## Workflow 3: Backend Deployment

File:

```text
.github/workflows/backend-deploy.yml
```

Triggered on:

```text
backend
```

branch.

Purpose:

Deploy backend application updates.

Flow:

```text
Backend Code Change
         │
         ▼
Build Docker Image
         │
         ▼
Push Image To ECR
         │
         ▼
Instance Refresh
         │
         ▼
New Backend Instances
         │
         ▼
Pull Latest Image
```

Infrastructure is not redeployed.

Only backend containers are updated.

---

# CI/CD Flow

```text
                     GitHub
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼

  deploy-infra      frontend         backend
     branch          branch           branch

      │                 │                 │

      ▼                 ▼                 ▼

  CDK Deploy      Docker Build      Docker Build

      │                 │                 │

      ▼                 ▼                 ▼

 AWS Resources     Push To ECR      Push To ECR

                        │                 │

                        ▼                 ▼

                 Frontend ASG      Backend ASG
                  Refresh           Refresh

                        │                 │

                        ▼                 ▼

                 Pull Latest       Pull Latest
                    Image             Image
```

---

# Amazon ECR Repositories

Frontend:

```text
aws-cdk-frontend
```

Backend:

```text
aws-cdk-backend
```

Used to store Docker images.

---

# IAM and OIDC Authentication

The project uses GitHub OpenID Connect (OIDC).

No AWS Access Keys are stored in GitHub Secrets.

Authentication flow:

```text
GitHub Actions
        │
        ▼
OIDC Token
        │
        ▼
AWS IAM Role
        │
        ▼
Temporary Credentials
```

Benefits:

- More secure
- No long-lived credentials
- AWS recommended approach

---

# Auto Scaling Strategy

Frontend ASG:

```text
Minimum Capacity: 2
Desired Capacity: 2
Maximum Capacity: 4
```

Backend ASG:

```text
Minimum Capacity: 2
Desired Capacity: 2
Maximum Capacity: 4
```

Benefits:

- High Availability
- Fault Tolerance
- Rolling Updates

---

# Deployment Process

## Install Dependencies

```bash
npm install
```

---

## Bootstrap CDK

```bash
cdk bootstrap
```

---

## Build Project

```bash
npm run build
```

---

## Synthesize CloudFormation

```bash
cdk synth
```

---

## Deploy Infrastructure

```bash
cdk deploy --all
```

---

# Validation

## Verify EC2 Instances

```bash
aws ec2 describe-instances
```

---

## Verify Auto Scaling Groups

```bash
aws autoscaling describe-auto-scaling-groups
```

---

## Verify Load Balancers

```bash
aws elbv2 describe-load-balancers
```

---

## Verify Containers

```bash
docker ps
```

---

## Verify Backend Health

```bash
curl localhost:3000/health
```

Expected:

```text
OK
```

---

# Key DevOps Concepts Demonstrated

- Infrastructure as Code (IaC)
- AWS CDK
- TypeScript
- Docker
- Amazon ECR
- Auto Scaling Groups
- Load Balancers
- Internal Load Balancers
- RDS MySQL
- GitHub Actions
- OIDC Authentication
- CI/CD Pipelines
- AWS Networking
- Security Group Design
- Three-Tier Architecture

---

# Future Enhancements

- HTTPS using ACM
- Route53 Domain Integration
- AWS WAF
- CloudWatch Dashboards
- Secrets Manager Integration
- ECS Migration
- Blue/Green Deployments
- Multi-Environment Deployments (Dev/UAT/Prod)
- Terraform Equivalent Implementation