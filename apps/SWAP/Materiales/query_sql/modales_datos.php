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

    } elseif ($tipo === 'entradas') {
        // JOIN para obtener descripcion_material desde control_materiales
        $baseSql = "FROM entradas_materiales e JOIN control_materiales c ON e.codigo_material = c.codigo_material";
        $selectSql = "SELECT e.codigo_material, c.descripcion_material, e.cantidad, e.id_unidad, e.id_estado_material, e.id_categoria_material, e.adscripcion $baseSql";
        $countSql = "SELECT COUNT(*) as total FROM entradas_materiales e";
        if (!empty($search)) {
            $baseSql .= " WHERE (c.descripcion_material ILIKE $1 OR e.codigo_material ILIKE $1)";
            $selectSql = "SELECT e.codigo_material, c.descripcion_material, e.cantidad, e.id_unidad, e.id_estado_material, e.id_categoria_material, e.adscripcion $baseSql";
            $countSql = "SELECT COUNT(*) as total FROM entradas_materiales e JOIN control_materiales c ON e.codigo_material = c.codigo_material WHERE (c.descripcion_material ILIKE $1 OR e.codigo_material ILIKE $1)";
            $params[] = "%$search%";
        }
        $countResult = empty($params)
            ? pg_query($conexion, $countSql)
            : pg_query_params($conexion, $countSql, $params);
        if ($countResult) {
            $countRow = pg_fetch_assoc($countResult);
            $total = (int)$countRow['total'];
        }
        $sqlParams = $params;
        $selectSql .= " ORDER BY e.id_entrada DESC LIMIT $limit OFFSET $offset";
        $result = empty($sqlParams)
            ? pg_query($conexion, $selectSql)
            : pg_query_params($conexion, $selectSql, $sqlParams);
    } elseif ($tipo === 'salidas') {
        // Mostrar los movimientos de entradas_materiales con JOIN al catálogo para descripción (igual que entradas)
        $baseSql = "FROM entradas_materiales e JOIN control_materiales c ON e.codigo_material = c.codigo_material";
        $selectSql = "SELECT e.codigo_material, c.descripcion_material, e.cantidad, e.id_unidad, e.id_estado_material, e.id_categoria_material, e.adscripcion, e.fecha_registro $baseSql";
        $countSql = "SELECT COUNT(*) as total FROM entradas_materiales e";
        if (!empty($search)) {
            $baseSql .= " WHERE (c.descripcion_material ILIKE $1 OR e.codigo_material ILIKE $1)";
            $selectSql = "SELECT e.codigo_material, c.descripcion_material, e.cantidad, e.id_unidad, e.id_estado_material, e.id_categoria_material, e.adscripcion, e.fecha_registro $baseSql";
            $countSql = "SELECT COUNT(*) as total FROM entradas_materiales e JOIN control_materiales c ON e.codigo_material = c.codigo_material WHERE (c.descripcion_material ILIKE $1 OR e.codigo_material ILIKE $1)";
            $params[] = "%$search%";
        }
        $countResult = empty($params)
            ? pg_query($conexion, $countSql)
            : pg_query_params($conexion, $countSql, $params);
        if ($countResult) {
            $countRow = pg_fetch_assoc($countResult);
            $total = (int)$countRow['total'];
        }
        $sqlParams = $params;
        $selectSql .= " ORDER BY e.id_entrada DESC LIMIT $limit OFFSET $offset";
        $result = empty($sqlParams)
            ? pg_query($conexion, $selectSql)
            : pg_query_params($conexion, $selectSql, $sqlParams);
    } else {
        throw new Exception("Tipo de modal no válido: $tipo. Use 'trabajadores', 'materiales', 'entradas' o 'salidas'");
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
