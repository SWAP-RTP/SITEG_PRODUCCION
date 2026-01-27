<?php
$localhost = 'db_swap'; // o '127.0.0.1' si estás fuera del contenedor

function conecta(&$conexion, $localhost)
{
    $conexion = @pg_connect("host=$localhost port=5432 dbname=prueba_swap user=prueba_swap password=prueba_swap");

    if ($conexion)
        return 1;
    else
        return 0;
}
?>