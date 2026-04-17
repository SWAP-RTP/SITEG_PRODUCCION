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

    // 1. SI NO HAY FOLIO, CREAMOS EL MATERIAL PRIMERO
    if (empty($data['folio_material'])) {
        if (empty($data['descripcion_material_entrada']) || empty($data['id_unidad_material']) || 
            empty($data['id_categoria_material']) || empty($data['adscripcion_modulo'])) {
            
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Faltan datos para crear el material nuevo.']);
            pg_close($conexion);
            exit;
        }

        $sql_control = "INSERT INTO control_materiales (descripcion_material, id_unidad_material, id_categoria_material, adscripcion_modulo)
                        VALUES ($1, $2, $3, $4) RETURNING folio_material";
        
        $res_control = pg_query_params($conexion, $sql_control, [
            $data['descripcion_material_entrada'],
            $data['id_unidad_material'],
            $data['id_categoria_material'],
            $data['adscripcion_modulo']
        ]);

        if (!$res_control) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error al crear material: ' . pg_last_error($conexion)]);
            pg_close($conexion);
            exit;
        }
        $row_control = pg_fetch_assoc($res_control);
        $data['folio_material'] = $row_control['folio_material'];
    }

    // 2. VALIDACIÓN FINAL PARA LA ENTRADA
    if (empty($data['folio_material']) || empty($data['cantidad_material_entrada']) || empty($data['id_estado_material_entrada'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios para la entrada.']);
        pg_close($conexion);
        exit;
    }

    // 3. REGISTRAR LA ENTRADA 
    // Al ejecutar este INSERT, el Trigger de la BD sumará el stock automáticamente.
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

    $result = pg_query_params($conexion, $sql, $params);

    if ($result) {
        echo json_encode([
            'status' => 'ok', 
            'message' => 'Entrada registrada y stock actualizado automáticamente.', 
            'folio' => $data['folio_material']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar entrada: ' . pg_last_error($conexion)]);
    }

    pg_close($conexion);
}

guardarEntradaMaterial();