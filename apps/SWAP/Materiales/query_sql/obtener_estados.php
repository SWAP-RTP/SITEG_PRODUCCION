<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();
$sql = "SELECT   id_estado_material, 
                 descripcion_estado_material 
        FROM     estados_materiales 
        ORDER BY descripcion_estado_material";
$res = pg_query($conexion, $sql);
$estados = [];
while ($row = pg_fetch_assoc($res)) {
    $estados[] = $row;
}
pg_close($conexion);
echo json_encode($estados);