<?php
require(__DIR__ . '/../../config/conexion.php');

$con = conexion();
if($con) {
    echo "¡CONECTADO CON ÉXITO AL NUEVO SERVIDOR (10.10.31.177)!";
    pg_close($con);
} else {
    echo " ERROR: No se pudo conectar. Revisa la IP, el usuario o la contraseña en conexion.php.";
}
?>