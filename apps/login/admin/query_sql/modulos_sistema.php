<?php
require_once __DIR__ . '/../../conf/conexion.php';
function getModulos_sistema()
{
    try {
        $conexion = Database::conectar();
        if (!$conexion) {
            throw new Exception("Error al conectar con la DB");
        }
        $sqlmodulosSistema = "SELECT * FROM modulo_sistem";
        $resultadoModulosSistema = pg_query($conexion, $sqlmodulosSistema);
        if (!$resultadoModulosSistema) {
            throw new Exception("Error al ejecutar la consulta: " . pg_last_error($conexion));
        }
        $modulosSistema = pg_fetch_all($resultadoModulosSistema);
        return $modulosSistema ?: [];//SI NO HAY DATOS RETORNA UN ARRAY VACIO
    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}
//Devuelve solo un array de los modulos
echo json_encode(getModulos_sistema());