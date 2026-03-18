<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    $ruta_conexion = dirname(__FILE__) . '/../../config/conexion.php';
    if (!file_exists($ruta_conexion)) {
        throw new Exception("No se encontró el archivo de conexión en: " . $ruta_conexion);
    }
    require_once($ruta_conexion);
    $conexion = conexion();
    if (!$conexion) {
        throw new Exception("La conexión a la base de datos falló.");
    }
    $sql = "SELECT codigo_material, descripcion_material FROM control_materiales ORDER BY codigo_material, descripcion_material ASC";
    $result = pg_query($conexion, $sql);
    if (!$result) {
        throw new Exception("Error en la consulta PostgreSQL: " . pg_last_error($conexion));
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