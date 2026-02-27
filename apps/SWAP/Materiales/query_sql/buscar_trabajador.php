<?php
// Conexión a la base de datos
require_once __DIR__ . '/../../config/conexion.php'; 

header('Content-Type: application/json');

$db = conexion();
if (!$db) {
    echo json_encode(["status" => "error", "message" => "Error de conexión"]);
    exit;
}

// Obtener la credencial desde el JS
$credencial = isset($_GET['credencial']) ? trim($_GET['credencial']) : '';

if (empty($credencial)) {
    echo json_encode(["status" => "error", "message" => "Credencial vacía"]);
    exit;
}

try {
    
    $sql = "SELECT trab_nombre, trab_apaterno, trab_amaterno FROM trabajador WHERE trab_credencial = $1 LIMIT 1";
    
    $result = pg_query_params($db, $sql, array($credencial));

    if ($result && pg_num_rows($result) > 0) {
        $row = pg_fetch_assoc($result);
        echo json_encode([
            "status" => "success",
            "nombre" => strtoupper($row['trab_nombre'] . " " . $row['trab_apaterno'] . " " . $row['trab_amaterno']) 
        ]);
    } else {
        echo json_encode(["status" => "not_found"]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

pg_close($db);