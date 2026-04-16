<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function consultasFolio() {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    $sql = "SELECT folio_material FROM control_materiales ORDER BY id_material DESC LIMIT 1";
    $res = @pg_query($conexion, $sql);
    $row = pg_fetch_assoc($res);

    echo json_encode(['folio_material' => $row['folio_material'] ?? null]);
    pg_close($conexion);
}