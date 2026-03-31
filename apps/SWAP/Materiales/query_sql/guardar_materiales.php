<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function guardarEntrada($conexion, $data) {
    if (
        empty($data['codigo']) ||
        empty($data['descripcion']) ||
        empty($data['unidad']) ||
        empty($data['estado']) ||
        empty($data['id_categoria']) ||
        empty($data['cantidad'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar entrada.'];
    }

    $sqlInventario = "INSERT INTO control_materiales
                        (codigo_material, descripcion_material, id_unidad, id_estado_material, id_categoria_material, stock_actual)
                      VALUES
                        ($1, $2, $3, $4, $5, $6)
                      ON CONFLICT (codigo_material) DO UPDATE SET
                        stock_actual = control_materiales.stock_actual + EXCLUDED.stock_actual";

    $paramsInventario = [
        $data['codigo'],
        $data['descripcion'],
        $data['unidad'],
        $data['estado'],
        $data['id_categoria'],
        intval($data['cantidad'])
    ];

    $resInventario = pg_query_params($conexion, $sqlInventario, $paramsInventario);
    if (!$resInventario) {
        throw new Exception('Error al actualizar inventario: ' . pg_last_error($conexion));
    }

    $sqlEntrada = "INSERT INTO entradas_materiales (codigo_material, cantidad) VALUES ($1, $2)";
    $paramsEntrada = [
        $data['codigo'],
        intval($data['cantidad'])
    ];

    $resEntrada = pg_query_params($conexion, $sqlEntrada, $paramsEntrada);
    if (!$resEntrada) {
        throw new Exception('Error al registrar entrada: ' . pg_last_error($conexion));
    }

    return ['status' => 'ok'];
}

function guardarSalida($conexion, $data) {
    if (
        empty($data['credencial']) ||
        empty($data['codigo']) ||
        empty($data['cantidad'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar salida.'];
    }

    $sqlStock = "SELECT stock_actual FROM control_materiales WHERE codigo_material = $1";
    $resStock = pg_query_params($conexion, $sqlStock, [$data['codigo']]);
    if (!$resStock) {
        throw new Exception('Error al consultar stock: ' . pg_last_error($conexion));
    }

    $rowStock = pg_fetch_assoc($resStock);
    $stockActual = $rowStock ? intval($rowStock['stock_actual']) : 0;

    $cantidadSalida = intval($data['cantidad']);
    $stockDespues = $stockActual - $cantidadSalida;

    $sqlMinimo = "SELECT stock_minimo FROM control_materiales WHERE codigo_material = $1";
    $resMinimo = pg_query_params($conexion, $sqlMinimo, [$data['codigo']]);
    if (!$resMinimo) {
        throw new Exception('Error al consultar stock minimo: ' . pg_last_error($conexion));
    }

    $rowMinimo = pg_fetch_assoc($resMinimo);
    $stockMinimo = $rowMinimo ? intval($rowMinimo['stock_minimo']) : 0;

    $advertenciaStock = '';
    if ($stockDespues <= 0) {
        $advertenciaStock = 'terminado';
    } else if ($stockDespues <= $stockMinimo) {
        $advertenciaStock = 'por_terminarse';
    }

    $sqlSalida = "INSERT INTO salidas_materiales (credencial, codigo_material, cantidad) VALUES ($1, $2, $3)";
    $paramsSalida = [
        $data['credencial'],
        $data['codigo'],
        $cantidadSalida
    ];

    $resSalida = pg_query_params($conexion, $sqlSalida, $paramsSalida);
    if (!$resSalida) {
        throw new Exception('Error al registrar salida: ' . pg_last_error($conexion));
    }

    $sqlUpdate = "UPDATE control_materiales SET stock_actual = stock_actual - $1 WHERE codigo_material = $2";
    $resUpdate = pg_query_params($conexion, $sqlUpdate, [$cantidadSalida, $data['codigo']]);
    if (!$resUpdate) {
        throw new Exception('Error al actualizar inventario: ' . pg_last_error($conexion));
    }

    if ($advertenciaStock === 'terminado') {
        return ['status' => 'warning', 'message' => 'Atencion: El material se ha terminado con esta salida.'];
    }

    if ($advertenciaStock === 'por_terminarse') {
        return ['status' => 'warning', 'message' => 'Advertencia: El stock esta por terminarse (igual o menor al minimo) tras esta salida.'];
    }

    return ['status' => 'ok'];
}

try {
    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception('No se pudo establecer conexion con la base de datos.');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'No se recibieron datos o JSON invalido.']);
        exit;
    }

    $tipo = strtolower(trim((string)($_GET['tipo'] ?? ($data['tipo'] ?? ''))));
    if ($tipo !== 'entrada' && $tipo !== 'salida') {
        echo json_encode(['status' => 'error', 'message' => 'Tipo invalido. Usa entrada o salida.']);
        exit;
    }

    pg_query($conexion, 'BEGIN');

    if ($tipo === 'entrada') {
        $respuesta = guardarEntrada($conexion, $data);
    } else {
        $respuesta = guardarSalida($conexion, $data);
    }

    if (isset($respuesta['status']) && $respuesta['status'] === 'error') {
        pg_query($conexion, 'ROLLBACK');
        echo json_encode($respuesta);
        exit;
    }

    pg_query($conexion, 'COMMIT');
    echo json_encode($respuesta);

    pg_close($conexion);
} catch (Exception $e) {
    if (isset($conexion) && $conexion) {
        pg_query($conexion, 'ROLLBACK');
        pg_close($conexion);
    }
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
