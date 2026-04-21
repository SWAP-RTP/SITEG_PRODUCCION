<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);
require '/var/www/login_shared/conf/conexion.php';

function guardarSalidaMaterial() {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    file_put_contents(__DIR__.'/debug_post_salida.log', print_r($data, true), FILE_APPEND);

    // Validar folio y cantidad
    if (empty($data['folio_material']) || empty($data['cantidad_material_salida'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Folio y cantidad son obligatorios.'
        ]);
        pg_close($conexion);
        exit;
    }

    // Verificar stock actual
    $sql_stock = "SELECT stock_actual FROM control_materiales WHERE folio_material = $1";
    $res_stock = pg_query_params($conexion, $sql_stock, [$data['folio_material']]);
    $row_stock = pg_fetch_assoc($res_stock);
    $stock_actual = isset($row_stock['stock_actual']) ? (int)$row_stock['stock_actual'] : null;
    $cantidad_salida = (int)$data['cantidad_material_salida'];

    if ($stock_actual === null) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'No se encontró el material.'
        ]);
        pg_close($conexion);
        exit;
    }
    if ($cantidad_salida <= 0 || $cantidad_salida > $stock_actual) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Cantidad inválida o insuficiente stock.'
        ]);
        pg_close($conexion);
        exit;
    }

    // Insertar salida
    $sql = "INSERT INTO salidas_materiales (folio_material, descripcion_material_salida, id_estado_material_salida, cantidad_material_salida, adscripcion_modulo) VALUES ($1, $2, $3, $4, $5)";
    $params = [
        $data['folio_material'],
        $data['descripcion_material_salida'],
        $data['id_estado_material_salida'],
        $data['cantidad_material_salida'],
        $data['adscripcion_modulo']
    ];
    $result = pg_query_params($conexion, $sql, $params);

    if ($result) {
        // Actualizar stock
        $sql_update = "UPDATE control_materiales SET stock_actual = stock_actual - $1 WHERE folio_material = $2";
        pg_query_params($conexion, $sql_update, [$cantidad_salida, $data['folio_material']]);
        echo json_encode([
            'status' => 'ok',
            'message' => 'Salida registrada y stock actualizado.',
            'folio' => $data['folio_material']
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al guardar salida: ' . pg_last_error($conexion)
        ]);
    }
    pg_close($conexion);
}

guardarSalidaMaterial();
