<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

$folio = $_GET['folio'] ?? '';

if (!$folio) {
    echo json_encode(['status' => 'error', 'message' => 'Folio requerido']);
    exit;
}

$sql = "
    SELECT 
        cm.folio_material,
        cm.descripcion_material,
        cm.stock_actual,
        cm.id_unidad_material,
        cm.id_categoria_material,
        cm.adscripcion_modulo,

        e.id_estado_material_entrada

    FROM control_materiales cm

    LEFT JOIN LATERAL (
        SELECT id_estado_material_entrada
        FROM entradas_materiales
        WHERE folio_material = cm.folio_material
        ORDER BY fecha_registro_entrada DESC
        LIMIT 1
    ) e ON true

    WHERE cm.folio_material = $1
    LIMIT 1
";

$res = pg_query_params($conexion, $sql, [$folio]);
$datos = pg_fetch_assoc($res);

echo json_encode([
    'status' => 'ok',
    'datos' => $datos
]);