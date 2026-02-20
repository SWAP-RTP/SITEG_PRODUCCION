<?php
require_once __DIR__ . '/../../config/conexion.php';

header('Content-Type: application/json');

/**
 * Registra una nueva credencial (ajusta los campos según tu tabla real).
 */
function registrarCredencial($conexion, $data) {
    $credencial = pg_escape_string($conexion, $data['id_credencial'] ?? '');
    $nombre = pg_escape_string($conexion, $data['nombre_persona'] ?? '');

    if ($credencial === '' || $nombre === '') {
        return ['success' => false, 'message' => 'Datos incompletos'];
    }

    $sql = "INSERT INTO public.usuarios (trab_credencial, nombre) VALUES ('$credencial', '$nombre')";
    $result = pg_query($conexion, $sql);

    if ($result) {
        return ['success' => true, 'message' => 'Credencial registrada correctamente'];
    } else {
        return ['success' => false, 'message' => pg_last_error($conexion)];
    }
}

/**
 * Consulta credenciales por término de búsqueda.
 */
function buscarCredenciales($conexion, $q) {
    if ($q === '') return [];
    $q_safe = pg_escape_string($conexion, $q);
    $sql = "
        SELECT 
            u.trab_credencial AS id_credencial, 
            u.nombre AS nombre_persona
        FROM 
            public.usuarios u
        WHERE 
            u.trab_credencial ILIKE '%$q_safe%' OR u.nombre ILIKE '%$q_safe%'
        LIMIT 10
    ";
    $result = pg_query($conexion, $sql);
    if (!$result) {
        return ['error' => true, 'message' => pg_last_error($conexion)];
    }
    $credenciales = [];
    while ($row = pg_fetch_assoc($result)) {
        $credenciales[] = $row;
    }
    return $credenciales;
}

// MAIN
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Registro
    $data = $_POST; // O usa json_decode(file_get_contents('php://input'), true) si envías JSON
    $respuesta = registrarCredencial($conexion, $data);
    echo json_encode($respuesta);
    exit;
} else {
    // Consulta
    $q = $_GET['q'] ?? '';
    $respuesta = buscarCredenciales($conexion, $q);
    echo json_encode($respuesta);
    exit;
}