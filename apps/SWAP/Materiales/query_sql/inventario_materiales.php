<?php
// 1. Limpiar cualquier salida previa para evitar errores de JSON
ob_start();
header('Content-Type: application/json');

// 2. Incluir conexión (Asegúrate que esta ruta sea correcta)
require_once __DIR__ . '/../../config/conexion.php';

$db = conexion();

$response = ["status" => "error", "message" => "Error desconocido", "data" => []];

if (!$db) {
    $response["message"] = "No hay conexión a la base de datos.";
    echo json_encode($response);
    exit;
}

try {
    // Consulta optimizada para PostgreSQL
    $sql = "SELECT 
                i.codigo_material as codigo, 
                c.descripcion_material as nombre, 
                i.cantidad_actual_material as total, 
                i.stock_minimo_material as minimo, 
                c.unidad_material as unidad, 
                i.ubicacion_almacen_material as ubicacion
            FROM inventario_material i
            INNER JOIN catalogo_material c ON i.codigo_material = c.codigo_material
            ORDER BY c.descripcion_material ASC";

    $result = pg_query($db, $sql);
    
    if (!$result) {
        throw new Exception("Error en SQL: " . pg_last_error($db));
    }

    $datos = pg_fetch_all($result);
    
    // Si no hay datos, devolvemos un array vacío pero con status success
    $response["status"] = "success";
    $response["message"] = "Datos obtenidos correctamente";
    $response["data"] = $datos ? $datos : [];

} catch (Exception $e) {
    $response["message"] = $e->getMessage();
}

// Limpiar el buffer y enviar JSON puro
ob_end_clean();
echo json_encode($response);
pg_close($db);