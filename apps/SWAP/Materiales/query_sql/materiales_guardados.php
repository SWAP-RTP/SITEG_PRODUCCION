<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function guardarEntradaMaterial() {
    $conexion = Database::conectar();
    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.']);
        exit;
    }

    // Recibir datos (JSON)
    $data = json_decode(file_get_contents('php://input'), true);

    // Validar datos recibidos
    if (
        empty($data['folio_material']) ||
        empty($data['descripcion_material_entrada']) ||
        empty($data['id_estado_material_entrada']) ||
        empty($data['cantidad_material_entrada']) ||
        empty($data['adscripcion_modulo'])
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios.']);
        pg_close($conexion);
        exit;
    }

    // Preparar consulta segura
    $sql = "INSERT INTO entradas_materiales 
        (folio_material, descripcion_material_entrada, id_estado_material_entrada, cantidad_material_entrada, adscripcion_modulo)
        VALUES ($1, $2, $3, $4, $5)";
    $params = [
        $data['folio_material'],
        $data['descripcion_material_entrada'],
        $data['id_estado_material_entrada'],
        $data['cantidad_material_entrada'],
        $data['adscripcion_modulo']
    ];
    $result = @pg_query_params($conexion, $sql, $params);

    if ($result) {
        echo json_encode(['status' => 'ok', 'message' => 'Entrada registrada correctamente.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar: ' . pg_last_error($conexion)]);
    }

    pg_close($conexion);
}

guardarEntradaMaterial();