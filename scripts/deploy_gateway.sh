#!/bin/bash

echo "🚀 Bắt đầu Deploy Zalo Gateway lên Simon Center (112.78.15.2)..."

# Bước 1: Rsync code lên /tmp của Simon Center
expect -c '
set timeout 300
spawn rsync -avz \
  --exclude ".git" --exclude ".DS_Store" \
  -e "ssh -o StrictHostKeyChecking=no -p 22" \
  "zalo_gateway_php/" \
  ubutu@112.78.15.2:/tmp/zalo_gateway_deploy/
expect "password:"
send "&m5L9\[eUv\r"
expect eof
'

# Bước 2: Chép từ /tmp vào /var/www/zalo-gateway và tạo symlink
expect -c '
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ubutu@112.78.15.2
expect "password:"
send "&m5L9\[eUv\r"
expect "$ "
send "sudo mkdir -p /var/www/zalo-gateway && sudo cp -rf /tmp/zalo_gateway_deploy/* /var/www/zalo-gateway/ && sudo chown -R www-data:www-data /var/www/zalo-gateway && sudo ln -sfn /var/www/zalo-gateway /var/www/crm_phong_kham/zalo-gateway && echo DEPLOY_GATEWAY_OK\r"
expect "password"
send "&m5L9\[eUv\r"
expect "DEPLOY_GATEWAY_OK"
send "exit\r"
expect eof
'

echo "🎉 DEPLOY ZALO GATEWAY THÀNH CÔNG!"
