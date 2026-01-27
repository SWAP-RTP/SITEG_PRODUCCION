## Compartir imagen Docker

- Se creo los archivos [dockerfile](dockerfile) y [.dockerignore](.dockerignore) 
- Para crear la imagen ejecutar en la consola 
  `docker build -t nombre-de-tu-imagen:tag .` 
  |  `docker build -t sugo_front:1.1.2 .`
  | Solo cambiar el tag en el docker-compose.yml
- Para correr el contenedor ejecutar usar docker-compose o lo siguiente:
  `docker run -p [XXXX]:[3000 coincidir con .env] -d nombre-de-tu-imagen` | 
  `docker run -p 3010:3000 -d sugo_back`
- FIN

