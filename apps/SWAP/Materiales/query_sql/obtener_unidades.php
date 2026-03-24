<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();


$sql = "SELECT id_unidad, descripcion_unidad FROM unidades_materiales ORDER BY descripcion_unidad ASC";
$res = pg_query($conexion, $sql);

$unidades = [];
while ($row = pg_fetch_assoc($res)) {
    $unidades[] = $row;
}

pg_close($conexion);
echo json_encode($unidades);