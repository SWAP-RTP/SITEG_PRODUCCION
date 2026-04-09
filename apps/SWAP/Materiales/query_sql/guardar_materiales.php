<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function ejecutarQuerySeguro($conexion, $sql, $params, $mensajeError) {
    $resultado = @pg_query_params($conexion, $sql, $params);
    if (!$resultado) {
        throw new Exception($mensajeError . ': ' . pg_last_error($conexion));
    }
    return $resultado;
}

function guardarEntrada($conexion, $data) {
    if (
        empty($data['codigo']) ||
        empty($data['descripcion']) ||
        empty($data['unidad']) ||
        empty($data['estado']) ||
        empty($data['id_categoria']) ||
                empty($data['cantidad']) ||
                empty($data['adscripcion'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar entrada.'];
    }

    $sqlInventario = "INSERT INTO control_materiales
                                                (codigo_material, descripcion_material, id_unidad, id_estado_material, id_categoria_material, stock_actual, adscripcion)
                      VALUES
                                                ($1, $2, $3, $4, $5, $6, $7)
                      ON CONFLICT (codigo_material) DO UPDATE SET
                                                stock_actual = control_materiales.stock_actual + EXCLUDED.stock_actual,
                                                adscripcion = EXCLUDED.adscripcion";

    $paramsInventario = [
        $data['codigo'],
        $data['descripcion'],
        $data['unidad'],
        $data['estado'],
        $data['id_categoria'],
        intval($data['cantidad']),
        $data['adscripcion']
    ];

    ejecutarQuerySeguro($conexion, $sqlInventario, $paramsInventario, 'Error al actualizar inventario');

    $sqlEntrada = "INSERT INTO entradas_materiales (codigo_material, cantidad) VALUES ($1, $2)";
    $paramsEntrada = [
        $data['codigo'],
        intval($data['cantidad'])
    ];

    ejecutarQuerySeguro($conexion, $sqlEntrada, $paramsEntrada, 'Error al registrar entrada');

    return ['status' => 'ok'];
}

function guardarSalida($conexion, $data) {
    if (
        empty($data['codigo']) ||
        empty($data['cantidad'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar salida.'];
    }

    $cantidadSalida = intval($data['cantidad']);
    if ($cantidadSalida <= 0) {
        return ['status' => 'error', 'message' => 'La cantidad de salida debe ser mayor a 0.'];
    }

    $sqlStock = "SELECT stock_actual FROM control_materiales WHERE codigo_material = $1";
    $resStock = ejecutarQuerySeguro($conexion, $sqlStock, [$data['codigo']], 'Error al consultar stock');

    $rowStock = pg_fetch_assoc($resStock);
    if (!$rowStock) {
        return ['status' => 'error', 'message' => 'El material no existe en inventario.'];
    }

    $stockActual = intval($rowStock['stock_actual']);
    $stockDespues = $stockActual - $cantidadSalida;

    if ($stockDespues < 0) {
        return [
            'status' => 'warning',
            'message' => 'Stock insuficiente para registrar la salida. Stock actual: ' . $stockActual . '.'
        ];
    }

    $sqlMinimo = "SELECT stock_minimo FROM control_materiales WHERE codigo_material = $1";
    $resMinimo = ejecutarQuerySeguro($conexion, $sqlMinimo, [$data['codigo']], 'Error al consultar stock minimo');

    $rowMinimo = pg_fetch_assoc($resMinimo);
    $stockMinimo = $rowMinimo ? intval($rowMinimo['stock_minimo']) : 0;

    $advertenciaStock = '';
    if ($stockDespues <= 0) {
        $advertenciaStock = 'terminado';
    } else if ($stockDespues <= $stockMinimo) {
        $advertenciaStock = 'por_terminarse';
    }

    $credencialSalida = trim((string)($data['credencial'] ?? ''));
    if ($credencialSalida === '') {
        $credencialSalida = null;
    }

    $sqlSalida = "INSERT INTO salidas_materiales (credencial, codigo_material, cantidad) VALUES ($1, $2, $3)";
    $paramsSalida = [
        $credencialSalida,
        $data['codigo'],
        $cantidadSalida
    ];

    ejecutarQuerySeguro($conexion, $sqlSalida, $paramsSalida, 'Error al registrar salida');

    $sqlUpdate = "UPDATE control_materiales SET stock_actual = stock_actual - $1 WHERE codigo_material = $2";
    ejecutarQuerySeguro($conexion, $sqlUpdate, [$cantidadSalida, $data['codigo']], 'Error al actualizar inventario');

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
