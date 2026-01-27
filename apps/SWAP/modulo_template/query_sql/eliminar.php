<?php
session_start();
// $path_url = $_SESSION[rootApp]; 
// require($path_url.'conexion.html');
require(__DIR__ . '../../../conexion.php');
//usamos la conexion y la sesion para entrar al servidor
// if(conecta($conexion,$_SESSION[servidor])){ 
if (conecta($conexion, 'db_swap')) { 

    // print_r($_POST);

    $id = $_POST['id'];
    $respuesta = " ";
    
    $delete_sql = "DELETE FROM trabajador_deudor WHERE id = $id;";
    $delete_qry = @pg_query($conexion, $delete_sql);
    
    if(!$delete_qry){
        $respuesta = "error";
    }else{
        $respuesta = "ok";
    }

    // Libera la memoria usada por la consulta
    @pg_free_result($delete_qry);
    // Cierra la conexion con PostgreSQL
    @pg_close($conexion);

    $jsonstring = json_encode($respuesta); 
    echo $jsonstring;
}
	
?>