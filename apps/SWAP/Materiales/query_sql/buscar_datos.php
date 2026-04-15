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
    }
} catch (Exception $e) {
    $resultado = respuesta(500, ['error' => 'Excepcion PHP', 'detalle' => $e->getMessage()]);
}

if ($conexion) {
    pg_close($conexion);
}

http_response_code($resultado['statusCode']);
echo json_encode($resultado['payload']);
