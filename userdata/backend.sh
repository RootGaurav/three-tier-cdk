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
487916111349.dkr.ecr.us-east-1.amazonaws.com/aws-cdk-backend:latest

docker run -d \
--name backend \
-p 3000:3000 \
487916111349.dkr.ecr.us-east-1.amazonaws.com/aws-cdk-backend:latest