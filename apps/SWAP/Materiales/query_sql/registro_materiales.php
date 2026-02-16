<?php
require_once __DIR__ . '/../../config/conexion.php';

// Si viene el parámetro GET 'consulta', ejecuta la consulta y termina
if (isset($_GET['consulta'])) {
    echo json_encode(ConsultarMateriales());
    exit;
}

// Si no, ejecuta el registro normalmente
echo json_encode(RegistrarMateriales());

/**
 * Inserta un nuevo material en la base de datos
 */
function RegistrarMateriales()
{
    $conexion = conexion();
    if (!$conexion) {
        return array("success" => false, "error" => "Error de conexión a la base de datos");
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $required = [
        'codigo_material', 'material', 'grupo_pertenece', 'unidad_entrada',
        'existencia_minima', 'ubicacion_almacen', 'estado_material',
        'nombre_registra', 'id_credencial', 'area_adscripcion'
    ];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            return array("success" => false, "error" => "Debes rellenar todos los campos obligatorios.");
        }
    }

    $sql = "INSERT INTO catalogo_Materiales (
                codigo_material, descripcion_material, grupo_pertenece, unidad_entrada,
                existencia_minima, ubicacion_almacen, estado_material, nombre_persona,
                id_credencial, area_adscripcion
            ) VALUES (
                '{$input['codigo_material']}',
                '{$input['material']}',
                '{$input['grupo_pertenece']}',
                '{$input['unidad_entrada']}',
                {$input['existencia_minima']},
                '{$input['ubicacion_almacen']}',
                '{$input['estado_material']}',
                '{$input['nombre_registra']}',
                '{$input['id_credencial']}',
                '{$input['area_adscripcion']}'
            )";

    $resultado = @pg_query($conexion, $sql);

    if (!$resultado) {
        return array("success" => false, "error" => pg_last_error($conexion));
    }

    @pg_close($conexion);

    return array("success" => true);
}

/**
 * Consulta todos los materiales registrados
 */
function ConsultarMateriales()
{
    $conexion = conexion();
    if (!$conexion) {
        return array("success" => false, "error" => "Error de conexión a la base de datos");
    }
    $sql = "SELECT codigo_material, descripcion_material, grupo_pertenece, unidad_entrada, existencia_minima, ubicacion_almacen, estado_material, nombre_persona, id_credencial, area_adscripcion, fecha_registro FROM catalogo_Materiales ORDER BY codigo_material DESC";
    $resultado = @pg_query($conexion, $sql);
    if (!$resultado) {
        return array("success" => false, "error" => pg_last_error($conexion));
    }
    $json = array();
    while ($row = @pg_fetch_assoc($resultado)) {
        $json[] = $row;
    }
    @pg_close($conexion);
    return array("success" => true, "data" => $json);
}


