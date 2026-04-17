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
        e.folio_material,
        e.descripcion_material_entrada,
        e.cantidad_material_entrada,
        e.adscripcion_modulo,
        e.id_estado_material_entrada,
        cm.id_unidad_material,
        cm.id_categoria_material
    FROM entradas_materiales e
    INNER JOIN control_materiales cm ON e.folio_material = cm.folio_material
    WHERE e.folio_material = $1
    LIMIT 1
";
$res = pg_query_params($conexion, $sql, [$folio]);
$datos = pg_fetch_assoc($res);

echo json_encode(['status' => 'ok', 'datos' => $datos]);
