<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

try {
    $conexion = Database::conectar();
    $catalogos = [];

    // 1. Obtener Categorías
    $sqlCat = "SELECT id_categoria_material, nombre_categoria_material FROM categorias_materiales ORDER BY id_categoria_material ASC";
    $resCat = pg_query($conexion, $sqlCat);
    $catalogos['categorias'] = pg_fetch_all($resCat) ?: [];

    // 2. Obtener Estados
    $sqlEst = "SELECT id_estado_material, descripcion_estado_material FROM estados_materiales ORDER BY descripcion_estado_material";
    $resEst = pg_query($conexion, $sqlEst);
    $catalogos['estados'] = pg_fetch_all($resEst) ?: [];

    // 3. Obtener Unidades
    $sqlUni = "SELECT id_unidad, descripcion_unidad FROM unidades_materiales ORDER BY descripcion_unidad ASC";
    $resUni = pg_query($conexion, $sqlUni);
    $catalogos['unidades'] = pg_fetch_all($resUni) ?: [];

    pg_close($conexion);
    echo json_encode($catalogos);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}