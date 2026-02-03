<?php
$host = "192.168.1.65";
$port = 5439;
$dbname = "siteg";
$user = "siteg";
$password = "siteg";
header('Content-Type: application/json');

// Recibe datos por POST
$nombre = $_POST['nombre'] ?? '';
$correo = $_POST['correo'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';
$credencial = $_POST['credencial'] ?? '';
$modulo = $_POST['modulo'] ?? '';

// Valida datos mínimos
if (!$nombre || !$correo || !$contrasena) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos obligatorios"]);
    exit;
}

// Hashea la contraseña
$contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);

$conexion = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
if (!$conexion) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$sql = "INSERT INTO usuarios (nombre, correo, contrasena, credencial, modulo) VALUES ($1, $2, $3, $4, $5)";
$resultado = pg_query_params($conexion, $sql, [$nombre, $correo, $contrasena_hash, $credencial, $modulo]);

if ($resultado) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al insertar usuario"]);
}

pg_close($conexion);