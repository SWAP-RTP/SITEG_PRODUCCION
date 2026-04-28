<?php
header('Content-Type: application/json; charset=utf-8');
require '/var/www/login_shared/conf/conexion.php';

$conexion = Database::conectar();

// TOTAL MATERIALES
$total = pg_fetch_result(
    pg_query($conexion, "SELECT COUNT(*) FROM control_materiales"),
    0, 0
);

// STOCK TOTAL
$stockTotal = pg_fetch_result(
    pg_query($conexion, "SELECT COALESCE(SUM(stock_actual),0) FROM control_materiales"),
    0, 0
);

// STOCK BAJO
$resBajo = pg_query($conexion, "
    SELECT COUNT(*) 
    FROM control_materiales 
    WHERE stock_actual <= stock_minimo
");

$stockBajo = pg_fetch_result($resBajo, 0, 0);

// MATERIALES CON STOCK BAJO
$resLista = pg_query($conexion, "
    SELECT folio_material, descripcion_material, stock_actual
    FROM control_materiales
    WHERE stock_actual <= stock_minimo
    ORDER BY stock_actual ASC
");

$materiales = [];

while ($row = pg_fetch_assoc($resLista)) {
    $materiales[] = $row;
}

// MOVIMIENTOS HOY
$resMov = pg_query($conexion, "
    SELECT 
        (SELECT COUNT(*) FROM entradas_materiales WHERE DATE(fecha_registro_entrada) = CURRENT_DATE) +
        (SELECT COUNT(*) FROM salidas_materiales WHERE DATE(fecha_registro_salida) = CURRENT_DATE)
");

$movimientos = pg_fetch_result($resMov, 0, 0);

echo json_encode([
    'total_materiales' => (int)$total,
    'stock_total' => (int)$stockTotal,
    'stock_bajo' => (int)$stockBajo,
    'movimientos_hoy' => (int)$movimientos,
    'materiales_bajo' => $materiales
]);

pg_close($conexion);