<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

if (!$conexion) {
    echo json_encode(['status' => 'error', 'message' => 'Error conexión']);
    exit;
}

// Obtener último folio
$sql = "SELECT folio_material 
        FROM control_materiales 
        ORDER BY folio_material DESC 
        LIMIT 1";

$res = pg_query($conexion, $sql);

$ultimo = pg_fetch_assoc($res);

if (!$ultimo) {
    $nuevo = 'MA-00000001';
} else {
    $numero = (int) substr($ultimo['folio_material'], 3);
    $numero++;
    $nuevo = 'MA-' . str_pad($numero, 8, '0', STR_PAD_LEFT);
}

echo json_encode([
    'status' => 'ok',
    'folio' => $nuevo
]);

pg_close($conexion);