<?php
// 1. Limpiar cualquier salida previa (espacios, errores de otros archivos)
ob_start(); 

error_reporting(0);
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/conexion.php';

$db = conexion();
if (!$db) {
    ob_clean(); // Limpiar buffer antes de enviar error
    echo json_encode(["status" => "error", "message" => "No hay conexión"]);
    exit;
}

try {
    $sql = "SELECT 
                r.id_registro,
                r.fecha_registro_material,
                r.codigo_material,
                c.descripcion_material,
                r.cantidad_salida_material,
                t.trab_nombre || ' ' || COALESCE(t.trab_apaterno, '') || ' ' || COALESCE(t.trab_amaterno, '') AS nombre_recibio
            FROM registro_material r
            LEFT JOIN trabajador t ON r.id_credencial = t.trab_credencial
            LEFT JOIN catalogo_material c ON r.codigo_material = c.codigo_material
            ORDER BY r.fecha_registro_material DESC 
            LIMIT 10";

    $result = pg_query($db, $sql);
    
    if (!$result) {
        throw new Exception(pg_last_error($db));
    }

    $registros = pg_fetch_all($result);
    
    // 2. Preparar respuesta limpia
    ob_clean(); 
    echo json_encode([
        "status" => "success",
        "data" => ($registros === false) ? [] : $registros
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
pg_close($db);