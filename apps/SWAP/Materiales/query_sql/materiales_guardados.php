<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

//  VALIDAR DATA
if (!$data) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se recibieron datos'
    ]);
    exit;
}

//  DETECTAR OPERACIÓN
if (isset($data['cantidad_material_entrada'])) {
    guardarEntradaMaterial($data);
} elseif (isset($data['cantidad_material_salida'])) {
    guardarSalidaMaterial($data);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo determinar el tipo de operación'
    ]);
}


// ==========================
//  ENTRADA
// ==========================
function guardarEntradaMaterial($data) {

    $conexion = Database::conectar();

    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    //  VALIDAR EXISTENCIA DEL MATERIAL
    $folioValido = false;

    if (!empty($data['folio_material'])) {
        $check = pg_query_params(
            $conexion,
            "SELECT 1 FROM control_materiales WHERE folio_material = $1",
            [$data['folio_material']]
        );

        if ($check && pg_num_rows($check) > 0) {
            $folioValido = true;
        }
    }

    //  CREAR MATERIAL SI NO EXISTE
    if (!$folioValido) {

        if (
            empty($data['descripcion_material_entrada']) ||
            empty($data['id_unidad_material']) ||
            empty($data['id_categoria_material']) ||
            empty($data['adscripcion_modulo'])
        ) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Faltan datos para crear el material'
            ]);
            exit;
        }

        $sql_control = "INSERT INTO control_materiales 
            (descripcion_material, id_unidad_material, id_categoria_material, adscripcion_modulo)
            VALUES ($1, $2, $3, $4) RETURNING folio_material";

        $res_control = pg_query_params($conexion, $sql_control, [
            $data['descripcion_material_entrada'],
            $data['id_unidad_material'],
            $data['id_categoria_material'],
            $data['adscripcion_modulo']
        ]);

        if (!$res_control) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al crear material'
            ]);
            exit;
        }

        $row_control = pg_fetch_assoc($res_control);
        $data['folio_material'] = $row_control['folio_material'];
    }

    //  VALIDACIÓN FINAL
    if (
        empty($data['folio_material']) ||
        empty($data['cantidad_material_entrada']) ||
        empty($data['id_estado_material_entrada'])
    ) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Faltan datos obligatorios'
        ]);
        exit;
    }

    pg_query($conexion, "BEGIN");

    //  INSERT ENTRADA
    $result = pg_query_params($conexion, "
        INSERT INTO entradas_materiales 
        (folio_material, descripcion_material_entrada, id_estado_material_entrada, cantidad_material_entrada, adscripcion_modulo)
        VALUES ($1, $2, $3, $4, $5)
    ", [
        $data['folio_material'],
        $data['descripcion_material_entrada'],
        $data['id_estado_material_entrada'],
        $data['cantidad_material_entrada'],
        $data['adscripcion_modulo']
    ]);

    if (!$result) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar entrada']);
        exit;
    }

   
    pg_query($conexion, "COMMIT");

    echo json_encode([
        'status' => 'ok',
        'message' => 'Entrada registrada correctamente',
        'folio' => $data['folio_material']
    ]);

    pg_close($conexion);
}


// ==========================
//  SALIDA
// ==========================
function guardarSalidaMaterial($data) {

    $conexion = Database::conectar();

    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    if (
        empty($data['folio_material']) ||
        empty($data['cantidad_material_salida'])
    ) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Folio y cantidad son obligatorios.'
        ]);
        exit;
    }

    $cantidadSalida = (int)$data['cantidad_material_salida'];

    //  OBTENER STOCK REAL
    $resStock = pg_query_params(
        $conexion,
        "SELECT stock_actual FROM control_materiales WHERE folio_material = $1",
        [$data['folio_material']]
    );

    if (!$resStock || pg_num_rows($resStock) == 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Material no encontrado'
        ]);
        exit;
    }

    $stock = (int)pg_fetch_assoc($resStock)['stock_actual'];

    //  CALCULAR STOCK RESTANTE
$stockRestante = $stock - $cantidadSalida;

// NO permitir que llegue a 0 o menos
if ($stockRestante < 1) {
    echo json_encode([
        'status' => 'error',
        'message' => "No puedes dejar el stock en 0."
    ]);
    exit;
}
    pg_query($conexion, "BEGIN");

    // INSERT SALIDA
    $result = pg_query_params($conexion, "
        INSERT INTO salidas_materiales 
        (folio_material, descripcion_material_salida, id_estado_material_salida, cantidad_material_salida, adscripcion_modulo)
        VALUES ($1, $2, $3, $4, $5)
    ", [
        $data['folio_material'],
        $data['descripcion_material_salida'],
        $data['id_estado_material_salida'],
        $cantidadSalida,
        $data['adscripcion_modulo']
    ]);

    if (!$result) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al registrar salida'
        ]);
        exit;
    }

    //  RESTAR STOCK
    $update = pg_query_params(
        $conexion,
        "UPDATE control_materiales 
         SET stock_actual = stock_actual - $1
         WHERE folio_material = $2",
        [$cantidadSalida, $data['folio_material']]
    );

    if (!$update) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al actualizar stock'
        ]);
        exit;
    }

    pg_query($conexion, "COMMIT");

    echo json_encode([
        'status' => 'ok',
        'message' => 'Salida registrada correctamente',
        'stock_restante' => $stock - $cantidadSalida
    ]);

    pg_close($conexion);
}