#!/bin/bash

dnf update -y

dnf install -y docker

systemctl enable docker
systemctl start docker

aws ecr get-login-password \
--region us-east-1 \
| docker login \
--username AWS \
--password-stdin \
487916111349.dkr.ecr.us-east-1.amazonaws.com

docker pull \
487916111349.dkr.ecr.us-east-1.amazonaws.com/aws-cdk-frontend:latest

docker run -d \
--name frontend \
-p 80:80 \
-e API_URL=http://INTERNAL_ALB_DNS \
487916111349.dkr.ecr.us-east-1.amazonaws.com/aws-cdk-frontend:latest