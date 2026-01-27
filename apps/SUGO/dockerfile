# Usar una imagen de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo (Puede ser cualquiera)
WORKDIR /opt/app

# Copiar los archivos de tu proyecto al directorio de trabajo
COPY . .

# Instalar las dependencias
RUN npm install

# Exponer el puerto en el que se ejecutará la aplicación (puerto Vite)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"]