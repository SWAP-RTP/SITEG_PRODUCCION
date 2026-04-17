<?php
header('Content-Type: application/json; charset=utf-8');



function respuesta(int $statusCode, array $payload): array {
    return ['statusCode' => $statusCode, 'payload' => $payload];
}

function buscarMaterial($conexion, string $folio): array {
    if ($folio === '') {
        return respuesta(400, ['error' => 'Folio vacío']);
    }

    $sql = "SELECT 
                c.folio_material,
                c.descripcion_material,
                c.id_unidad_material,
                u.descripcion_unidad_material,
                c.id_categoria_material,
                cat.descripcion_categoria_material,
                c.id_estado_material,
                est.descripcion_estado_material,
                c.stock_actual,
                c.stock_minimo,
                c.adscripcion
            FROM control_materiales c
            LEFT JOIN unidades_materiales u ON c.id_unidad_material = u.id_unidad_material
            LEFT JOIN categorias_materiales cat ON c.id_categoria_material = cat.id_categoria_material
            LEFT JOIN estados_materiales est ON c.id_estado_material = est.id_estado_material
            WHERE c.folio_material = $1";

    $qry = pg_query_params($conexion, $sql, [$folio]);
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
        // Permitir recibir folio_material por GET (folio_materiales o folio_material)
        $folio = isset($_GET['folio_materiales']) ? strtoupper(trim($_GET['folio_materiales'])) : (isset($_GET['folio_material']) ? strtoupper(trim($_GET['folio_material'])) : '');
        $resultado = buscarMaterial($conexion, $folio);
    }
} catch (Exception $e) {
    $resultado = respuesta(500, ['error' => 'Excepcion PHP', 'detalle' => $e->getMessage()]);
}

if ($conexion) {
    pg_close($conexion);
}

http_response_code($resultado['statusCode']);
echo json_encode($resultado['payload']);
