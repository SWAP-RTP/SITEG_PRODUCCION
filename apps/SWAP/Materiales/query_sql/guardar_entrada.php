<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos o JSON inválido"]);
    exit;
}

function GuardarMaterial($conexion, $data){
    
    #AQUI INSERTA EN EL CATALOGO PRINCIPAL
    $sql = "INSERT INTO control_materiales 
            (codigo_material, descripcion_material, id_unidad, ubicacion_fisica, id_estado_material, id_categoria_material, stock_actual)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (codigo_material) DO UPDATE SET
            descripcion_material = EXCLUDED.descripcion_material,
            id_unidad = EXCLUDED.id_unidad,
            ubicacion_fisica = EXCLUDED.ubicacion_fisica,
            id_estado_material = EXCLUDED.id_estado_material,
            id_categoria_material = EXCLUDED.id_categoria_material,
            stock_actual = control_materiales.stock_actual + EXCLUDED.stock_actual";
    $params = [
        $data['codigo'],
        $data['descripcion'],
        $data['unidad'],
        $data['ubicacion'],
        $data['estado'],
        $data['id_categoria'],
        intval($data['cantidad']),
        $data['observaciones'] ?? null
    ];
    $result = pg_query_params($conexion, $sql, $params);
    if (!$result) {
        return ["status" => "error", "message" => pg_last_error($conexion)];
    }
    # AQUI INSERTA EN LA TABLA DE LAS CONSULTAS DE ENTRADA
    $sqlEntrada = "INSERT INTO entradas_materiales (codigo_material, cantidad, observaciones) VALUES ($1, $2, $3)";
    $paramsEntrada = [
        $data['codigo'],
        intval($data['cantidad']),
        $data['observaciones'] ?? null
    ];
    $resultEntrada = pg_query_params($conexion, $sqlEntrada, $paramsEntrada);
    if (!$resultEntrada) {
        return ["status" => "error", "message" => "Inventario actualizado, pero error al guardar entrada: " . pg_last_error($conexion)];
    }

    return ["status" => "ok"];
}

echo json_encode(GuardarMaterial($conexion, $data));
pg_close($conexion);