<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();
$sql = "SELECT id_categoria_material, nombre_categoria_material FROM categorias_materiales ORDER BY id_categoria_material ASC";
$res = pg_query($conexion, $sql);
$categorias = [];
while ($row = pg_fetch_assoc($res)) {
    $categorias[] = $row;
}
pg_close($conexion);
echo json_encode($categorias);