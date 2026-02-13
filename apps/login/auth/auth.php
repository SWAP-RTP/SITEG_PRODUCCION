<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;

require "../conf/conexion.php";

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $usuario_input = $_POST['ingresaUsuario'] ?? '';
    $pass_input = $_POST['ingresaPassword'] ?? '';

    if (!empty($usuario_input) && !empty($pass_input)) {
        // Consulta para traer todos los permisos y módulos del usuario
        $stmt = $pdo->prepare("SELECT u.trab_credencial, u.nombre, u.correo, u.contrasena, u.modulo, mp.cve_permiso, msd.modulo_sistem_descrip
            FROM usuarios u 
            LEFT JOIN modulo_perm mp ON mp.trab_credencial = u.trab_credencial 
            LEFT JOIN modulo_sistem msd ON msd.cve_modulo = mp.cve_modulo 
            WHERE u.correo = ?");
        $stmt->execute([$usuario_input]);
        $user_rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($user_rows && password_verify($pass_input, $user_rows[0]['contrasena'])) {
            // Extraer todos los permisos y nombres de módulos
            $permisos = [];
            $modulos_descrip = [];
            foreach ($user_rows as $row) {
                if ($row['cve_permiso'] !== null) {
                    $permisos[] = $row['cve_permiso'];
                }
                if ($row['modulo_sistem_descrip'] !== null && !in_array($row['modulo_sistem_descrip'], $modulos_descrip)) {
                    $modulos_descrip[] = $row['modulo_sistem_descrip'];
                }
            }
            // Datos del usuario (de la primera fila)
            $user = $user_rows[0];

            $key = getenv('JWT_SECRET') ?: 'CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA';
            $payload = [
                'iat' => time(),
                'exp' => time() + 3600,
                'data' => [
                    'id' => $user['trab_credencial'],
                    'name' => $user['nombre'],
                    'correo' => $user['correo'],
                    'modulo' => $user['modulo'],
                    'permisos' => $permisos,
                    'modulos_descrip' => $modulos_descrip
                ]
            ];
            $jwt = JWT::encode($payload, $key, 'HS256');
            setcookie("access_token", $jwt, [
                'expires' => time() + 3600,
                'path' => '/',
                'samesite' => 'Lax'
            ]);
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['trab_credencial'],
                    "name" => $user['nombre'],
                    "correo" => $user['correo'],
                    "modulo" => $user['modulo'],
                    "permisos" => $permisos,
                    "modulos_descrip" => $modulos_descrip
                ],
                "token" => $jwt
            ]);
            exit;
        } else {
            http_response_code(401);
            echo "Credenciales inválidas";
            exit;
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo "Error de conexión";
}