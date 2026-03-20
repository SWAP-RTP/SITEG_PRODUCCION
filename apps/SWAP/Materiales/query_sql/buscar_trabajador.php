<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function buscar_Trabajador($credencial)
{
    $conexion = Database::conectar();
    

    if (!$conexion) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión']);
        exit;
    }
    $credencial = trim($credencial);
    if (empty($credencial)) {
        return ['nombre' => '']; 
    }

    $query = "SELECT nombre FROM trabajadores_materiales WHERE credencial = $1";
    $result = pg_query_params($conexion, $query, array($credencial));

    if (!$result) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la consulta: ' . pg_last_error($conexion)]);
        exit;
    }

    $row = pg_fetch_assoc($result);
    
    return $row ? ['nombre' => trim($row['nombre'])] : ['nombre' => ''];
}
echo json_encode(buscar_Trabajador($_GET['credencial'] ?? ''));

