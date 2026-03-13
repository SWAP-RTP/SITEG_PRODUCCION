<?php
require_once __DIR__ . '/../../conf/conexion.php';

function getSistemas_sinteg($host, $port, $dbname, $user, $password){
    $conexion = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }
    $sql = "SELECT id, acronimo, sistema_imagen FROM sistemas_sinteg WHERE estatus = TRUE";
    $resultado = @pg_query($conexion, $sql);


    if (!$resultado) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta SQL"]);
        exit;
    }

    $json = [];
    while ($row = pg_fetch_assoc($resultado)) {
        $json[] = $row;
    }

    pg_close($conexion);

    return $json;

}
echo json_encode(getSistemas_sinteg($host, $port, $dbname, $user, $password));