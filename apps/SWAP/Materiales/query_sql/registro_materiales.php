<?php
require_once __DIR__ . '/../../config/conexion.php';
function getModulos_Sistem()
{
    $conexion = conexion(); // Usar la función del archivo incluido
    if (!$conexion) {
        return array("success" => false, "error" => "Error de conexión a la base de datos");
    }

    $sql = "SELECT * FROM catalogo_materiales";
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
echo json_encode(getModulos_Sistem());
?>