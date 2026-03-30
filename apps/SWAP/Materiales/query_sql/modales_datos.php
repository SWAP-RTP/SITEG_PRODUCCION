<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception("Conexión fallida a la BD");
    }

    // obtener tipo de modal
    $tipo = sanitizeInput($_GET['tipo'] ?? '');
    
    if (empty($tipo)) {
        throw new Exception("Parámetro 'tipo' requerido (trabajadores|materiales)");
    }

    // parámetros comunes
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = trim($_GET['search'] ?? '');
    $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;

    if ($pagina < 1) $pagina = 1;
    if ($limit < 1) $limit = 10;
    
    // Recalcular offset desde página
    $offset = ($pagina - 1) * $limit;

    $sql = '';
    $countSql = '';
    $params = [];
    $result = null;
    $total = 0;

    // lógica por tipo
    if ($tipo === 'trabajadores') {
        $baseSql = "FROM trabajadores_materiales";
        $selectSql = "SELECT credencial, nombre $baseSql";
        $countSql = "SELECT COUNT(*) as total $baseSql";
        
        if (!empty($search)) {
            $baseSql .= " WHERE nombre ILIKE $1 OR credencial::text ILIKE $1";
            $selectSql = "SELECT credencial, nombre $baseSql";
            $countSql = "SELECT COUNT(*) as total $baseSql";
            $params[] = "%$search%";
        }
        
        // Obtener total
        $countResult = empty($params)
            ? pg_query($conexion, $countSql)
            : pg_query_params($conexion, $countSql, $params);
        
        if ($countResult) {
            $countRow = pg_fetch_assoc($countResult);
            $total = (int)$countRow['total'];
        }

        // Construir query con paginación
        $sqlParams = $params;
        $selectSql .= " ORDER BY nombre ASC, credencial ASC LIMIT $limit OFFSET $offset";
        
        $result = empty($sqlParams)
            ? pg_query($conexion, $selectSql)
            : pg_query_params($conexion, $selectSql, $sqlParams);

    } elseif ($tipo === 'materiales') {
        $baseSql = "FROM control_materiales";
        $selectSql = "SELECT codigo_material, descripcion_material $baseSql";
        $countSql = "SELECT COUNT(*) as total $baseSql";
        
        if (!empty($search)) {
            $baseSql .= " WHERE descripcion_material ILIKE $1 OR codigo_material ILIKE $1";
            $selectSql = "SELECT codigo_material, descripcion_material $baseSql";
            $countSql = "SELECT COUNT(*) as total $baseSql";
            $params[] = "%$search%";
        }
        
        // Obtener total
        $countResult = empty($params)
            ? pg_query($conexion, $countSql)
            : pg_query_params($conexion, $countSql, $params);
        
        if ($countResult) {
            $countRow = pg_fetch_assoc($countResult);
            $total = (int)$countRow['total'];
        }

        // Construir query con paginación
        $sqlParams = $params;
        $selectSql .= " ORDER BY codigo_material ASC, descripcion_material ASC LIMIT $limit OFFSET $offset";
        
        $result = empty($sqlParams)
            ? pg_query($conexion, $selectSql)
            : pg_query_params($conexion, $selectSql, $sqlParams);

    } else {
        throw new Exception("Tipo de modal no válido: $tipo. Use 'trabajadores' o 'materiales'");
    }

    if (!$result) {
        throw new Exception("Error en la consulta: " . pg_last_error($conexion));
    }

    $datos = pg_fetch_all($result);
    
    // Calcular páginas totales
    $totalPaginas = ceil($total / $limit);

    echo json_encode([
        'datos' => $datos ? $datos : [],
        'total' => $total,
        'pagina' => $pagina,
        'limite' => $limit,
        'totalPaginas' => $totalPaginas,
        'offset' => $offset
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "mensaje" => $e->getMessage()
    ]);
    error_log($e->getMessage());
}

// función auxiliar para limpiar entrada
function sanitizeInput($input) {
    return trim(preg_replace('/[^a-z_-]/i', '', $input));
}

exit();
