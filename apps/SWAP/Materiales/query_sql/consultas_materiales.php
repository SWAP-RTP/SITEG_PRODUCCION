<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function obtenerRegistrosMateriales($tipo, $limite = 20, $pagina = 1, $search = '') {
    $conexion = Database::conectar();

    if (!$conexion) {
        return ['status' => 'error', 'message' => 'No se pudo conectar a la base de datos.'];
    }

    $tipo = strtolower(trim((string)$tipo));
    $limite = intval($limite);
    $pagina = intval($pagina);
    if ($limite <= 0) {
        $limite = 20;
    }
    if ($pagina <= 0) {
        $pagina = 1;
    }
    $search = trim((string)$search);
    $tieneBusqueda = ($search !== '');
    $offset = ($pagina - 1) * $limite;

    $esPaginable = ($tipo === 'entrada' || $tipo === 'salida');
    $totalRegistros = 0;

    if ($tipo === 'entrada') {
        $sqlCount = "SELECT COUNT(*) AS total
            FROM entradas_materiales e
            JOIN control_materiales c ON e.codigo_material = c.codigo_material";
        $sql = "SELECT
                    e.folio_entrada,
                    e.codigo_material,
                    c.descripcion_material,
                    e.cantidad,
                    e.fecha_registro
                FROM entradas_materiales e
                JOIN control_materiales c ON e.codigo_material = c.codigo_material";

        if ($tieneBusqueda) {
            $where = " WHERE CAST(e.folio_entrada AS TEXT) ILIKE $1
                OR e.codigo_material ILIKE $1
                OR c.descripcion_material ILIKE $1";
            $sqlCount .= $where;
            $sql .= $where;
        }

        $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
        $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
        $sql .= " ORDER BY e.folio_entrada DESC LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
        $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
    } else if ($tipo === 'salida') {
        $tieneFolioSalida = false;
        $resColFolio = @pg_query(
            $conexion,
            "SELECT 1
             FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'salidas_materiales'
               AND column_name = 'folio_salida'
             LIMIT 1"
        );
        if ($resColFolio && pg_num_rows($resColFolio) > 0) {
            $tieneFolioSalida = true;
        }

        $sqlCount = "SELECT COUNT(*) AS total
            FROM salidas_materiales s
            JOIN control_materiales c ON s.codigo_material = c.codigo_material";

        $selectFolio = $tieneFolioSalida ? 's.folio_salida,' : "'' AS folio_salida,";
        $sql = "SELECT
                    $selectFolio
                    s.credencial,
                    s.codigo_material,
                    c.descripcion_material,
                    s.cantidad,
                    s.fecha_registro
                FROM salidas_materiales s
                JOIN control_materiales c ON s.codigo_material = c.codigo_material";

        if ($tieneBusqueda) {
            if ($tieneFolioSalida) {
                $where = " WHERE CAST(s.folio_salida AS TEXT) ILIKE $1
                    OR CAST(s.credencial AS TEXT) ILIKE $1
                    OR s.codigo_material ILIKE $1
                    OR c.descripcion_material ILIKE $1";
            } else {
                $where = " WHERE CAST(s.credencial AS TEXT) ILIKE $1
                    OR s.codigo_material ILIKE $1
                    OR c.descripcion_material ILIKE $1";
            }
            $sqlCount .= $where;
            $sql .= $where;
        }

        $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
        $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
        if ($tieneFolioSalida) {
            $sql .= " ORDER BY s.folio_salida DESC LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
        } else {
            $sql .= " ORDER BY s.fecha_registro DESC LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
        }
        $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
    } else if ($tipo === 'inventario') {
        $sql = "SELECT
                    c.codigo_material,
                    c.descripcion_material,
                    COALESCE(c.stock_actual, 0) AS stock_actual,
                    COALESCE(c.stock_minimo, 0) AS stock_minimo,
                    COALESCE(u.descripcion_unidad, 'N/A') AS unidad,
                    COALESCE(cat.nombre_categoria_material, 'N/A') AS categoria,
                    COALESCE(e.descripcion_estado_material, 'N/A') AS estado,
                    CASE
                        WHEN COALESCE(c.stock_actual, 0) <= 0 THEN 'agotado'
                        WHEN COALESCE(c.stock_actual, 0) <= COALESCE(c.stock_minimo, 0) THEN 'bajo'
                        ELSE 'disponible'
                    END AS estatus_stock
                FROM control_materiales c
                LEFT JOIN unidades_materiales u ON c.id_unidad = u.id_unidad
                LEFT JOIN categorias_materiales cat ON c.id_categoria_material = cat.id_categoria_material
                LEFT JOIN estados_materiales e ON c.id_estado_material = e.id_estado_material
                ORDER BY c.descripcion_material ASC";
        $params = [];
    } else {
        pg_close($conexion);
        return ['status' => 'error', 'message' => 'Tipo de consulta no valido. Usa entrada, salida o inventario.'];
    }

    if ($esPaginable) {
        $resCount = $tieneBusqueda ? @pg_query_params($conexion, $sqlCount, ['%' . $search . '%']) : @pg_query($conexion, $sqlCount);
        if (!$resCount) {
            $error = pg_last_error($conexion);
            pg_close($conexion);
            return ['status' => 'error', 'message' => 'Error al contar registros: ' . $error];
        }
        $rowCount = pg_fetch_assoc($resCount);
        $totalRegistros = intval($rowCount['total'] ?? 0);
    }

    if (empty($params)) {
        $res = @pg_query($conexion, $sql);
    } else {
        $res = @pg_query_params($conexion, $sql, $params);
    }

    if (!$res) {
        $error = pg_last_error($conexion);
        pg_close($conexion);
        return ['status' => 'error', 'message' => 'Error al consultar registros: ' . $error];
    }

    $registros = [];
    while ($row = pg_fetch_assoc($res)) {
        $registros[] = $row;
    }

    pg_close($conexion);

    if ($esPaginable) {
        $totalPaginas = max(1, (int)ceil($totalRegistros / $limite));
        return [
            'datos' => $registros,
            'total' => $totalRegistros,
            'pagina' => $pagina,
            'totalPaginas' => $totalPaginas,
            'limite' => $limite,
        ];
    }

    return $registros;
}

$tipo = $_GET['tipo'] ?? '';
$limite = $_GET['limite'] ?? 20;
$pagina = $_GET['pagina'] ?? 1;
$search = $_GET['search'] ?? '';

$resultado = obtenerRegistrosMateriales($tipo, $limite, $pagina, $search);
if (isset($resultado['status']) && $resultado['status'] === 'error') {
    http_response_code(400);
}

echo json_encode($resultado);
