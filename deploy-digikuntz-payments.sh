#!/bin/bash
# git clone https://github.com/yabain/digikuntz-transfert_backend.git .
# git clone https://github.com/yabain/paymentGateway.git .


# Backend
cd ~/public_html/app.digikuntz.com # /home/digikuntz/public_html/app.digikuntz.com en sudo su
git pull origin main
/opt/cpanel/ea-nodejs18/bin/npm install -f
/opt/cpanel/ea-nodejs18/bin/npm run build
pm2 restart digikuntz-backend --update-env # ou /opt/cpanel/ea-nodejs18/bin/pm2 start dist/main.js --name digikuntz-backend si le process n'est pas démarré

# Frontend
cd ~/public_html/payments.digikuntz.com
git pull origin main
/opt/cpanel/ea-nodejs18/bin/npm install -f
ng build --configuration production --output-path=dist
cp -r dist/* ~/public_html/payments.digikuntz.com/