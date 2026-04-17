<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

// Endpoint para obtener todos los registros de entradas de materiales
if (isset($_GET['tipo']) && $_GET['tipo'] === 'entradas') {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

        $sql = "SELECT em.folio_material, em.descripcion_material_entrada, um.descripcion_unidad_material, em.cantidad_material_entrada, em.fecha_registro_entrada, em.adscripcion_modulo, em.id_estado_material_entrada, est.descripcion_estado_material
            FROM entradas_materiales em
            INNER JOIN control_materiales cm ON em.folio_material = cm.folio_material
            INNER JOIN unidades_materiales um ON cm.id_unidad_material = um.id_unidad_material
            INNER JOIN estados_materiales est ON em.id_estado_material_entrada = est.id_estado_material
            ORDER BY em.fecha_registro_entrada DESC
            LIMIT 100";
    $res = @pg_query($conexion, $sql);
    $datos = [];
    if ($res) {
        while ($row = pg_fetch_assoc($res)) {
            $datos[] = $row;
        }
    }
    echo json_encode(['status' => 'ok', 'datos' => $datos]);
    pg_close($conexion);
    exit;
}

// Endpoint anterior para obtener solo el último folio
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