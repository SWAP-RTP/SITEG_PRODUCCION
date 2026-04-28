<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se recibieron datos'
    ]);
    exit;
}

/* =========================================================
   DETECTAR OPERACIÓN
========================================================= */
if (!empty($data['cantidad']) && isset($data['estado'])) {
    guardarEntradaMaterial($data);
    exit;
}

if (!empty($data['cantidad'])) {
    guardarSalidaMaterial($data);
    exit;
}

echo json_encode([
    'status' => 'error',
    'message' => 'Datos insuficientes'
]);
exit;


/* =========================================================
   ENTRADA
========================================================= */
function guardarEntradaMaterial($data)
{
    $conexion = Database::conectar();

    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    $folio = $data['folio'];
    $cantidad = (int)$data['cantidad'];

    if (!$folio || !$cantidad) {
        echo json_encode(['status' => 'error', 'message' => 'Folio y cantidad obligatorios']);
        exit;
    }

    pg_query($conexion, "BEGIN");

    /* ==========================
       VERIFICAR MATERIAL
    ========================== */
    $check = pg_query_params(
        $conexion,
        "SELECT 1 FROM control_materiales WHERE folio_material = $1",
        [$folio]
    );

    $existe = ($check && pg_num_rows($check) > 0);

    /* ==========================
       CREAR MATERIAL SI NO EXISTE
    ========================== */
    if (!$existe) {

        if (
            empty($data['descripcion']) ||
            empty($data['unidad']) ||
            empty($data['id_categoria']) ||
            empty($data['adscripcion'])
        ) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Faltan datos para crear material'
            ]);
            exit;
        }

        $insertMat = pg_query_params(
            $conexion,
            "INSERT INTO control_materiales
            (folio_material, descripcion_material, id_unidad_material, id_categoria_material, adscripcion_modulo, stock_actual)
            VALUES ($1,$2,$3,$4,$5,0)",
            [
                $folio,
                $data['descripcion'],
                $data['unidad'],
                $data['id_categoria'],
                $data['adscripcion']
            ]
        );

        if (!$insertMat) {
            pg_query($conexion, "ROLLBACK");
            echo json_encode(['status' => 'error', 'message' => 'Error al crear material']);
            exit;
        }
    }

    /* ==========================
       INSERT ENTRADA
    ========================== */
    $insert = pg_query_params(
        $conexion,
        "INSERT INTO entradas_materiales
        (folio_material, descripcion_material_entrada, id_estado_material_entrada, cantidad_material_entrada, adscripcion_modulo)
        VALUES ($1,$2,$3,$4,$5)",
        [
            $folio,
            $data['descripcion'],
            $data['estado'],
            $cantidad,
            $data['adscripcion']
        ]
    );

    if (!$insert) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar entrada']);
        exit;
    }

    /* ==========================
       ACTUALIZAR STOCK
    ========================== */
    pg_query_params(
        $conexion,
        "UPDATE control_materiales
         SET stock_actual = COALESCE(stock_actual,0) + $1
         WHERE folio_material = $2",
        [$cantidad, $folio]
    );

    pg_query($conexion, "COMMIT");

    echo json_encode([
        'status' => 'ok',
        'message' => 'Entrada registrada correctamente',
        'folio' => $folio
    ]);
}


/* =========================================================
   SALIDA
========================================================= */
function guardarSalidaMaterial($data)
{
    $conexion = Database::conectar();

    if (!$conexion) {
        echo json_encode(['status' => 'error', 'message' => 'Error de conexión']);
        exit;
    }

    $folio = $data['folio'];
    $cantidad = (int)$data['cantidad'];

    if (!$folio || !$cantidad) {
        echo json_encode(['status' => 'error', 'message' => 'Folio y cantidad obligatorios']);
        exit;
    }

    $res = pg_query_params(
        $conexion,
        "SELECT stock_actual FROM control_materiales WHERE folio_material = $1",
        [$folio]
    );

    $row = pg_fetch_assoc($res);

    if (!$row) {
        echo json_encode(['status' => 'error', 'message' => 'Material no encontrado']);
        exit;
    }

    $stock = (int)$row['stock_actual'];

    if ($cantidad > $stock) {
        echo json_encode(['status' => 'error', 'message' => 'Stock insuficiente']);
        exit;
    }

    pg_query($conexion, "BEGIN");

    pg_query_params(
        $conexion,
        "INSERT INTO salidas_materiales
        (folio_material, descripcion_material_salida, id_estado_material_salida, cantidad_material_salida, adscripcion_modulo)
        VALUES ($1,$2,$3,$4,$5)",
        [
            $folio,
            $data['descripcion'],
            $data['estado'],
            $cantidad,
            $data['adscripcion']
        ]
    );

    pg_query_params(
        $conexion,
        "UPDATE control_materiales
         SET stock_actual = stock_actual - $1
         WHERE folio_material = $2",
        [$cantidad, $folio]
    );

    pg_query($conexion, "COMMIT");

    echo json_encode([
        'status' => 'ok',
        'message' => 'Operación registrada correctamente'
    ]);
}