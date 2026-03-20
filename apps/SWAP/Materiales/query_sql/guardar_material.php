<?php
header('Content-Type: application/json');
require '/var/www/login_shared/conf/conexion.php';
$conexion = Database::conectar();

/**
 * Guarda una entrada de material en el inventario.
 * Si el material es nuevo, lo inserta en control_materiales.
 * Si ya existe, actualiza el stock_actual.
 * Siempre registra la entrada en entradas_materiales.
 */
function guardarEntradaMaterial($conexion, $datos) {
    $codigo = isset($datos['codigo_material']) ? strtoupper($datos['codigo_material']) : '';
    $descripcion = isset($datos['descripcion']) ? strtoupper($datos['descripcion']) : '';
    $categoria = $datos['id_categoria_material'] ?? null;
    $unidad = isset($datos['unidad']) ? strtoupper($datos['unidad']) : '';
    $estado = isset($datos['estado_material']) ? strtoupper($datos['estado_material']) : '';
    $cantidad = intval($datos['cantidad_material'] ?? 0);
    $ubicacion = isset($datos['ubicacion']) ? strtoupper($datos['ubicacion']) : '';

    // Validar campos obligatorios
    if (!$codigo || !$descripcion || !$unidad || !$estado || $cantidad <= 0) {
        return ['success' => false, 'error' => 'Faltan campos obligatorios o cantidad inválida'];
    }

    // Verificar si el material ya existe
    $sql_check = "SELECT codigo_material FROM control_materiales WHERE codigo_material = $1";
    $res_check = pg_query_params($conexion, $sql_check, [$codigo]);

    if (pg_num_rows($res_check) === 0) {
        // Material nuevo: insertar en control_materiales
        $sql_insert = "INSERT INTO control_materiales (codigo_material, descripcion_material, id_categoria_material, id_unidad, id_estado_material, stock_actual, ubicacion_fisica)
                       VALUES ($1, $2, $3, $4, $5, $6, $7)";
        $params_insert = [$codigo, $descripcion, $categoria, $unidad, $estado, $cantidad, $ubicacion];
        $res_insert = pg_query_params($conexion, $sql_insert, $params_insert);
        if (!$res_insert) {
            return ['success' => false, 'error' => 'Error al guardar material nuevo'];
        }
    } else {
        // Material existente: actualizar stock_actual
        $sql_update = "UPDATE control_materiales SET stock_actual = stock_actual + $1 WHERE codigo_material = $2";
        $res_update = pg_query_params($conexion, $sql_update, [$cantidad, $codigo]);
        if (!$res_update) {
            return ['success' => false, 'error' => 'Error al actualizar stock'];
        }
    }

    // Registrar la entrada en entradas_materiales
    $sql_entrada = "INSERT INTO entradas_materiales (codigo_material, cantidad) VALUES ($1, $2)";
    $res_entrada = pg_query_params($conexion, $sql_entrada, [$codigo, $cantidad]);

    if ($res_entrada) {
        return ['success' => true, 'mensaje' => 'Entrada registrada correctamente'];
    } else {
        return ['success' => false, 'error' => 'Error al registrar entrada'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $resultado = guardarEntradaMaterial($conexion, $_POST);
    echo json_encode($resultado);
    pg_close($conexion);
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>