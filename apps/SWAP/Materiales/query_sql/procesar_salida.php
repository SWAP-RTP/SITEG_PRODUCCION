<?php
// 1. Conectamos a la base de datos
include('conexion.php');

// 2. Recibimos los datos del formulario de salida
$id_credencial = $_POST['id_credencial'];
$codigo        = $_POST['codigo_material'];
$cantidad      = $_POST['cantidad']; // Lo que el trabajador pide
$id_estado     = $_POST['id_estado']; // N, B o U
$fecha         = date('Y-m-d'); // Fecha automática de hoy

// 3. REGLA DE NEGOCIO: Verificar stock actual antes de registrar
// Sumamos entradas (tipo 1) y restamos salidas (tipo 2)
$query_stock = "SELECT 
    (SUM(CASE WHEN id_tipo_operacion = 1 THEN cantidad_material ELSE 0 END) - 
     SUM(CASE WHEN id_tipo_operacion = 2 THEN cantidad_material ELSE 0 END)) as stock_real
    FROM registro_material 
    WHERE codigo_material = '$codigo'";

$res_stock = pg_query($conexion, $query_stock);
$fila_stock = pg_fetch_assoc($res_stock);
$stock_actual = $fila_stock['stock_real'] ?? 0;

// 4. VALIDACIÓN LOGICA
if ($cantidad > $stock_actual) {
    die("Error: No hay suficiente stock. Disponible: $stock_actual, Solicitado: $cantidad");
}

// 5. REGISTRO DE LA SALIDA
// El ID de 'SALIDA' es 2
$id_tipo_operacion = 2;

$query_insert = "INSERT INTO registro_material 
    (codigo_material, cantidad_material, fecha_registro, id_tipo_operacion, id_credencial, id_estado) 
    VALUES ('$codigo', $cantidad, '$fecha', $id_tipo_operacion, '$id_credencial', '$id_estado')";

$resultado = pg_query($conexion, $query_insert);

// 6. RESPUESTA
if ($resultado) {
    echo "¡Salida registrada! Se han descontado $cantidad unidades del inventario.";
    header("refresh:2;url=inventario.html");
} else {
    echo "Error crítico: " . pg_last_error($conexion);
}

pg_close($conexion);
?>