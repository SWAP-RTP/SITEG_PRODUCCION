<?php
header('Content-Type: application/json; charset=utf-8');

function respuesta(int $statusCode, array $payload): array {
    return ['statusCode' => $statusCode, 'payload' => $payload];
}

function buscarMaterial($conexion, string $codigo): array {
    if ($codigo === '') {
        return respuesta(400, ['error' => 'Codigo vacio']);
    }

    $sql = "SELECT codigo_material,
                   descripcion_material,
                   id_unidad,
                   id_estado_material,
                   id_categoria_material,
                   stock_actual,
                   stock_minimo
            FROM control_materiales
            WHERE codigo_material = $1";

    $qry = pg_query_params($conexion, $sql, [$codigo]);
    if (!$qry) {
        throw new Exception('Error en la consulta de material: ' . pg_last_error($conexion));
    }

    $res = pg_fetch_assoc($qry);
    return respuesta(200, $res ? $res : ['error' => 'No encontrado']);
}

function buscarTrabajador($conexion, string $credencial): array {
    if ($credencial === '') {
        return respuesta(200, ['nombre' => '']);
    }

    $query = 'SELECT nombre FROM trabajadores_materiales WHERE credencial = $1';
    $result = pg_query_params($conexion, $query, [$credencial]);
    if (!$result) {
        throw new Exception('Error en la consulta de trabajador: ' . pg_last_error($conexion));
    }

    $row = pg_fetch_assoc($result);
    return respuesta(200, $row ? ['nombre' => trim($row['nombre'])] : ['nombre' => '']);
}

function buscarTrabajadorPorNombre($conexion, string $nombre): array {
    if ($nombre === '') {
        return respuesta(200, ['credencial' => '', 'nombre' => '']);
    }

    $query = 'SELECT credencial, nombre
              FROM trabajadores_materiales
              WHERE UPPER(TRIM(nombre)) = UPPER(TRIM($1))
              LIMIT 1';

    $result = pg_query_params($conexion, $query, [$nombre]);
    if (!$result) {
        throw new Exception('Error en la consulta de trabajador por nombre: ' . pg_last_error($conexion));
    }

    $row = pg_fetch_assoc($result);
    if (!$row) {
        return respuesta(200, ['credencial' => '', 'nombre' => '']);
    }

    return respuesta(200, [
        'credencial' => trim($row['credencial']),
        'nombre' => trim($row['nombre'])
    ]);
}

$conexion = null;
$resultado = respuesta(500, ['error' => 'Excepcion PHP', 'detalle' => 'Error no controlado']);

try {
    require '/var/www/login_shared/conf/conexion.php';

    if (!class_exists('Database')) {
        throw new Exception('Clase Database no encontrada');
    }

    $conexion = Database::conectar();
    if (!$conexion) {
        throw new Exception('Error de conexion a la base de datos');
    }

    $tipo = strtolower(trim($_GET['tipo'] ?? ''));

    if ($tipo === 'material') {
        $codigo = isset($_GET['codigo']) ? strtoupper(trim($_GET['codigo'])) : '';
        $resultado = buscarMaterial($conexion, $codigo);
    } elseif ($tipo === 'trabajador') {
        $credencial = trim($_GET['credencial'] ?? '');
        $nombre = trim($_GET['nombre'] ?? '');

        if ($nombre !== '') {
            $resultado = buscarTrabajadorPorNombre($conexion, $nombre);
        } else {
            $resultado = buscarTrabajador($conexion, $credencial);
        }
    } else {
        $resultado = respuesta(400, ['error' => 'Tipo invalido. Use tipo=material o tipo=trabajador']);
    }
} catch (Exception $e) {
    $resultado = respuesta(500, ['error' => 'Excepcion PHP', 'detalle' => $e->getMessage()]);
}

if ($conexion) {
    pg_close($conexion);
}

http_response_code($resultado['statusCode']);
echo json_encode($resultado['payload']);
