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

    $data = json_decode(file_get_contents('php://input'), true);

    // Si NO hay folio, primero crea el material en la tabla maestra y obtén el folio generado
    if (empty($data['folio_material'])) {
        // Validar campos requeridos para crear material
        if (
            empty($data['descripcion_material_entrada']) ||
            empty($data['id_unidad_material']) ||
            empty($data['id_categoria_material']) ||
            empty($data['adscripcion_modulo'])
        ) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Faltan datos para crear el material.']);
            pg_close($conexion);
            exit;
        }

        // 1. Insertar en control_materiales y obtener folio generado
        $sql_control = "INSERT INTO control_materiales (descripcion_material, id_unidad_material, id_categoria_material, adscripcion)
            VALUES ($1, $2, $3, $4) RETURNING folio_material";
        $params_control = [
            $data['descripcion_material_entrada'],
            $data['id_unidad_material'],
            $data['id_categoria_material'],
            $data['adscripcion_modulo']
        ];
        $res_control = pg_query_params($conexion, $sql_control, $params_control);
        if (!$res_control) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al crear material: ' . pg_last_error($conexion)]);
            pg_close($conexion);
            exit;
        }
        $row_control = pg_fetch_assoc($res_control);
        $data['folio_material'] = $row_control['folio_material'];
    }

    // Validar datos para la entrada
    if (
        empty($data['folio_material']) ||
        empty($data['descripcion_material_entrada']) ||
        empty($data['id_estado_material_entrada']) ||
        empty($data['cantidad_material_entrada']) ||
        empty($data['adscripcion_modulo'])
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios para la entrada.']);
        pg_close($conexion);
        exit;
    }

    // Insertar en entradas_materiales
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
        echo json_encode(['status' => 'ok', 'message' => 'Entrada registrada correctamente.', 'folio_generado' => $data['folio_material']]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar: ' . pg_last_error($conexion)]);
    }

    pg_close($conexion);
}

guardarEntradaMaterial();