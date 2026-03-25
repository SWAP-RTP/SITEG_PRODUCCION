<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $conexion = Database::conectar();
    $data = json_decode(file_get_contents('php://input'), true);

    // Validación básica
    if (
        !$data ||
        empty($data['credencial']) ||
        empty($data['codigo']) ||
        empty($data['cantidad'])
    ) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
        exit;
    }

    // 1. Verificar stock suficiente
    $sqlStock = "SELECT stock_actual FROM control_materiales WHERE codigo_material = $1";
    $resStock = pg_query_params($conexion, $sqlStock, [$data['codigo']]);
    if (!$resStock) {
        throw new Exception('Error al consultar stock: ' . pg_last_error($conexion));
    }
    $rowStock = pg_fetch_assoc($resStock);
    $stockActual = $rowStock ? intval($rowStock['stock_actual']) : 0;

    if ($stockActual < intval($data['cantidad'])) {
        echo json_encode(['status' => 'error', 'message' => 'Stock insuficiente']);
        exit;
    }

    // 2. Registrar la salida
    $sqlSalida = "INSERT INTO salidas_materiales (credencial, codigo_material, cantidad) VALUES ($1, $2, $3)";
    $paramsSalida = [
        $data['credencial'],
        $data['codigo'],
        intval($data['cantidad'])
    ];
    $resSalida = pg_query_params($conexion, $sqlSalida, $paramsSalida);
    if (!$resSalida) {
        throw new Exception('Error al registrar salida: ' . pg_last_error($conexion));
    }

    // 3. Restar del inventario
    $sqlUpdate = "UPDATE control_materiales SET stock_actual = stock_actual - $1 WHERE codigo_material = $2";
    $resUpdate = pg_query_params($conexion, $sqlUpdate, [intval($data['cantidad']), $data['codigo']]);
    if (!$resUpdate) {
        throw new Exception('Error al actualizar inventario: ' . pg_last_error($conexion));
    }

    echo json_encode(['status' => 'ok']);
    pg_close($conexion);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}