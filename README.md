Avant l'installation, il faut remplacer tous les http://localhost:4200 par les liens du frontend et http://localhost:3000 par les liens du backend



Pour installer sur le serveur depuis la compilation local (car depuis le seveur il y a des problèmes de mémoire cach lors de l'installation: npm error EMFILE: too many open files, open)

# Cloner le projet en local
git clone https://github.com/yabain/digikuntz-transfert_backend.git .

# Ouvrir les fichiers d'environnement et replacer les url
Avant l'installation, il faut remplacer tous les http://localhost:4200 par les liens du frontend et http://localhost:3000

# Installer Angular CLI localement
npm install @angular/cli --save-dev

# Nettoyer le cache npm (optionnel mais recommandé)
npm cache clean --force

# Build localement
npx ng build --configuration production --output-path=dist

# Implémenter le fichier .htaccess et mettre dans le repertoir dist
#---------------------------------------
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} -s [OR]
RewriteCond %{REQUEST_FILENAME} -l [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [NC,L]

RewriteRule ^(.*) /index.html [NC,L]
#---------------------------------------

# Se connecter au serveur et vider le repertoire du frontend
ssh -p 1219 digikuntz@server.gic.cm
cd ~/public_html/payments.digikuntz.com
rm -rf ./*

# Cobier les fichiers du build du repertoire dist sur le serveur au repertoire du front préalablement vidé
scp -P 1219 -r dist/* digikuntz@server.gic.cm:~/public_html/app.digikuntz.com/
