<?php
header('Content-Type: application/json; charset=utf-8');
try {
    require '/var/www/login_shared/conf/conexion.php';
    $conexion = Database::conectar();

    if (!$conexion) {
        throw new Exception('Error de conexión a la base de datos');
    }

    $codigo = isset($_GET['codigo']) ? strtoupper(trim($_GET['codigo'])) : '';
    if (empty($codigo)) {
        echo json_encode(["error" => "Código vacío"]);
        exit;
    }

    $sql = "SELECT codigo_material, 
                   descripcion_material, 
                   id_unidad, 
                   ubicacion_fisica, 
                   id_estado_material, 
                   id_categoria_material, 
                   stock_actual 
            FROM   control_materiales WHERE codigo_material = $1;";
    $qry = pg_query_params($conexion, $sql, array($codigo));
    if (!$qry) {
        throw new Exception('Error de DB: ' . pg_last_error($conexion));
    }
    $res = pg_fetch_assoc($qry);
    if ($res) {
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(["error" => "No encontrado"]);
    }
    pg_close($conexion);
} catch (Exception $e) {
    echo json_encode(["error" => "Excepción PHP", "detalle" => $e->getMessage()]);
}