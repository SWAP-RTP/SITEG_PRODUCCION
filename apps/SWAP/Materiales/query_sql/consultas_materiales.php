<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

// =================== CONSULTA DE ENTRADAS ===================
if (isset($_GET['tipo']) && $_GET['tipo'] === 'entradas') {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    // Paginación
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Total de registros
    $sqlTotal = "SELECT COUNT(*) AS total FROM entradas_materiales";
    $resTotal = @pg_query($conexion, $sqlTotal);
    $rowTotal = pg_fetch_assoc($resTotal);
    $total = intval($rowTotal['total']);

    // Consulta paginada
    $sql = "SELECT em.folio_material, em.descripcion_material_entrada, um.descripcion_unidad_material, em.cantidad_material_entrada, em.fecha_registro_entrada, em.adscripcion_modulo, em.id_estado_material_entrada, est.descripcion_estado_material
        FROM entradas_materiales em
        INNER JOIN control_materiales cm ON em.folio_material = cm.folio_material
        INNER JOIN unidades_materiales um ON cm.id_unidad_material = um.id_unidad_material
        INNER JOIN estados_materiales est ON em.id_estado_material_entrada = est.id_estado_material
        ORDER BY em.fecha_registro_entrada DESC
        LIMIT $limit OFFSET $offset";
    $res = @pg_query($conexion, $sql);
    $datos = [];
    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $datos[] = $row;
        }
    }
    echo json_encode(['status' => 'ok', 'datos' => $datos, 'total' => $total]);
    pg_close($conexion);
    exit;
}

// =================== CONSULTA DE SALIDAS ===================
if (isset($_GET['tipo']) && $_GET['tipo'] === 'salidas') {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    // Paginación
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // Total de registros
    $sqlTotal = "SELECT COUNT(*) AS total FROM salidas_materiales";
    $resTotal = @pg_query($conexion, $sqlTotal);
    $rowTotal = pg_fetch_assoc($resTotal);
    $total = intval($rowTotal['total']);

    // Consulta paginada
    $sql = "SELECT sm.folio_material, sm.descripcion_material_salida, um.descripcion_unidad_material, sm.cantidad_material_salida, sm.fecha_registro_salida, sm.adscripcion_modulo, sm.id_estado_material_salida, est.descripcion_estado_material
        FROM salidas_materiales sm
        INNER JOIN control_materiales cm ON sm.folio_material = cm.folio_material
        INNER JOIN unidades_materiales um ON cm.id_unidad_material = um.id_unidad_material
        INNER JOIN estados_materiales est ON sm.id_estado_material_salida = est.id_estado_material
        ORDER BY sm.fecha_registro_salida DESC
        LIMIT $limit OFFSET $offset";
    $res = @pg_query($conexion, $sql);
    $datos = [];
    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $datos[] = $row;
        }
    }
    echo json_encode(['status' => 'ok', 'datos' => $datos, 'total' => $total]);
    pg_close($conexion);
    exit;
}

// =================== ÚLTIMO FOLIO ===================
function consultasFolio() {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    $sql = "SELECT folio_material FROM control_materiales ORDER BY id_material DESC LIMIT 1";
    $res = @pg_query($conexion, $sql);
    $row = pg_fetch_assoc($res);

    echo json_encode(['folio_material' => $row['folio_material'] ?? null]);
    pg_close($conexion);
}