<?php
require_once __DIR__ . '/../../config/conexion.php';
function RegistrarMateriales()
{
    $conexion = conexion(); // Usar la función del archivo incluido
    if (!$conexion) {
        return array("success" => false, "error" => "Error de conexión a la base de datos");
    }

    $input = json_decode(file_get_contents('php://input'), true);
 $sql = "INSERT INTO catalogo_Materiales (codigo_material,descripcion_material,grupo_pertenece,unidad_entrada,
                                           existencia_minima,ubicacion_almacen,estado_material,nombre_persona,id_credencial,
                                           area_adscripcion) VALUES ('{$input['codigo_material']}','{$input['material']}','{$input['grupo_pertenece']}',
                                           '{$input['unidad_entrada']}',{$input['existencia_minima']},'{$input['ubicacion_almacen']}',
                                           '{$input['estado_material']}','{$input['nombre_registra']}','{$input['id_credencial']}','{$input['area_adscripcion']}'    
       )";

    $resultado = @pg_query($conexion, $sql);

    if (!$resultado) {
        return array("success" => false, "error" => "Error en la consulta SQL");
    }

    $json = array();
    while ($row = @pg_fetch_assoc($resultado)) {
        $json[] = $row;
    }

    @pg_close($conexion);

    return array("success" => true, "data" => $json);
}

// Ejecuta la función y muestra el resultado como JSON
echo json_encode(RegistrarMateriales());
