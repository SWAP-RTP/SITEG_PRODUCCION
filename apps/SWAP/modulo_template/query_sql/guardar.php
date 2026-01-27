<?php
session_start();
// $path_url = $_SESSION[rootApp]; 
// require($path_url.'conexion.html');
require(__DIR__ . '../../../conexion.php');
//usamos la conexion y la sesion para entrar al servidor
// if(conecta($conexion,$_SESSION[servidor])){ 
if (conecta($conexion, 'db_swap')) { 

    // print_r($_POST);

    $credencial = $_POST['credencial'];
    $nombre = $_POST['nombre'];
    $rfc = $_POST['rfc'];
    $cup = $_POST['cup'];
    $direccion = $_POST['direccion'];
    $fech_nacimiento = $_POST['fech_nacimiento'];
    $monto_pago = $_POST['trab_monto_pago'];
    $respuesta = " ";
    
    $insert_sql = "INSERT INTO trabajador_deudor (trab_credencial, trab_nombre, trab_rfc, trab_curp, trab_direccion, trab_fech_nacimiento, trab_monto, fecha_registro)
                   VALUES ($credencial, '$nombre', '$rfc', '$cup', '$direccion', '$fech_nacimiento', $monto_pago, now());";
    $insert_qry = @pg_query($conexion, $insert_sql);
    
    if(!$insert_qry){
        $respuesta = "error";
    }else{
        $respuesta = "ok";
    }

    // Libera la memoria usada por la consulta
    @pg_free_result($qry);
    // Cierra la conexion con PostgreSQL
    @pg_close($conexion);

    $jsonstring = json_encode($respuesta); 
    echo $jsonstring;
}
	
?>