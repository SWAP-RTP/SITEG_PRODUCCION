<?php

require(__DIR__ . '/../../config/conexion.php');

header('Content-Type: application/json; charset=utf-8');

$conexion = conexion();
if ($conexion) { 
    $codigo = isset($_GET['codigo']) ? strtoupper(trim($_GET['codigo'])) : '';

    if (empty($codigo)) {
        echo json_encode(["error" => "Código vacío"]);
        exit;
    }

   
    $sql = "SELECT codigo_material, 
                   descripcion_material, 
                   nomenclatura_material, 
                   ubicacion_fisica_material, 
                   stock_actual 
            FROM control_materiales 
            WHERE codigo_material = $1;";

    $qry = pg_query_params($conexion, $sql, array($codigo));

    if (!$qry) {
        echo json_encode(["error" => "Error de DB", "detalle" => pg_last_error($conexion)]);
        exit;
    }

    $res = pg_fetch_assoc($qry);

    if ($res) {
     
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["error" => "No encontrado"]);
    }

    pg_close($conexion);
} else {
    echo json_encode(["error" => "Error de conexión"]);
}