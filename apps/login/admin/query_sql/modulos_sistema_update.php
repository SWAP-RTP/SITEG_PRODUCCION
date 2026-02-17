<?php
require_once __DIR__ . '/../../conf/conexion.php';

// Recibir datos JSON
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$estatus = $input['estado'] ?? null; // Debe coincidir con el nombre enviado desde JS

if (!$id || !isset($estatus)) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

function updateModulos_sistema($host, $port, $dbname, $user, $password, $id, $estatus)
{
    $conexion = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos"]);
        exit;
    }

    pg_query($conexion, "BEGIN"); // Inicia transacción

    $sql = "UPDATE modulo_sistem SET estatus = $1 WHERE cve_modulo = $2";
    $result = pg_query_params($conexion, $sql, [$estatus, $id]);

    if ($result) {
        pg_query($conexion, "COMMIT");
        echo json_encode(["success" => true]);
    } else {
        pg_query($conexion, "ROLLBACK");
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar"]);
    }
    pg_close($conexion);
}

updateModulos_sistema($host, $port, $dbname, $user, $password, $id, $estatus);