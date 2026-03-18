<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');
require(__DIR__ . '/../../config/conexion.php');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['trabajador']) || !isset($data['materiales'])) {
        throw new Exception("Datos incompletos.");
    }

    $conexion = conexion();
    if (!$conexion) throw new Exception("Error de conexión.");

    foreach ($data['materiales'] as $mat) {
        $codigo = pg_escape_string($conexion, $mat['codigo']);
        $cantidad = intval($mat['cantidad']);
        $estado = pg_escape_string($conexion, $mat['estado_id']);
        $trabajador = intval($data['trabajador']);

        // Validar stock actual
        $res = pg_query($conexion, "SELECT stock_actual FROM control_materiales WHERE codigo_material='$codigo'");
        $row = pg_fetch_assoc($res);
        if (!$row || $row['stock_actual'] < $cantidad) {
            throw new Exception("Stock insuficiente para $codigo.");
        }

        // Restar stock
        $upd = pg_query($conexion, "UPDATE control_materiales SET stock_actual = stock_actual - $cantidad WHERE codigo_material='$codigo'");
        if (!$upd) throw new Exception("Error al actualizar stock de $codigo.");

        // Registrar salida en salidas_materiales
        $ins = pg_query($conexion, "
            INSERT INTO salidas_materiales (
                trab_credencial, codigo_material, cantidad_material, id_estado_material, fecha
            ) VALUES (
                $trabajador, '$codigo', $cantidad, '$estado', CURRENT_DATE
            )
        ");
        if (!$ins) throw new Exception("Error al registrar salida de $codigo.");
    }

    echo json_encode(['success' => true, 'mensaje' => 'Salida registrada correctamente.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}
exit;
