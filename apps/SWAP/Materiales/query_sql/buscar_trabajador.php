<?php
require_once __DIR__ . '/../../config/conexion.php'; 
header('Content-Type: application/json');

$db = conexion();
$credencial = isset($_GET['credencial']) ? trim($_GET['credencial']) : '';

if (!$db || empty($credencial)) {
    echo json_encode(["status" => "error", "message" => "Datos insuficientes"]);
    exit;
}

try {
    // Consultamos nombre y apellidos
    $sql = "SELECT trab_nombre, trab_apaterno, trab_amaterno 
            FROM trabajador 
            WHERE trab_credencial = $1 LIMIT 1";
    
    $result = pg_query_params($db, $sql, array($credencial));

    if ($result && pg_num_rows($result) > 0) {
        $row = pg_fetch_assoc($result);
        
        // Concatenamos para formar el nombre completo
        $nombreCompleto = $row['trab_nombre'] . " " . $row['trab_apaterno'] . " " . $row['trab_amaterno'];
        
        echo json_encode([
            "status" => "success",
            "nombre" => strtoupper(trim($nombreCompleto)) // Lo mandamos en mayúsculas y sin espacios extra
        ]);
    } else {
        echo json_encode(["status" => "not_found"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

pg_close($db);