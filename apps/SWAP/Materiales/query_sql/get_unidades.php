<?php
require(__DIR__ . '/../../config/conexion.php');
header('Content-Type: application/json');

$conexion = conexion();
if (!$conexion) {
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}

$query = "SELECT nomenclatura_material, descripcion_unidad FROM unidades_materiales ORDER BY nomenclatura_material ASC";
$resultado = pg_query($conexion, $query);

$unidades = [];
while ($fila = pg_fetch_assoc($resultado)) {
    $unidades[] = $fila;
}

echo json_encode($unidades);
pg_close($conexion);