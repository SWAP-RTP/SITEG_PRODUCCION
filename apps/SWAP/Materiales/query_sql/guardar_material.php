<?php
session_start();
ob_start(); 
require(__DIR__ . '/../../config/conexion.php');

header('Content-Type: application/json');
ob_clean();

$conexion = conexion(); 

if ($conexion) { 
    // 1. Recibir y limpiar datos
    $codigo      = strtoupper(trim($_POST['codigo_material'] ?? ''));
    $descripcion = strtoupper(trim($_POST['descripcion'] ?? ''));
    $cantidad    = intval($_POST['cantidad_material'] ?? 0);
    $unidad      = strtoupper(trim($_POST['unidad'] ?? ''));
    $ubicacion   = strtoupper(trim($_POST['ubicacion'] ?? ''));

    if (empty($codigo) || $cantidad <= 0) {
        echo json_encode(["error" => "Código vacío o cantidad inválida"]);
        exit;
    }

    pg_query($conexion, "BEGIN");

    try {
        // 2. Verificar existencia en la tabla principal
        $sqlCheck = "SELECT stock_actual
                     FROM control_materiales 
                     WHERE codigo_material = $1";
        $resCheck = pg_query_params($conexion, $sqlCheck, array($codigo));
        
        $existe = (pg_num_rows($resCheck) > 0);

        if (!$existe) {
            // INSERT: Crear nuevo material
            $sqlMaestra = "INSERT INTO control_materiales (codigo_material, descripcion_material, nomenclatura_material, ubicacion_fisica_material, stock_actual) 
                           VALUES ($1, $2, $3, $4, $5);";
            
            $resMaestra = pg_query_params($conexion, $sqlMaestra, array(
                $codigo, $descripcion, $unidad, $ubicacion, $cantidad
            ));
            
            if (!$resMaestra) throw new Exception("Error al crear material nuevo");
        } else {
            // UPDATE: Sumar al stock existente
            $sqlUpdate = "UPDATE control_materiales 
                             SET stock_actual = stock_actual + $1 
                             WHERE codigo_material = $2;";
            $resUpdate = pg_query_params($conexion, $sqlUpdate, array($cantidad, $codigo));
            
            if (!$resUpdate) throw new Exception("Error al actualizar stock");
        }

        // 3. Registrar el movimiento en la tabla de entradas
       
        $sqlEntrada = "INSERT INTO entradas_materiales (codigo_material, cantidad_material) 
                       VALUES ($1, $2);";
        $resEntrada = pg_query_params($conexion, $sqlEntrada, array($codigo, $cantidad));

        if (!$resEntrada) throw new Exception("Error al registrar entrada");

        pg_query($conexion, "COMMIT");
        echo json_encode(["success" => true, "mensaje" => "Guardado exitoso"]);

    } catch (Exception $e) {
        pg_query($conexion, "ROLLBACK");
        echo json_encode(["error" => $e->getMessage()]);
    }

    pg_close($conexion);
} else {
    echo json_encode(["error" => "Error de conexión"]);
}