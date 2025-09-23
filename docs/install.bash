#!/bin/bash

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar que el script se ejecute como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

# Cargar variables de configuración
if [[ ! -f "deploy-config.txt" ]]; then
    error "Archivo 'deploy-config.txt' no encontrado. Por favor créalo con las variables necesarias."
fi

log "Cargando configuración desde deploy-config.txt..."
source deploy-config.txt

# Verificar variables requeridas
required_vars=("DOMAIN" "DB_URL" "JWT_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "NEXTAUTH_SECRET" "REDIS_PASSWORD")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        error "Variable requerida '$var' no está definida en deploy-config.txt"
    fi
done

log "=== INICIANDO DESPLIEGUE AUTOMÁTICO ==="
log "Dominio: $DOMAIN"
log "Directorio del proyecto: ${PROJECT_DIR:-/var/www/POS}"

# 1. ACTUALIZAR SISTEMA
log "1. Actualizando sistema..."
apt update && apt upgrade -y

# 2. INSTALAR DEPENDENCIAS
log "2. Instalando dependencias del sistema..."

# Docker
if ! command -v docker &> /dev/null; then
    log "Instalando Docker..."
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    usermod -aG docker $SUDO_USER
else
    log "Docker ya está instalado"
fi

# Node.js
if ! command -v node &> /dev/null; then
    log "Instalando Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    log "Node.js ya está instalado"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log "Instalando PM2..."
    npm install -g pm2
else
    log "PM2 ya está instalado"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    log "Instalando Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    log "Nginx ya está instalado"
fi

# Certbot
if ! command -v certbot &> /dev/null; then
    log "Instalando Certbot..."
    apt install -y certbot python3-certbot-nginx
else
    log "Certbot ya está instalado"
fi

# 3. CONFIGURAR REDIS
log "3. Configurando Redis con Docker..."
if ! docker ps | grep -q "my-redis"; then
    log "Creando contenedor Redis..."
    docker run -d \
        --name my-redis \
        --restart unless-stopped \
        -e REDIS_PASSWORD="$REDIS_PASSWORD" \
        -p 6379:6379 \
        redis:7 \
        redis-server --requirepass "$REDIS_PASSWORD"
else
    log "Redis ya está corriendo"
fi

# 4. PREPARAR DIRECTORIOS
PROJECT_DIR=${PROJECT_DIR:-/var/www/POS}
log "4. Preparando directorios del proyecto en $PROJECT_DIR..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Si los directorios no existen, asumir que necesitamos clonar o copiar el proyecto
if [[ ! -d "$PROJECT_DIR/server" ]] || [[ ! -d "$PROJECT_DIR/client" ]]; then
    warning "Directorios del proyecto no encontrados."
    info "Por favor, asegúrate de que el código esté en:"
    info "  - $PROJECT_DIR/server (NestJS)"
    info "  - $PROJECT_DIR/client (Next.js)"
    info "O modifica la variable PROJECT_DIR en deploy-config.txt"
    read -p "¿Deseas continuar? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Despliegue cancelado por el usuario"
    fi
fi

# 5. CONFIGURAR BACKEND
if [[ -d "$PROJECT_DIR/server" ]]; then
    log "5. Configurando Backend (NestJS)..."
    cd "$PROJECT_DIR/server"
    
    # Instalar dependencias
    log "Instalando dependencias del backend..."
    npm install
    
    # Crear archivo .env
    log "Creando archivo .env para el backend..."
    cat > .env << EOF
NODE_ENV=production
PORT=4000

# Base de datos
DATABASE_URL="$DB_URL"

# JWT
JWT_SECRET="$JWT_SECRET"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# CORS
FRONTEND_URL=https://$DOMAIN

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
EOF

    # Build
    log "Construyendo backend..."
    NODE_OPTIONS="--max-old-space-size=2048" npm run build
    
    # Detener proceso anterior si existe
    pm2 delete pui-pos-api 2>/dev/null || true
    
    # Iniciar con PM2
    log "Iniciando backend con PM2..."
    pm2 start npm --name "pui-pos-api" -- run start:prod
    
else
    warning "Directorio del servidor no encontrado, saltando configuración del backend"
fi

# 6. CONFIGURAR FRONTEND
if [[ -d "$PROJECT_DIR/client" ]]; then
    log "6. Configurando Frontend (Next.js)..."
    cd "$PROJECT_DIR/client"
    
    # Instalar dependencias
    log "Instalando dependencias del frontend..."
    npm install
    
    # Crear archivo .env
    log "Creando archivo .env para el frontend..."
    cat > .env << EOF
NODE_ENV=production

# NextAuth - CRÍTICO para solucionar UntrustedHost
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
AUTH_TRUST_HOST=true
NEXTAUTH_URL_INTERNAL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# URLs de API
NEXT_PUBLIC_API_URL=https://$DOMAIN/pui-pos-api
API_URL=https://$DOMAIN/pui-pos-api

# Otras configuraciones
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL_PERSON=${API_URL_PERSON:-https://apipersonas.softecsa.com/api}
NEXT_PUBLIC_API_BEARER_TOKEN_PERSON=${API_BEARER_TOKEN_PERSON:-}
EOF
    
    # Verificar y agregar trustHost al auth.ts
    log "Verificando configuración de auth.ts..."
    if [[ -f "src/auth.ts" ]]; then
        if ! grep -q "trustHost: true" src/auth.ts; then
            warning "Agregando trustHost: true a auth.ts..."
            # Crear backup
            cp src/auth.ts src/auth.ts.backup
            # Agregar trustHost después de la línea de NextAuth
            sed -i '/export const { handlers, signIn, signOut, auth } = NextAuth({/a\\ttrusHost: true,' src/auth.ts
        fi
    else
        warning "Archivo auth.ts no encontrado en src/auth.ts"
    fi
    
    # Build
    log "Construyendo frontend..."
    NODE_OPTIONS="--max-old-space-size=2048" npm run build
    
    # Detener proceso anterior si existe
    pm2 delete pui-pos.client 2>/dev/null || true
    
    # Iniciar con PM2
    log "Iniciando frontend con PM2..."
    pm2 start npm --name "pui-pos.client" -- run start
    
else
    warning "Directorio del cliente no encontrado, saltando configuración del frontend"
fi

# 7. CONFIGURAR NGINX
log "7. Configurando Nginx..."

# Eliminar configuración por defecto
rm -f /etc/nginx/sites-enabled/default
mv /etc/nginx/sites-available/default /root/default.bak 2>/dev/null || true

# Crear configuración del sitio
log "Creando configuración de Nginx..."
cat > /etc/nginx/sites-available/pui-pos.conf << EOF
# Upstreams
upstream pui_pos_front {
    least_conn;
    server 127.0.0.1:3000;
}

upstream pui_pos_api {
    least_conn;
    server 127.0.0.1:4000;
}

# REDIRECCIÓN HTTP -> HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # API NestJS
    location /pui-pos-api/ {
        proxy_pass http://pui_pos_api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_redirect ~^http://localhost:4000(.*)\$ https://$DOMAIN/pui-pos-api\$1;
        proxy_redirect ~^http://127.0.0.1:4000(.*)\$ https://$DOMAIN/pui-pos-api\$1;
    }
    
    # Cliente Next.js
    location / {
        proxy_pass http://pui_pos_front;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port 443;
        proxy_set_header X-Forwarded-Ssl on;
        
        proxy_redirect ~^http://localhost:3000(.*)\$ https://$DOMAIN\$1;
        proxy_redirect ~^http://127.0.0.1:3000(.*)\$ https://$DOMAIN\$1;
        proxy_redirect ~^https://localhost:3000(.*)\$ https://$DOMAIN\$1;
        proxy_redirect ~^https://127.0.0.1:3000(.*)\$ https://$DOMAIN\$1;
        
        proxy_redirect http://localhost/ https://$DOMAIN/;
        proxy_redirect https://localhost/ https://$DOMAIN/;
        
        proxy_set_header Referer https://$DOMAIN\$request_uri;
        proxy_set_header Origin https://$DOMAIN;
        
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/pui-pos.conf /etc/nginx/sites-enabled/

# Verificar configuración
if nginx -t; then
    log "Configuración de Nginx válida"
else
    error "Error en la configuración de Nginx"
fi

# 8. CONFIGURAR SSL
log "8. Configurando certificado SSL..."
if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
    log "Obteniendo certificado SSL para $DOMAIN..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "${SSL_EMAIL:-admin@$DOMAIN}"
else
    log "Certificado SSL ya existe para $DOMAIN"
fi

# Recargar Nginx
systemctl reload nginx

# 9. CONFIGURAR PM2 STARTUP
log "9. Configurando PM2 para inicio automático..."
pm2 save
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# 10. VERIFICACIONES FINALES
log "10. Realizando verificaciones finales..."

# Verificar servicios
log "Verificando servicios..."
systemctl is-active --quiet nginx && log "✓ Nginx está corriendo" || error "✗ Nginx no está corriendo"
docker ps | grep -q my-redis && log "✓ Redis está corriendo" || error "✗ Redis no está corriendo"

# Verificar procesos PM2
if pm2 list | grep -q "pui-pos-api.*online"; then
    log "✓ Backend está corriendo"
else
    warning "✗ Backend no está corriendo correctamente"
fi

if pm2 list | grep -q "pui-pos.client.*online"; then
    log "✓ Frontend está corriendo"
else
    warning "✗ Frontend no está corriendo correctamente"
fi

# Test de endpoints
log "Probando endpoints..."
sleep 5  # Esperar a que los servicios se estabilicen

if curl -sf "https://$DOMAIN/api/auth/providers" > /dev/null; then
    log "✓ NextAuth está funcionando correctamente"
else
    warning "✗ NextAuth puede tener problemas - revisar logs: pm2 logs pui-pos.client"
fi

if curl -sf "https://$DOMAIN" > /dev/null; then
    log "✓ Frontend accesible"
else
    warning "✗ Frontend puede tener problemas"
fi

# RESUMEN FINAL
log "=== DESPLIEGUE COMPLETADO ==="
log "🚀 Tu aplicación está disponible en: https://$DOMAIN"
log ""
log "📋 Comandos útiles:"
log "  - Ver estado de servicios: pm2 status"
log "  - Ver logs del backend: pm2 logs pui-pos-api"
log "  - Ver logs del frontend: pm2 logs pui-pos.client"
log "  - Reiniciar servicios: pm2 restart all"
log "  - Ver logs de Nginx: sudo tail -f /var/log/nginx/error.log"
log ""
log "🔧 Si hay problemas:"
log "  1. Revisa los logs con los comandos de arriba"
log "  2. Verifica que todas las variables en deploy-config.txt sean correctas"
log "  3. Asegúrate de que el DNS apunte correctamente a este servidor"
log ""
log "✅ ¡Despliegue finalizado exitosamente!"