<?php
include('conexion.php');

// Recibimos los datos del formulario HTML
$codigo = $_POST['codigo_material'];
$cantidad = $_POST['cantidad'];
$fecha = $_POST['fecha'];
$ubicacion = $_POST['ubicacion'];

// Insertamos el registro de entrada
$query = "INSERT INTO registro_material (codigo_material, cantidad_material, fecha_registro, id_tipo_operacion, ubicacion) 
          VALUES ('$codigo', $cantidad, '$fecha', 1, '$ubicacion')";

$resultado = pg_query($conexion, $query);

if ($resultado) {
    echo "¡Entrada registrada con éxito!";
} else {
    echo "Error al guardar el registro.";
}
?>