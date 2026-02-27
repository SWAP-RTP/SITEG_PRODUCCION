<?php
require_once __DIR__ . '/../../config/conexion.php'; 
header('Content-Type: application/json');
$db = conexion();

if (!$db) {
    echo json_encode(["status" => "error", "message" => "Error de conexión"]);
    exit;
}

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data || empty($data['id_credencial'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

try {
    pg_query($db, "BEGIN");

    $codigo = strtoupper($data['codigo_material']);

    // --- 1. MANEJO DEL CATÁLOGO ---
    // Verificamos si ya existe el material
    $check_cat = pg_query_params($db, "SELECT 1 FROM catalogo_material WHERE codigo_material = $1", [$codigo]);
    
    if (pg_num_rows($check_cat) == 0) {
        // Si no existe, lo insertamos
        pg_query_params($db, "INSERT INTO catalogo_material (codigo_material, descripcion_material, categoria_material, unidad_material) VALUES ($1, $2, $3, $4)", [
            $codigo, 
            strtoupper($data['descripcion_material']), 
            $data['categoria_material'], 
            $data['unidad_medida_material']
        ]);
    }

    // --- 2. INSERTAR REGISTRO (HISTORIAL) ---
    pg_query_params($db, "INSERT INTO registro_material (codigo_material, cantidad_salida_material, id_credencial) VALUES ($1, $2, $3)", [
        $codigo, 
        $data['cantidad_inicial_material'], 
        $data['id_credencial']
    ]);

    // --- 3. MANEJO DEL INVENTARIO ---
    $check_inv = pg_query_params($db, "SELECT 1 FROM inventario_material WHERE codigo_material = $1", [$codigo]);
    
    if (pg_num_rows($check_inv) > 0) {
        // Si ya existe en inventario, sumamos la cantidad
        pg_query_params($db, "UPDATE inventario_material SET cantidad_actual_material = cantidad_actual_material + $1 WHERE codigo_material = $2", [
            $data['cantidad_inicial_material'], 
            $codigo
        ]);
    } else {
        // Si no existe en inventario, creamos la fila
        pg_query_params($db, "INSERT INTO inventario_material (codigo_material, cantidad_actual_material, ubicacion_almacen_material, stock_minimo_material) VALUES ($1, $2, $3, $4)", [
            $codigo, 
            $data['cantidad_inicial_material'], 
            $data['ubicacion_almacen_material'], 
            $data['stock_minimo_material']
        ]);
    }

    pg_query($db, "COMMIT");
    echo json_encode(["status" => "success", "message" => "¡Material y Registro guardados exitosamente!"]);

} catch (Exception $e) {
    pg_query($db, "ROLLBACK");
    echo json_encode(["status" => "error", "message" => "Error en BD: " . $e->getMessage()]);
}
pg_close($db);