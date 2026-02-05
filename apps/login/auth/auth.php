<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;

require "../conf/conexion.php";

try {
    //CREAMOS LA CONEXION A LA BASE DE DATOS CON LAS CREDENCIALES DEFINIDAS ARRIBA
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    //RECIBIMOS LOS DATOS DEL FORMULARIO
    $usuario_input = $_POST['ingresaUsuario'] ?? '';
    $pass_input = $_POST['ingresaPassword'] ?? '';

    if (!empty($usuario_input) && !empty($pass_input)) {
        //CONSULTA A LA BASE DE DATOS
        $stmt = $pdo->prepare("SELECT nombre,correo,contrasena FROM usuarios WHERE correo = ?");
        $stmt->execute([$usuario_input]);
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

        //VERIFICAMOS LA CONTRASEÑA Y GENERAMOS EL JWT
        if ($user_data && password_verify($pass_input, $user_data['contrasena'])) {
            $key = getenv('JWT_SECRET') ?: 'CLAVE_SUPER_SECRETA_PARA_SITEG_LARGA_2026_MUY_SEGURA';
            $payload = [
                'iat' => time(),
                'exp' => time() + 3600, // Token válido por 1 hora
                'data' => [
                    'id' => $user_data['correo'],
                    'name' => $user_data['nombre']
                ]
            ];

            //GENERAMOS EL TOKEN JWT
            $jwt = JWT::encode($payload, $key, 'HS256');
            //SE CREA LA COOKIE PARA TODO EL SISTEMA 
            setcookie("access_token", $jwt, [
                'expires' => time() + 3600,
                'path' => '/',
                //'httponly' => true,
                'samesite' => 'Lax'
            ]);
            //REDIRIGE AL MENU PRINCIPAL
            echo "success";
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

