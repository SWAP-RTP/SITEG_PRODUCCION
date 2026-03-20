<?php
header('Content-Type: application/json; charset=utf-8');
try {
    require '/var/www/login_shared/conf/conexion.php';
    if (!class_exists('Database')) {
        throw new Exception('Clase Database no encontrada');
    }
    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception('Error de conexión');
    }
    $credencial = trim($_GET['credencial'] ?? '');
    if (empty($credencial)) {
        echo json_encode(['nombre' => '']);
        exit;
    }
    $query = "SELECT nombre FROM trabajadores_materiales WHERE credencial = $1";
    $result = pg_query_params($conexion, $query, array($credencial));
    if (!$result) {
        throw new Exception('Error en la consulta: ' . pg_last_error($conexion));
    }
    $row = pg_fetch_assoc($result);
    echo json_encode($row ? ['nombre' => trim($row['nombre'])] : ['nombre' => '']);
    pg_close($conexion);
} catch (Exception $e) {
    echo json_encode(['error' => 'Excepción PHP', 'detalle' => $e->getMessage()]);
}

