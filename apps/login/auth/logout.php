<?php
setcookie("access_token", "", [
    'expires' => time() - 3600,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);

header("Location: http://10.10.30.28:8086/login.html?message=sesion_cerrada");
exit();
