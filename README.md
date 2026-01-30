1. Al hacer el git clone es importante que el archivo menu.js dentro de la carpeta de login , se cambie la ruta a: http://localhost:8086/, y en el archivo .gitignore agregar la ruta del menu , para que el archivo js no afecte al menu.js de produccion cuando se haga un push y se haga un merge de la tu rama con el main.
2. En el archivo logout.php ubicado en la carpeta auth dentro de login , igual cambiar la ruta y apuntar a la misma direccion: http://localhost:8086/ para que todo se mantenga de manera local y no redirija a el servidor de produccion , y de igual manera agregar al .gitignore para que al hacer un push no haya conflicto de rutas.
3. Una vez que clones tu repositorio debes construir y levantar tu contenedor, con el comando docker compose up --build, y una ves que este levantado en cada carpeta (login,SWAP,TAIN) debes ejecutar los siguientes comandos para instalar la libreria de firebase

# Para el sistema de Login

docker exec -it app_login composer require firebase/php-jwt

# Para el sistema TAIN

docker exec -it app_tain composer require firebase/php-jwt

# Para el sistema SWAP

docker exec -it app_swap composer require firebase/php-jwt

docker exec -it app_login composer require firebase/php-jwt

# Para el sistema TAIN

docker exec -it app_tain composer require firebase/php-jwt

# Para el sistema SWAP

docker exec -it app_swap composer require firebase/php-jwt
Esto para que el token se pueda usar

4. Estos comandos funcionan para que git no cargue menu.js y auth.php para no tener conflicto con las rutas de local host y el servidor real
   git update-index --assume-unchanged apps/login/js/menu.js
   git update-index --assume-unchanged apps/login/auth/logout.php

git add remote <repositorio produccion>

git push produccion main

#despues de esto-----
