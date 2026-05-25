#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════════════════════════
# ⚠  OBLIGATOIRE : modifie ces 4 valeurs avant de lancer ce script
# ⚠  Le mot de passe MySQL app est généré automatiquement et sauvé dans .env
# ═══════════════════════════════════════════════════════════════════════════════
DOMAIN="autoline24.be"
REPO="https://github.com/benidir-mourad/autoline24.git"
APP_DIR="/var/www/autoline24"

MYSQL_ROOT_PASS="CHANGE_MOI_AVANT_DEPLOY"   # mot de passe root MySQL
MYSQL_DB="autoline24"
MYSQL_USER="autoline24"
MYSQL_PASS="$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-32)"  # auto-généré

ADMIN_EMAIL="CHANGE_MOI@autoline24.be"      # email du compte admin
ADMIN_PASS="CHANGE_MOI_ADMIN_PASS"          # mot de passe admin (min. 12 car.)
# ═══════════════════════════════════════════════════════════════════════════════

# Vérifie que les valeurs obligatoires ont bien été changées
if [[ "$MYSQL_ROOT_PASS" == "CHANGE_MOI_AVANT_DEPLOY" || "$ADMIN_PASS" == "CHANGE_MOI_ADMIN_PASS" ]]; then
    echo "ERREUR : modifie MYSQL_ROOT_PASS et ADMIN_PASS en haut du script avant de lancer."
    exit 1
fi

echo "==> Mise à jour du système"
apt-get update -y && apt-get upgrade -y

echo "==> Installation des dépendances de base"
apt-get install -y curl git unzip zip software-properties-common gnupg2 ca-certificates lsb-release ufw openssl

# ── PHP 8.3 ───────────────────────────────────────────────────────────────────
echo "==> Installation de PHP 8.3"
apt-get install -y php8.3 php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring \
    php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl php8.3-sqlite3 \
    php8.3-gd

# ── Composer ──────────────────────────────────────────────────────────────────
echo "==> Installation de Composer"
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ── MySQL ─────────────────────────────────────────────────────────────────────
echo "==> Installation de MySQL"
apt-get install -y mysql-server

systemctl start mysql
systemctl enable mysql

mysql -u root <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DB}\`.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

# ── Node.js 20 ────────────────────────────────────────────────────────────────
echo "==> Installation de Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── Nginx ─────────────────────────────────────────────────────────────────────
echo "==> Installation de Nginx"
apt-get install -y nginx
systemctl enable nginx

# ── Clone du projet ───────────────────────────────────────────────────────────
echo "==> Clone du projet"
mkdir -p "$APP_DIR"
git clone "$REPO" "$APP_DIR"

# ── Backend Laravel ───────────────────────────────────────────────────────────
echo "==> Configuration du backend Laravel"
cd "$APP_DIR/backend"

composer install --no-dev --optimize-autoloader

# Écriture directe du .env de production (pas de sed sur .env.example)
cat > .env <<EOF
APP_NAME=Autoline24
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}

APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr
APP_FAKER_LOCALE=fr_BE

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${MYSQL_DB}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASS}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=${DOMAIN}
SESSION_SECURE_COOKIE=false

FILESYSTEM_DISK=public

BROADCAST_CONNECTION=log
QUEUE_CONNECTION=database
CACHE_STORE=database

MAIL_MAILER=log
MAIL_FROM_ADDRESS="no-reply@${DOMAIN}"
MAIL_FROM_NAME="Autoline24"

SANCTUM_STATEFUL_DOMAINS=${DOMAIN},www.${DOMAIN}
CORS_ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
EOF

php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan optimize

# Création du compte admin
php artisan tinker --execute="
\$existing = App\Models\User::where('email', '${ADMIN_EMAIL}')->first();
if (!\$existing) {
    App\Models\User::create([
        'name'     => 'Admin',
        'email'    => '${ADMIN_EMAIL}',
        'password' => Hash::make('${ADMIN_PASS}'),
        'role'     => 'admin',
    ]);
    echo 'Compte admin créé.' . PHP_EOL;
} else {
    echo 'Compte admin déjà existant.' . PHP_EOL;
}
"

chown -R www-data:www-data "$APP_DIR/backend/storage" "$APP_DIR/backend/bootstrap/cache"
chmod -R 775 "$APP_DIR/backend/storage" "$APP_DIR/backend/bootstrap/cache"

# ── Frontend React ────────────────────────────────────────────────────────────
echo "==> Build du frontend"
cd "$APP_DIR/frontend"

# Le build va dans backend/public/ (défini dans vite.config.js)
echo "VITE_API_URL=https://${DOMAIN}/api" > .env.production

npm ci --omit=dev
npm run build

# ── Nginx ─────────────────────────────────────────────────────────────────────
echo "==> Configuration Nginx"

# Le frontend (React) est buildé dans backend/public/ par Vite.
# Laravel sert l'API (/api/*) et le SPA (catch-all web.php → index.html).
# Une seule root = backend/public, tout passe par index.php (Laravel).
cat > /etc/nginx/sites-available/autoline24 <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${APP_DIR}/backend/public;
    index index.php;

    # Fichiers statiques servis directement ; sinon → Laravel (index.php)
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # PHP → PHP-FPM (Laravel)
    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Bloquer l'accès aux fichiers cachés (.env, .git, etc.)
    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;
}
NGINX

ln -sf /etc/nginx/sites-available/autoline24 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

# ── Firewall ──────────────────────────────────────────────────────────────────
echo "==> Configuration du firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── Résumé ────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Déploiement terminé !"
echo "  Site    : http://${DOMAIN}"
echo "  Admin   : http://${DOMAIN}/admin"
echo "  Email   : ${ADMIN_EMAIL}"
echo ""
echo "  Mot de passe DB (gardez-le) :"
echo "  MYSQL_PASS=${MYSQL_PASS}"
echo ""
echo "  Prochaine étape — activer HTTPS :"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "  Après HTTPS, activer les cookies sécurisés :"
echo "  sed -i 's/SESSION_SECURE_COOKIE=false/SESSION_SECURE_COOKIE=true/' ${APP_DIR}/backend/.env"
echo "  php artisan config:cache"
echo "════════════════════════════════════════════════════════"
