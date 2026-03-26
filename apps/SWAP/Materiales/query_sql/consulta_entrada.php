<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';

function obtenerEntradasMateriales($limite = 20) {
    $conexion = Database::conectar();
   
$sql = "SELECT 
            e.folio_entrada, 
            e.codigo_material, 
            c.descripcion_material, 
            e.cantidad, 
            e.fecha_registro
        FROM entradas_materiales e
        JOIN control_materiales c ON e.codigo_material = c.codigo_material
        ORDER BY e.folio_entrada DESC 
        LIMIT $limite";
    $res = pg_query($conexion, $sql);

    if (!$res) {
        return ['error' => pg_last_error($conexion)];
    }

    $entradas = [];
    while ($row = pg_fetch_assoc($res)) {
        $entradas[] = $row;
    }
    pg_close($conexion);
    return $entradas;
}

echo json_encode(obtenerEntradasMateriales());