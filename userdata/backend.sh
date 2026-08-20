#!/bin/bash

yum update -y

curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -

yum install -y nodejs

cat > /home/ec2-user/server.js <<'EOF'
const http = require('http');

http.createServer((req,res)=>{
 res.writeHead(200);
 res.end('Backend API Running');
}).listen(3000);
EOF

nohup node /home/ec2-user/server.js \
 > /var/log/backend.log 2>&1 &