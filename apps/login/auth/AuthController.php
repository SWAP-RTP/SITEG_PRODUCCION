<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../vendor/autoload.php';
require "../conf/conexion.php";
require "UsuarioRepository.php";
require "AuthService.php";

class AuthController
{
    public function login()
    {
        header('Content-Type: application/json');
        try {
            $db = Database::conectar();
            if (!$db) {
                throw new Exception('Error al conectar a la BD');
            }
            $repo = new UsuarioRepository($db);
            $authService = new AuthService();

            $usuario_input = $_POST['ingresaUsuario'] ?? '';
            $pass_input = $_POST['ingresaPassword'] ?? '';

            if (empty($usuario_input) || empty($pass_input)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Usuario y contraseña requeridos"]);
                return;
            }
            $user_rows = $repo->obtenerUsuarioPorCorreo($usuario_input);
            //PRIMERA VALIDACION QUE ES POR CORREO Y PASSWORD
            if ($user_rows && password_verify($pass_input, $user_rows[0]['contrasena'])) {
                $id_actual = $user_rows[0]['id_usuario'];

                //SEGUNDA VALIDACION VERIFICA LA CREDENCIAL
                if (empty($id_actual)) {
                    http_response_code(403);
                    echo json_encode(["status" => "error", "message" => "Acceso denegado:El usuario no cuenta con una credencial valida asignada "]);
                    return;
                }
                //SI AMBAS VALIDACIONES SON CORRECTAS, SE GENERA EL TOKEN Y LA SESION 
                $session_id = bin2hex(random_bytes(16));
                $repo->actualizarSessionId($id_actual, $session_id);

                $user_info = [
                    'id' => $id_actual,
                    'name' => $user_rows[0]['nombre'],
                    'correo' => $user_rows[0]['correo']
                ];

                $permisos = [];
                foreach ($user_rows as $row) {
                    if ($row['cve_permiso'] && $row['modulo_sistem_descrip']) {
                        $permisos[] = [
                            'permiso' => $row['cve_permiso'],
                            'modulo' => $row['modulo_sistem_descrip'],
                        ];
                    }
                }

                $jwt = $authService->generarToken($user_info, $session_id);

                setcookie("access_token", $jwt, [
                    'expires' => time() + 3600,
                    'path' => '/',
                    'samesite' => 'Lax'
                ]);

                echo json_encode([
                    "status" => "success",
                    "token" => $jwt,
                    "usuario" => $user_info,
                    "permisos" => $permisos
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Usuario o Contraseña incorrectos"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        } finally {
            if (isset($db) && $db) {
                Database::desconectar();
            }
        }
    }
}