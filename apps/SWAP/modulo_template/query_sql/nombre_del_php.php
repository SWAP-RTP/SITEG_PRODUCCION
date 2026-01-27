<?php
session_start();
// $path_url = $_SESSION[rootApp]; 
// require($path_url.'conexion.html');
require(__DIR__ . '../../../conexion.php');
//usamos la conexion y la sesion para entrar al servidor
// if(conecta($conexion,$_SESSION[servidor])){ 
if (conecta($conexion, 'db_swap')) { 


    $sql = "SELECT trab_credencial, trab_apaterno || ' ' || trab_amaterno || ' ' || trab_nombre AS nombre, trab_fec_ingreso 
            FROM trabajador;";
    $qry = @pg_query($conexion, $sql);
    
    $data = array();
    while($res = @pg_fetch_array($qry)){
        $data[] = array(
            "credencial" => $res['trab_credencial'],
            "nombre" => $res['nombre'],
            "modulo" => $res['trab_fec_ingreso']
        );
    };
//   print_r($data);

    $jsonstring = json_encode($data); 
    echo $jsonstring;
}
	
?>