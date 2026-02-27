<?php
require_once __DIR__ . '/../../config/conexion.php';
header('Content-Type: application/json');

$db = conexion();
if (!$db) {
    echo json_encode(["status" => "error", "message" => "No hay conexión"]);
    exit;
}

try {
    // La "magia" del JOIN: Juntamos las 3 tablas para tener el nombre completo y la descripción
    $sql = "SELECT 
                r.id_registro,
                r.fecha_registro_material,
                r.codigo_material,
                c.descripcion_material,
                r.cantidad_salida_material,
                t.trab_nombre || ' ' || t.trab_apaterno || ' ' || t.trab_amaterno AS nombre_recibio
            FROM registro_material r
            JOIN trabajador t ON r.id_credencial = t.trab_credencial
            JOIN catalogo_material c ON r.codigo_material = c.codigo_material
            ORDER BY r.fecha_registro_material DESC 
            LIMIT 10"; // Mostramos los últimos 10

    $result = pg_query($db, $sql);
    $registros = pg_fetch_all($result) ?: [];

    echo json_encode([
        "status" => "success",
        "data" => $registros
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
pg_close($db);