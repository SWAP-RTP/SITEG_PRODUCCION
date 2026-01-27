<?php
session_start();
// $path_url = $_SESSION[rootApp]; 
// require($path_url.'conexion.html');
require(__DIR__ . '../../../conexion.php');
//usamos la conexion y la sesion para entrar al servidor
// if(conecta($conexion,$_SESSION[servidor])){ 
if (conecta($conexion, 'db_swap')) { 

    // print_r($_POST);

    $sql = "SELECT trab_apaterno || ' ' || trab_amaterno || ' ' || trab_nombre AS nombre, trab_rfc, trab_curp, trab_dir_calle, trab_fec_naci 
            FROM trabajador
            WHERE trab_credencial = ".$_POST['credencial'].";";
    $qry = @pg_query($conexion, $sql);
    
    $data = array();
    while($res = @pg_fetch_array($qry)){
        $data[] = array(
            "nombre" => $res['nombre'],
            "rfc" => $res['trab_rfc'],
            "cup" => $res['trab_curp'],
            "direccion" => $res['trab_dir_calle'],
            "fech_nacimiento" => $res['trab_fec_naci']
        );
    };
    //   print_r($data);
    // Libera la memoria usada por la consulta
    @pg_free_result($qry);
    // Cierra la conexion con PostgreSQL
    @pg_close($conexion);
    
    // Verificar si la conexion sigue activa o no
    // if (pg_connection_status($conexion) === PGSQL_CONNECTION_OK) {
    //     echo "Conexion sigue activa";
    // } else {
    //     echo "Conexion cerrada correctamente";
    // }
    /*
    se cierra la conexion y solo nos quedamos con lo que esta almacenado en el JSON 
    <br />
    <b>Warning</b>:  pg_connection_status(): supplied resource is not a valid PostgreSQL link resource in <b>/var/www/html/modulo_template/query_sql/get_trabajador.php</b> on line <b>34</b><br />
    Conexion cerrada correctamente[{"nombre":"ABREGO ZEA ALEJANDRO","rfc":"AEZA650821RRA","cup":"AEZA650821HDFBXL09","direccion":"SUR 136 NO. 30","fech_nacimiento":"1965-08-21"}]
    */

    $jsonstring = json_encode($data); 
    echo $jsonstring;
}
	
?>