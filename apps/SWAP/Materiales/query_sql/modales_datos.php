<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';


$conexion = Database::conectar();

function obtenerEntradasMateriales($conexion) {
    $sql = "
        SELECT 
            folio_material,
            descripcion_material_entrada
        FROM entradas_materiales
        ORDER BY fecha_registro_entrada DESC
        LIMIT 100
    ";
    $res = pg_query($conexion, $sql);
    if ($res === false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => pg_last_error($conexion)]);
        exit;
    }
    $datos = pg_fetch_all($res) ?: [];
    echo json_encode(['status' => 'ok', 'datos' => $datos]);
}

obtenerEntradasMateriales($conexion);
