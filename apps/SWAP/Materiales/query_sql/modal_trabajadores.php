<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception("Conexión fallida a la BD");
    }

    // parámetros
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = trim($_GET['search'] ?? '');

    // query base
    $sql = "SELECT credencial, nombre FROM trabajadores_materiales";
    $params = [];

    // filtro opcional
    if (!empty($search)) {
        $sql .= " WHERE nombre ILIKE $1 OR credencial::text ILIKE $1";
        $params[] = "%$search%";
    }

    // orden + paginación
    $sql .= " ORDER BY nombre ASC, credencial ASC LIMIT $limit OFFSET $offset";

    // ejecutar
    $result = empty($params)
        ? pg_query($conexion, $sql)
        : pg_query_params($conexion, $sql, $params);

    if (!$result) {
        throw new Exception("Error en la consulta: " . pg_last_error($conexion));
    }

    $trabajadores = pg_fetch_all($result);

    echo json_encode($trabajadores ? $trabajadores : []);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "mensaje" => $e->getMessage()
    ]);
    error_log($e->getMessage());
}

exit();