<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function getUnidades()
{
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión']);
        exit;
    }

    $query = "SELECT   nomenclatura_material, 
                       descripcion_unidad 
              FROM     unidades_materiales 
              ORDER BY nomenclatura_material ASC";
    $result = pg_query($conexion, $query);

    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la consulta: ' . pg_last_error($conexion)]);
        exit;
    }

    $unidades = pg_fetch_all($result);
    return $unidades ?: [];
}
echo json_encode(getUnidades());
