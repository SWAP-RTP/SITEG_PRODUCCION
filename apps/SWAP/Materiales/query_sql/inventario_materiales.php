<?php
require_once __DIR__ . '/../../config/conexion.php';
header('Content-Type: application/json');

$db = conexion();
if (!$db) {
    echo json_encode(["status" => "error", "message" => "Sin conexión a la base de datos"]);
    exit;
}

try {
    // Traemos el stock actual cruzando con el catálogo para tener nombres y unidades
    $sql = "SELECT 
                i.codigo_material as codigo, 
                c.descripcion_material as nombre, 
                i.cantidad_actual_material as total, 
                i.stock_minimo_material as minimo, 
                c.unidad_material as unidad, 
                i.ubicacion_almacen_material as ubicacion
            FROM inventario_material i
            JOIN catalogo_material c ON i.codigo_material = c.codigo_material
            ORDER BY c.descripcion_material ASC";

    $result = pg_query($db, $sql);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . pg_last_error($db));
    }

    $datos = pg_fetch_all($result) ?: [];

    echo json_encode([
        "status" => "success",
        "data" => $datos
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

pg_close($db);