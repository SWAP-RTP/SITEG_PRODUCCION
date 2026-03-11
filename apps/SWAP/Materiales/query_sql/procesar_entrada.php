<?php
// 1. Incluimos la conexión que ya creamos antes
include('conexion.php');

// 2. Recibimos los datos del formulario (vienen por el método POST)
// Usamos nombres que coincidan con los 'name' de tu HTML
$codigo    = $_POST['codigo_material'];
$cantidad  = $_POST['cantidad'];
$fecha     = $_POST['fecha'];
$ubicacion = $_POST['ubicacion'];

// 3. Definimos la operación. 
// Para el Módulo 4, quedamos que el ID de 'ENTRADA' es 1
$id_tipo_operacion = 1;

// 4. Preparamos la orden para PostgreSQL
// Importante: cantidad_material fue el nombre que corregiste en tu base de datos
$query = "INSERT INTO registro_material (codigo_material, cantidad_material, fecha_registro, id_tipo_operacion, ubicacion) 
          VALUES ('$codigo', $cantidad, '$fecha', $id_tipo_operacion, '$ubicacion')";

// 5. Ejecutamos la orden
$resultado = pg_query($conexion, $query);

// 6. Verificamos si funcionó
if ($resultado) {
    echo "¡Éxito! El material se registró correctamente en el inventario.";
    // Opcional: Redirigir de vuelta al inventario después de 2 segundos
    header("refresh:2;url=inventario.html");
} else {
    echo "Error al guardar: " . pg_last_error($conexion);
}

// 7. Cerramos la puerta al terminar
pg_close($conexion);
?>