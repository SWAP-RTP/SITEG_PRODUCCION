<?php
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../helpers/usuarios.php';
require_once __DIR__ . '/../helpers/validacion.php';
header('Content-Type: application/json');

try {
    $conexion = conexion() ?: throw new Exception("Error de conexión.");

    $res = match(true) {
        isset($_GET['buscar_persona']) => buscarPersona($conexion, $_GET['buscar_persona']),
        isset($_GET['consulta'])       => consultarMateriales($conexion),
        default                        => registrarMateriales($conexion)
    };

    echo json_encode($res);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Error interno del servidor."
    ]);
}

function registrarMateriales($conexion) {

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        return ["success" => false, "error" => "No se recibieron datos."];
    }

    $required = [
        'codigo_material','material','grupo_pertenece','unidad_entrada',
        'cantidad_material','ubicacion_almacen','estado_material',
        'nombre_registra','id_credencial','area_adscripcion','fecha_registro'
    ];

    if (!validarCampos($input, $required)) {
        return ["success" => false, "error" => "Faltan campos obligatorios."];
    }

    // Validar que exista la persona
    $check = buscarPersona($conexion, $input['id_credencial']);
    if (!$check['success']) {
        return ["success" => false, "error" => "La credencial no existe."];
    }

    //  INSERT SEGURO (ANTI INYECCIÓN)
    $sql = "INSERT INTO catalogo_materiales (
        codigo_material, descripcion_material, grupo_pertenece, unidad_entrada,
        cantidad_material, ubicacion_almacen, estado_material, nombre_persona,
        id_credencial, area_adscripcion, fecha_registro
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";

    $params = [
        $input['codigo_material'],
        $input['material'],
        $input['grupo_pertenece'],
        $input['unidad_entrada'],
        $input['cantidad_material'],
        $input['ubicacion_almacen'],
        $input['estado_material'],
        $input['nombre_registra'],
        $input['id_credencial'],
        $input['area_adscripcion'],
        $input['fecha_registro']
    ];

    $result = pg_query_params($conexion, $sql, $params);

    if (!$result) {
        return [
            "success" => false,
            "error" => "No se pudo registrar el material."
        ];
    }

    return ["success" => true];
}


// CONSULTA DE MATERIALES
function consultarMateriales($conexion) {

    $sql = "SELECT * FROM catalogo_materiales ORDER BY codigo_material DESC";
    $result = pg_query($conexion, $sql);

    if (!$result) {
        return ["success" => false, "error" => "Error en consulta."];
    }

    return [
        "success" => true,
        "data"    => pg_fetch_all($result) ?: []
    ];
}