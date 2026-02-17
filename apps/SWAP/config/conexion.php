<?php
$host = "10.10.31.207";
$port = 5435;
$dbname = "sugo-pruebas";
$user = "desarrollo";
$password = "desarrollo1";

function conexion()
{
    global $host, $port, $dbname, $user, $password;
    $conexion = @pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        return false;
    }
    return $conexion;
}