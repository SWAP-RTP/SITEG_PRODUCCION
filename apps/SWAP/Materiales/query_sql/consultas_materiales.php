<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

function tablaTieneColumna($conexion, $tabla, $columna) {
        $sql = "SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                            AND table_name = $1
                            AND column_name = $2
                        LIMIT 1";

        $res = @pg_query_params($conexion, $sql, [$tabla, $columna]);
        return $res && pg_num_rows($res) > 0;
}

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
        $tieneSnapshotMovimiento = tablaTieneColumna($conexion, 'entradas_materiales', 'id_unidad');

        if ($tieneSnapshotMovimiento) {
                $selectUnidad = "COALESCE(u.descripcion_unidad, 'N/A') AS unidad";
                $joinsExtra = '';
                $groupFields = ['e.codigo_material', 'c.descripcion_material', 'e.id_unidad', 'u.descripcion_unidad'];
                $searchFields = ['e.codigo_material ILIKE $1', 'c.descripcion_material ILIKE $1', "COALESCE(u.descripcion_unidad, 'N/A') ILIKE $1"];

                if (tablaTieneColumna($conexion, 'entradas_materiales', 'id_estado_material')) {
                    $joinsExtra .= ' LEFT JOIN estados_materiales es ON e.id_estado_material = es.id_estado_material';
                    $groupFields[] = 'e.id_estado_material';
                }
                if (tablaTieneColumna($conexion, 'entradas_materiales', 'id_categoria_material')) {
                    $joinsExtra .= ' LEFT JOIN categorias_materiales catm ON e.id_categoria_material = catm.id_categoria_material';
                    $groupFields[] = 'e.id_categoria_material';
                }
                if (tablaTieneColumna($conexion, 'entradas_materiales', 'adscripcion')) {
                    $groupFields[] = 'e.adscripcion';
                }

                $baseFrom = " FROM entradas_materiales e
                    JOIN control_materiales c ON e.codigo_material = c.codigo_material
                    LEFT JOIN unidades_materiales u ON e.id_unidad = u.id_unidad"
                    . $joinsExtra;
                $selectBase = "SELECT
                        e.codigo_material AS folio_entrada,
                        c.descripcion_material,
                        $selectUnidad,
                        SUM(e.cantidad) AS cantidad,
                        MAX(e.fecha_registro) AS fecha_registro";
                $groupBy = ' GROUP BY ' . implode(', ', $groupFields);
                $orderBy = " ORDER BY MAX(e.fecha_registro) DESC";
                $searchField = implode(' OR ', $searchFields);
                $sqlCount = "SELECT COUNT(*) AS total FROM (" . $selectBase . $baseFrom . ($tieneBusqueda ? " WHERE " . $searchField : "") . $groupBy . ") x";
                $sql = $selectBase . $baseFrom . ($tieneBusqueda ? " WHERE " . $searchField : "") . $groupBy . $orderBy;
        } else {
            $sqlCount = "SELECT COUNT(*) AS total
                FROM entradas_materiales e
                JOIN control_materiales c ON e.codigo_material = c.codigo_material";
            $sql = "SELECT
                        e.codigo_material AS folio_entrada,
                        c.descripcion_material,
                        '' AS unidad,
                        e.cantidad,
                        e.fecha_registro
                    FROM entradas_materiales e
                    JOIN control_materiales c ON e.codigo_material = c.codigo_material";

            if ($tieneBusqueda) {
                $where = " WHERE e.codigo_material ILIKE $1
                    OR c.descripcion_material ILIKE $1";
                $sqlCount .= $where;
                $sql .= $where;
            }

            $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
            $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
            $sql .= " ORDER BY e.id_entrada DESC LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
            $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
        }

        if ($tieneSnapshotMovimiento) {
            $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
            $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
            $sql .= " LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
            $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
        }
    } else if ($tipo === 'salida') {
        $tieneSnapshotMovimiento = tablaTieneColumna($conexion, 'salidas_materiales', 'id_unidad');

        if ($tieneSnapshotMovimiento) {
            $baseFrom = " FROM salidas_materiales s
                JOIN control_materiales c ON s.codigo_material = c.codigo_material
                LEFT JOIN unidades_materiales u ON s.id_unidad = u.id_unidad";
            $selectBase = "SELECT
                    s.codigo_material AS folio_salida,
                    COALESCE(s.credencial, '') AS credencial,
                    c.descripcion_material,
                    COALESCE(u.descripcion_unidad, 'N/A') AS unidad,
                    SUM(s.cantidad) AS cantidad,
                    MAX(s.fecha_registro) AS fecha_registro";
            $groupBy = " GROUP BY s.codigo_material, s.credencial, c.descripcion_material, s.id_unidad, u.descripcion_unidad";
            $orderBy = " ORDER BY MAX(s.fecha_registro) DESC";
            $searchField = "s.codigo_material ILIKE $1 OR CAST(s.credencial AS TEXT) ILIKE $1 OR c.descripcion_material ILIKE $1 OR COALESCE(u.descripcion_unidad, 'N/A') ILIKE $1";
            $sqlBase = $selectBase . $baseFrom;
            $sqlCount = "SELECT COUNT(*) AS total FROM (" . $selectBase . $baseFrom . ($tieneBusqueda ? " WHERE " . $searchField : "") . $groupBy . ") x";
            $sql = $sqlBase . ($tieneBusqueda ? " WHERE " . $searchField : "") . $groupBy . $orderBy;
        } else {
            $sqlCount = "SELECT COUNT(*) AS total
                FROM salidas_materiales s
                JOIN control_materiales c ON s.codigo_material = c.codigo_material";

            $selectFolio = 's.codigo_material AS folio_salida,';
            $sql = "SELECT
                        $selectFolio
                        s.credencial,
                        c.descripcion_material,
                        '' AS unidad,
                        s.cantidad,
                        s.fecha_registro
                    FROM salidas_materiales s
                    JOIN control_materiales c ON s.codigo_material = c.codigo_material";

            if ($tieneBusqueda) {
                $where = " WHERE s.codigo_material ILIKE $1
                    OR CAST(s.credencial AS TEXT) ILIKE $1
                    OR c.descripcion_material ILIKE $1";
                $sqlCount .= $where;
                $sql .= $where;
            }

            $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
            $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
            $sql .= " ORDER BY s.id_salida DESC LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
            $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
        }

        if ($tieneSnapshotMovimiento) {
            $limitPlaceholder = $tieneBusqueda ? '$2' : '$1';
            $offsetPlaceholder = $tieneBusqueda ? '$3' : '$2';
            $sql .= " LIMIT $limitPlaceholder OFFSET $offsetPlaceholder";
            $params = $tieneBusqueda ? ['%' . $search . '%', $limite, $offset] : [$limite, $offset];
        }
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
