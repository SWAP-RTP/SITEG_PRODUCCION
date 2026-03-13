<?php
session_start();
require(__DIR__ . '/../../../conexion.php'); 

header('Content-Type: application/json');

// CORRECCIÓN: Llamamos a la función y asignamos a la variable
$conexion = conexion(); 

if ($conexion) { 

    $sql = "SELECT codigo_material, descripcion_material, nomenclatura_material 
            FROM control_materiales 
            ORDER BY descripcion_material ASC;";
            
    $qry = pg_query($conexion, $sql);

    if (!$qry) {
        echo json_encode(["error" => "Error al listar materiales"]);
        pg_close($conexion);
        exit;
    }

    $data = [];
    while ($res = pg_fetch_assoc($qry)) {
        $data[] = $res;
    }

    pg_free_result($qry);
    pg_close($conexion);

    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["error" => "Error de conexión al servidor"]);
}
