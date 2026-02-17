<?php


require_once __DIR__ . '/../../config/conexion.php';

// Configuramos la respuesta siempre como JSON
header('Content-Type: application/json');

try {
    $conn = conexion();
    if (!$conn) throw new Exception("No se pudo conectar a la base de datos.");

    // 1. Lógica para buscar persona (Autocompletado)
    if (isset($_GET['buscar_persona'])) {
        echo json_encode(buscarPersona($conn, $_GET['buscar_persona']));
        exit;
    }

    // 2. Consulta de materiales
    if (isset($_GET['consulta'])) {
        echo json_encode(ConsultarMateriales($conn));
        exit;
    }

    // 3. Registro de materiales (si no es ninguna de las anteriores)
    echo json_encode(RegistrarMateriales($conn));

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}



function buscarPersona($conn, $id) {
    $sql = "SELECT nombre FROM usuarios WHERE trab_credencial = '$id' LIMIT 1";
    $result = pg_query($conn, $sql);
    $persona = pg_fetch_assoc($result);
    return $persona ? ["success" => true, "nombre" => $persona['nombre']] : ["success" => false, "nombre" => ""];
}

function RegistrarMateriales($conn) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) return ["success" => false, "error" => "No se recibieron datos."];

    $required = [
        'codigo_material', 'material', 'grupo_pertenece', 'unidad_entrada',
        'cantidad_material', 'ubicacion_almacen', 'estado_material',
        'nombre_registra', 'id_credencial', 'area_adscripcion', 'fecha_registro'
    ];
    foreach ($required as $field) {
        if (empty($input[$field])) return ["success" => false, "error" => "¡Faltan campos obligatorios por llenar!."];
    }

    // Validar que la credencial exista en la base de datos
    $credencial = $input['id_credencial'];
    $sql_check = "SELECT 1 FROM usuarios WHERE trab_credencial = '$credencial' LIMIT 1";
    $result_check = pg_query($conn, $sql_check);
    if (!pg_fetch_assoc($result_check)) {
        return ["success" => false, "error" => "La credencial ingresada no existe en la base de datos."];
    }

    $sql = "INSERT INTO catalogo_Materiales (
        codigo_material, descripcion_material, grupo_pertenece, unidad_entrada,
        cantidad_material, ubicacion_almacen, estado_material, nombre_persona,
        id_credencial, area_adscripcion, fecha_registro
    ) VALUES (
        '{$input['codigo_material']}', '{$input['material']}', '{$input['grupo_pertenece']}', '{$input['unidad_entrada']}',
        '{$input['cantidad_material']}', '{$input['ubicacion_almacen']}', '{$input['estado_material']}', '{$input['nombre_registra']}',
        '{$input['id_credencial']}', '{$input['area_adscripcion']}','{$input['fecha_registro']}'
    )";
    $result = pg_query($conn, $sql);
    return ["success" => $result ? true : false];
}

function ConsultarMateriales($conn) {
    $sql = "SELECT * FROM catalogo_Materiales ORDER BY codigo_material DESC";
    $result = pg_query($conn, $sql);
    $data = [];
    while ($row = pg_fetch_assoc($result)) {
        $data[] = $row;
    }
    return ["success" => true, "data" => $data];
}