<?php
$host = "192.168.1.65";
$port = 5439;
$dbname = "siteg";
$user = "siteg";
$password = "siteg";
header('Content-Type: application/json');

function getModulos_sistema($host, $port, $dbname, $user, $password)
{
    $conexion = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }
    $sql = "SELECT * FROM sistemas_siteg order BY estatus desc;";
    $resultado = pg_query($conexion, $sql);


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
echo json_encode(getModulos_sistema($host, $port, $dbname, $user, $password));