<?php
//==================================================================================
//*************función para buscar el nombre por medio de la credencial*************
//==================================================================================
function buscarPersona($conexion, $id) {
    $sql = "SELECT nombre FROM usuarios WHERE trab_credencial = $1 LIMIT 1";
    $result = pg_query_params($conexion, $sql, [$id]);
    $persona = pg_fetch_assoc($result);

    return $persona 
        ? ["success" => true, "nombre" => $persona['nombre']] 
        : ["success" => false, "nombre" => ""];
}