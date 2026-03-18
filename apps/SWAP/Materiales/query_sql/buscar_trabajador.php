<?php
header('Content-Type: application/json; charset=utf-8');
require(__DIR__ . '/../../config/conexion.php');

$conexion = conexion();
if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$credencial = isset($_GET['credencial']) ? trim($_GET['credencial']) : '';
if ($credencial === '') {
    echo json_encode(['error' => 'Credencial vacía']);
    exit;
}

$sql = "SELECT trab_nombre, trab_apaterno, trab_amaterno FROM trabajadores_materiales WHERE trab_credencial = $1";
$qry = pg_query_params($conexion, $sql, array($credencial));
$row = pg_fetch_assoc($qry);

if ($row) {
    // Concatenar nombre completo
    $nombreCompleto = $row['trab_nombre'] . ' ' . $row['trab_apaterno'] . ' ' . $row['trab_amaterno'];
    echo json_encode(['nombre' => trim($nombreCompleto)]);
} else {
    echo json_encode(['nombre' => '']);
}
pg_close($conexion);
exit;
?>