FROM php:8.2-apache

# Instalación de extensiones para Postgres
RUN apt-get update && apt-get install -y \ 
    libpq-dev \
    unzip \
    zip \
    git \
    && docker-php-ext-install pdo_pgsql pgsql

RUN apt-get install -y libzip-dev \
    && docker-php-ext-install zip

    #INSTALACIÓN DE COMPOSER
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer    

# Habilitar reescritura de URLs
RUN a2enmod rewrite

# Obliga a Apache a cargar el login directamente
RUN echo "DirectoryIndex index.html index.php login.html" >> /etc/apache2/apache2.conf

# PERMITIR PHP EN .HTML: 
# Por si tu login aún es .html pero quieres meterle código PHP
RUN echo 'AddType application/x-httpd-php .php .html' > /etc/apache2/conf-available/php-html.conf \
    && a2enconf php-html

WORKDIR /var/www/html