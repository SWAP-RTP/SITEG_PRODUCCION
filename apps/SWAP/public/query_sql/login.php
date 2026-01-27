<?php
include "../conexion.php";

if (!empty($_POST[usuario]) && !empty($_POST[password])) {
    if (session_id()) {
        session_start();
        session_unset();
        session_destroy();
    }// fin if

    if (autenticacion($_POST[usuario], $_POST[password], $REMOTE_ADDR, $_SERVER[SERVER_ADDR])) {
        session_start();
        $_SESSION[servidor] = $_SERVER[SERVER_ADDR];
        $_SESSION[password] = md5($_POST[pas]);
        $_SESSION[usuario] = md5($_POST[usuar]);
        $_SESSION[ip_cliente] = $_SERVER[REMOTE_ADDR];
        $_SESSION[usr_n] = $usr_n;
        $_SESSION[usr_n] = $usr_n;
        $_SESSION[modulo_o] = $modulo_o;
        $_SESSION[lugar] = $lugar;
        $_SESSION[usr_id] = $usr_id;
        $_SESSION[act] = $act;
        $_SESSION[inicio] = time();
        $_SESSION[modulos] = $modulos;      // Viene de una variable GLOBAL que se SETEA en conexionVic.html
        $_SESSION[rootUrl] = "/";
        $_SESSION[rootApp] = $_SERVER[DOCUMENT_ROOT]."/";
        $_SESSION[fecha_hora] = date('d/m/Y : H:i');
        $_SESSION[modulos_direccion]= $modulos_direccion;
        $response = array(
            "mensaje" => "Inicio de sesion exitoso",
            "sesion" => $_SESSION[inicio],
            "exito"=> 1
        );
        echo json_encode($response);

    } else {
        $response = array(
            "mensaje" => "Inicio de sesion incorrecto",
            "exito"=> 0
        );
        echo json_encode($response);
    }// fin else
}// fin if
