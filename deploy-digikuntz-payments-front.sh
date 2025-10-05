#!/bin/bash

# Frontend

# git clone https://github.com/yabain/paymentGateway.git .

cd ~/public_html/payments.digikuntz.com
git pull origin main
/opt/cpanel/ea-nodejs18/bin/npm install -f
ng build --configuration production --output-path=dist
cp -r dist/* ~/public_html/payments.digikuntz.com/