<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();

if (!$conexion) {
    echo json_encode(["error" => "No hay conexión"]);
    exit;
}

$sql = "SELECT id_estado_material, descripcion_estado_material FROM estados_materiales ORDER BY descripcion_estado_material ASC";
$res = pg_query($conexion, $sql);

$estados = [];
while ($row = pg_fetch_assoc($res)) {
    $estados[] = [
        'id' => $row['id_estado_material'],
        'nombre' => $row['descripcion_estado_material']
    ];
}
echo json_encode($estados);
