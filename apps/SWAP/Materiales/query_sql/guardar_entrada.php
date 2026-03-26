<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos o JSON inválido"]);
    exit;
}

function GuardarMaterial($conexion, $data){
    // 1. Insertar o actualizar en el catálogo principal
    $sql = "INSERT INTO control_materiales 
            (codigo_material, descripcion_material, id_unidad, id_estado_material, id_categoria_material, stock_actual)
        VALUES 
            ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (codigo_material) DO UPDATE SET
            descripcion_material = EXCLUDED.descripcion_material,
            id_unidad = EXCLUDED.id_unidad,
            id_estado_material = EXCLUDED.id_estado_material,
            id_categoria_material = EXCLUDED.id_categoria_material,
            stock_actual = control_materiales.stock_actual + EXCLUDED.stock_actual";

    $params = [
        $data['codigo'],
        $data['descripcion'],
        $data['unidad'],
        $data['estado'],
        $data['id_categoria'],
        intval($data['cantidad'])
    ];
    $result = pg_query_params($conexion, $sql, $params);
    if (!$result) {
        return ["status" => "error", "message" => "Error al actualizar inventario: " . pg_last_error($conexion)];
    }

    // 2. Insertar en la tabla de entradas
    $sqlEntrada = "INSERT INTO entradas_materiales (codigo_material, cantidad) VALUES ($1, $2)";
    $paramsEntrada = [
        $data['codigo'],
        intval($data['cantidad'])
    ];
    $resultEntrada = pg_query_params($conexion, $sqlEntrada, $paramsEntrada);
    if (!$resultEntrada) {
        // Éxito parcial: inventario actualizado, pero no se registró la entrada
        return [
            "status" => "warning",
            "message" => "El inventario fue actualizado, pero no se pudo registrar la entrada en el historial. Por favor, contacte a soporte. Detalle: " . pg_last_error($conexion)
        ];
    }

    // Éxito total
    return ["status" => "ok"];
}

$respuesta = GuardarMaterial($conexion, $data);
echo json_encode($respuesta);
pg_close($conexion);