# Guía Completa de Despliegue PUI-POS

## Prerrequisitos del Sistema

### 1. Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker

```bash

# Install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Iniciar y habilitar Docker
sudo systemctl status docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker (opcional)
sudo usermod -aG docker $USER
newgrp
```

### 3. Instalar Node.js (v20 LTS)

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 4. Instalar PM2 globalmente

```bash
sudo npm install -g pm2

# Configurar PM2 para inicio automático
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 5. Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

### 6. Instalar Certbot para SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

```bash
sudo certbot --nginx -d domain
```

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## Configuración de Redis (Docker)

```bash
# Crear y ejecutar contenedor Redis
docker run -d \
  --name my-redis \
  --restart unless-stopped \
  -e REDIS_PASSWORD=pass_123@ \
  -p 6379:6379 \
  redis:7 \
  redis-server --requirepass pass_123@

# Verificar que Redis está funcionando
docker ps | grep redis
docker logs my-redis
```

## Despliegue del Backend (NestJS)

### 1. Preparar el proyecto

```bash
# Navegar al directorio del servidor
cd /var/www/POS/server

# Instalar dependencias
npm install
```

### 2. Variables de entorno (.env)

```bash
# Llena el archivo .env.production
nano .env.production
```

### 3. Build y despliegue

```bash
# Build del proyecto
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Iniciar con PM2
pm2 start npm --name "pui-pos-api" -- run start:prod

# Verificar que está corriendo
pm2 list
pm2 logs pui-pos-api
```

## Despliegue del Frontend (Next.js)

### 1. Preparar el proyecto

```bash
# Navegar al directorio del cliente
cd /var/www/POS/client

# Instalar dependencias
npm install
```

### 2. Variables de entorno (.env)

```bash
# Llena el archivo .env
nano .env
```

### 3. Build y despliegue

```bash
# Build del proyecto
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Iniciar con PM2
pm2 start npm --name "pui-pos.client" -- run start

# Verificar que está corriendo
pm2 list
pm2 logs pui-pos.client
```

## Configuración de Nginx

### 1. Eliminar configuración por defecto

```bash
# Borrar enlace simbólico del sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Opcional: guardar copia de seguridad
sudo mv /etc/nginx/sites-available/default ~/default.bak

sudo ln -s /etc/nginx/sites-available/domain /etc/nginx/sites-enabled/
```

### 2. Crear configuración del sitio

```bash
sudo nano /etc/nginx/sites-available/pui-pos.conf
```

### 3. Contenido de la configuración

```nginx
# Upstreams
upstream pui_pos_front {
    least_conn;
    server 127.0.0.1:3000;  # Next.js (PM2)
}

upstream pui_pos_api {
    least_conn;
    server 127.0.0.1:4000;  # NestJS (PM2)
}

# REDIRECCIÓN HTTP -> HTTPS
server {
    listen 80;
    server_name lubricadora-loja.pui-pos.cloud;
    return 301 https://$host$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name lubricadora-loja.pui-pos.cloud;

    ssl_certificate /etc/letsencrypt/live/lubricadora-loja.pui-pos.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lubricadora-loja.pui-pos.cloud/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # API NestJS (IMPORTANTE: debe ir ANTES que location /)
    location /pui-pos-api/ {
        proxy_pass http://pui_pos_api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_cache_bypass $http_upgrade;

        # Interceptar redirects de la API
        proxy_redirect ~^http://localhost:4000(.*)$ https://lubricadora-loja.pui-pos.cloud/pui-pos-api$1;
        proxy_redirect ~^http://127.0.0.1:4000(.*)$ https://lubricadora-loja.pui-pos.cloud/pui-pos-api$1;
    }

    # Cliente Next.js
    location / {
        proxy_pass http://pui_pos_front;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
        proxy_set_header X-Forwarded-Ssl on;

        # CRÍTICO: Interceptar TODOS los redirects a localhost
        proxy_redirect ~^http://localhost:3000(.*)$ https://lubricadora-loja.pui-pos.cloud$1;
        proxy_redirect ~^http://127.0.0.1:3000(.*)$ https://lubricadora-loja.pui-pos.cloud$1;
        proxy_redirect ~^https://localhost:3000(.*)$ https://lubricadora-loja.pui-pos.cloud$1;
        proxy_redirect ~^https://127.0.0.1:3000(.*)$ https://lubricadora-loja.pui-pos.cloud$1;

        # También interceptar redirects relativos
        proxy_redirect http://localhost/ https://lubricadora-loja.pui-pos.cloud/;
        proxy_redirect https://localhost/ https://lubricadora-loja.pui-pos.cloud/;

        # Headers adicionales para forzar contexto correcto
        proxy_set_header Referer https://lubricadora-loja.pui-pos.cloud$request_uri;
        proxy_set_header Origin https://lubricadora-loja.pui-pos.cloud;

        # Timeouts
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

### 4. Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/pui-pos.conf /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si hay errores, corregirlos antes de continuar
```

## Configuración de SSL con Certbot

### 1. Obtener certificado SSL

```bash
# Generar certificado para el dominio
sudo certbot --nginx -d lubricadora-loja.pui-pos.cloud

# Seguir las instrucciones interactivas
# Elegir opción 2 para redirección automática HTTP -> HTTPS
```

### 2. Configurar renovación automática

```bash
# Verificar que la renovación automática funciona
sudo certbot renew --dry-run

# El crontab debería crearse automáticamente, pero puedes verificarlo:
sudo crontab -l
```

### 3. Recargar Nginx con SSL

```bash
sudo systemctl reload nginx
```

## Verificación Final

### 1. Verificar servicios

```bash
# Ver estado de todos los servicios
sudo systemctl status nginx
docker ps | grep redis
pm2 list

# Ver logs si hay problemas
pm2 logs pui-pos-api
pm2 logs pui-pos.client
sudo tail -f /var/log/nginx/error.log
```

- Borra todo: contenedores, imágenes, volúmenes, redes

```bash
# EJECUTA ESTO SOLO SI ESTÁS SEGURO DE QUERER ELIMINAR TODO
docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker rmi $(docker images -q) -f && docker volume prune -f && docker system prune -a -f
```

### 2. Pruebas de endpoints

```bash
# Test de la API
curl https://lubricadora-loja.pui-pos.cloud/pui-pos-api/health

# Test de NextAuth (debe devolver JSON, NO error 500)
curl https://lubricadora-loja.pui-pos.cloud/api/auth/providers

# Test del frontend
curl -I https://lubricadora-loja.pui-pos.cloud
```

### 3. Verificar certificado SSL

```bash
# Verificar certificado
openssl s_client -connect lubricadora-loja.pui-pos.cloud:443 -servername lubricadora-loja.pui-pos.cloud
```

## Comandos de Mantenimiento

### Reiniciar servicios

```bash
# Reiniciar aplicaciones
pm2 restart all

# Recargar Nginx
sudo systemctl reload nginx

# Reiniciar Redis
docker restart my-redis
```

### Ver logs

```bash
# Logs de aplicaciones
pm2 logs
pm2 logs pui-pos-api
pm2 logs pui-pos.client

#
```
