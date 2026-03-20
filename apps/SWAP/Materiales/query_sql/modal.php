<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $ruta_conexion = Database::conectar();
    if (!$ruta_conexion) {
        throw new Exception("Conexion fallida a la BD " . $ruta_conexion);
    }
    
    $sql = "SELECT   codigo_material, descripcion_material 
            FROM     control_materiales 
            ORDER BY codigo_material, 
                     descripcion_material ASC";
    $result = pg_query($ruta_conexion, $sql);
    if (!$result) {
        throw new Exception("Error en la consulta: " . pg_last_error($ruta_conexion));
    }
    $materiales = pg_fetch_all($result);
    echo json_encode($materiales ? $materiales : []);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "mensaje" => $e->getMessage()
    ]);
    error_log($e->getMessage());
}
exit();

