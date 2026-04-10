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

function codigoMaterialEsGenerado($conexion) {
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $sql = "SELECT is_generated
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'control_materiales'
              AND column_name = 'codigo_material'
            LIMIT 1";

    $res = @pg_query($conexion, $sql);
    if (!$res) {
        $cache = false;
        return $cache;
    }

    $row = pg_fetch_assoc($res);
    $cache = isset($row['is_generated']) && strtoupper((string)$row['is_generated']) === 'ALWAYS';
    return $cache;
}

function tablaTieneColumna($conexion, $tabla, $columna) {
        $sql = "SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                            AND table_name = $1
                            AND column_name = $2
                        LIMIT 1";

        $res = @pg_query_params($conexion, $sql, [$tabla, $columna]);
        return $res && pg_num_rows($res) > 0;
}

    function agregarCampoMovimiento(&$columnas, &$valores, &$params, $nombreColumna, $valor) {
        $columnas[] = $nombreColumna;
        $valores[] = '$' . (count($params) + 1);
        $params[] = $valor;
    }

function esCodigoMAValido($codigo) {
    return preg_match('/^MA[0-9]{8}$/', (string)$codigo) === 1;
}

function guardarEntrada($conexion, $data) {
    if (
        empty($data['descripcion']) ||
        empty($data['unidad']) ||
        empty($data['estado']) ||
        empty($data['id_categoria']) ||
        empty($data['cantidad']) ||
        empty($data['adscripcion'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar entrada.'];
    }

    $cantidadEntrada = intval($data['cantidad']);
    if ($cantidadEntrada <= 0) {
        return ['status' => 'error', 'message' => 'La cantidad de entrada debe ser mayor a 0.'];
    }

    $codigoIngresado = trim((string)($data['codigo'] ?? ''));
    $usarCodigoGenerado = codigoMaterialEsGenerado($conexion);

    if (!$usarCodigoGenerado && $codigoIngresado === '') {
        return ['status' => 'error', 'message' => 'El codigo del material es obligatorio en el esquema actual.'];
    }

    if ($codigoIngresado !== '' && !esCodigoMAValido($codigoIngresado)) {
        return ['status' => 'error', 'message' => 'El codigo debe tener formato MA00000001 (MA + 8 digitos).'];
    }

    $codigoMaterialFinal = $codigoIngresado;

    $materialExiste = false;
    if ($codigoIngresado !== '') {
        $sqlExiste = "SELECT 1 FROM control_materiales WHERE codigo_material = $1 LIMIT 1";
        $resExiste = ejecutarQuerySeguro($conexion, $sqlExiste, [$codigoIngresado], 'Error al validar codigo de material');
        $materialExiste = (bool)pg_fetch_assoc($resExiste);
    }

    if ($materialExiste) {
        $sqlUpdateInventario = "UPDATE control_materiales
                                SET stock_actual = stock_actual + $1,
                                    adscripcion = $2
                                WHERE codigo_material = $3";
        $paramsUpdateInventario = [
            $cantidadEntrada,
            $data['adscripcion'],
            $codigoIngresado
        ];
        ejecutarQuerySeguro($conexion, $sqlUpdateInventario, $paramsUpdateInventario, 'Error al actualizar inventario');
    } else {
        if ($usarCodigoGenerado) {
            $sqlInsertInventario = "INSERT INTO control_materiales
                                    (descripcion_material, id_unidad, id_estado_material, id_categoria_material, stock_actual, stock_minimo, adscripcion)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                                    RETURNING codigo_material";

            $paramsInsertInventario = [
                $data['descripcion'],
                $data['unidad'],
                $data['estado'],
                $data['id_categoria'],
                $cantidadEntrada,
                0,
                $data['adscripcion']
            ];

            $resInsert = ejecutarQuerySeguro($conexion, $sqlInsertInventario, $paramsInsertInventario, 'Error al crear material');
            $rowInsert = pg_fetch_assoc($resInsert);
            $codigoMaterialFinal = $rowInsert['codigo_material'] ?? '';

            if ($codigoMaterialFinal === '') {
                throw new Exception('No se pudo obtener el codigo generado del material.');
            }
        } else {
            $sqlInsertInventario = "INSERT INTO control_materiales
                                    (codigo_material, descripcion_material, id_unidad, id_estado_material, id_categoria_material, stock_actual, stock_minimo, adscripcion)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                    RETURNING codigo_material";

            $paramsInsertInventario = [
                $codigoIngresado,
                $data['descripcion'],
                $data['unidad'],
                $data['estado'],
                $data['id_categoria'],
                $cantidadEntrada,
                0,
                $data['adscripcion']
            ];

            $resInsert = ejecutarQuerySeguro($conexion, $sqlInsertInventario, $paramsInsertInventario, 'Error al crear material');
            $rowInsert = pg_fetch_assoc($resInsert);
            $codigoMaterialFinal = $rowInsert['codigo_material'] ?? '';

            if ($codigoMaterialFinal === '') {
                throw new Exception('No se pudo obtener el codigo final del material.');
            }

            if ($codigoIngresado !== '' && $codigoMaterialFinal !== $codigoIngresado) {
                throw new Exception(
                    'El folio capturado fue reemplazado por la base de datos (' . $codigoMaterialFinal . '). ' .
                    'Revisa el trigger de control_materiales para permitir codigo manual cuando se capture.'
                );
            }
        }
    }

    $columnasEntrada = ['codigo_material', 'cantidad'];
    $valoresEntrada = ['$1', '$2'];
    $paramsEntrada = [$codigoMaterialFinal, $cantidadEntrada];

    if (tablaTieneColumna($conexion, 'entradas_materiales', 'id_unidad')) {
        agregarCampoMovimiento($columnasEntrada, $valoresEntrada, $paramsEntrada, 'id_unidad', $data['unidad']);
    }
    if (tablaTieneColumna($conexion, 'entradas_materiales', 'id_estado_material')) {
        agregarCampoMovimiento($columnasEntrada, $valoresEntrada, $paramsEntrada, 'id_estado_material', $data['estado']);
    }
    if (tablaTieneColumna($conexion, 'entradas_materiales', 'id_categoria_material')) {
        agregarCampoMovimiento($columnasEntrada, $valoresEntrada, $paramsEntrada, 'id_categoria_material', $data['id_categoria']);
    }
    if (tablaTieneColumna($conexion, 'entradas_materiales', 'adscripcion')) {
        agregarCampoMovimiento($columnasEntrada, $valoresEntrada, $paramsEntrada, 'adscripcion', $data['adscripcion']);
    }

    $sqlEntrada = 'INSERT INTO entradas_materiales (' . implode(', ', $columnasEntrada) . ') VALUES (' . implode(', ', $valoresEntrada) . ')';

    ejecutarQuerySeguro($conexion, $sqlEntrada, $paramsEntrada, 'Error al registrar entrada');

    return [
        'status' => 'ok',
        'codigo_material' => $codigoMaterialFinal
    ];
}

function guardarSalida($conexion, $data) {
    if (
        empty($data['codigo']) ||
        empty($data['cantidad'])
    ) {
        return ['status' => 'error', 'message' => 'Datos incompletos para registrar salida.'];
    }

    if (!esCodigoMAValido($data['codigo'])) {
        return ['status' => 'error', 'message' => 'El codigo debe tener formato MA00000001 (MA + 8 digitos).'];
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

    $columnasSalida = ['credencial', 'codigo_material', 'cantidad'];
    $valoresSalida = ['$1', '$2', '$3'];
    $paramsSalida = [
        $credencialSalida,
        $data['codigo'],
        $cantidadSalida
    ];

    if (tablaTieneColumna($conexion, 'salidas_materiales', 'id_unidad')) {
        agregarCampoMovimiento($columnasSalida, $valoresSalida, $paramsSalida, 'id_unidad', $data['unidad']);
    }
    if (tablaTieneColumna($conexion, 'salidas_materiales', 'id_estado_material')) {
        agregarCampoMovimiento($columnasSalida, $valoresSalida, $paramsSalida, 'id_estado_material', $data['estado']);
    }
    if (tablaTieneColumna($conexion, 'salidas_materiales', 'id_categoria_material')) {
        agregarCampoMovimiento($columnasSalida, $valoresSalida, $paramsSalida, 'id_categoria_material', $data['id_categoria']);
    }
    if (tablaTieneColumna($conexion, 'salidas_materiales', 'adscripcion')) {
        agregarCampoMovimiento($columnasSalida, $valoresSalida, $paramsSalida, 'adscripcion', $data['adscripcion']);
    }

    $sqlSalida = 'INSERT INTO salidas_materiales (' . implode(', ', $columnasSalida) . ') VALUES (' . implode(', ', $valoresSalida) . ')';

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
