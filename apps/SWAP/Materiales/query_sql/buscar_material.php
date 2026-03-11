<?php
include('conexion.php');

$codigo = $_GET['codigo'];

// Buscamos el material por su código
$query = "SELECT descripcion, sigla FROM materiales WHERE codigo_material = '$codigo'";
$resultado = pg_query($conexion, $query);

if ($fila = pg_fetch_assoc($resultado)) {
    // Si lo encuentra, manda los datos de vuelta al JS
    echo json_encode([
        'existe' => true,
        'descripcion' => $fila['descripcion'],
        'unidad' => $fila['sigla']
    ]);
} else {
    echo json_encode(['existe' => false]);
}
?>