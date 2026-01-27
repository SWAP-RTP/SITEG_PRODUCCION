<? 
//$localhost=$_SERVER[SERVER_ADDR]; PHP 5
$localhost = $_SERVER['SERVER_ADDR']; // PHP 7.4
function conecta(&$conexion,$localhost)
{
$conexion =@pg_connect("host=db_swap port=5433 user=prueba_swap password=prueba_swap dbname=prueba_swap");

        if ($conexion)
                 return 1;
       else
                return 0;
}

function autenticacion($usuar, $pas,$ip,$localhost)
  {
    global $usr_id;
    global $modulo_o;
    global $usr_n;        
    global $dirip;
    global $perm;
    global $act;
    global $usuarion;
    global $modulos;
    if (conecta($conexion,$localhost))
    {
       $query= "SELECT trabajador.*, usuarios.* FROM trabajador
                    INNER JOIN usuarios ON (trabajador.trab_credencial = usuarios.trab_credencial)
                    where usuarios.usr_login='".$usuar."' and usr_status='a'";
       $res = pg_query($conexion,$query);
       $datos=pg_Fetch_Object($res);
       $act=$datos->usr_estatus;
       $usr_id=$datos->trab_credencial;
       $usr_n="$datos->trab_nombre $datos->trab_apaterno $datos->trab_amaterno";
       $modulo_o=$datos->usr_mod_asignado;
       if (trim($datos->usr_password) ==  md5($pas))
       {
            $usr_id=$datos->trab_credencial;
            $perm=$datos->usr_perm;
            $usuarion="$datos->trab_nombre $datos->trab_apaterno";

       $queriM="select * from modulo_sistem order by modulo_sistem_descrip";
       $resM=pg_query($conexion,$queriM);

             $i=0;
         while($datosM=pg_Fetch_Object($resM)){
                   $queriP="select * from modulo_perm  where cve_modulo=$datosM->cve_modulo and trab_credencial=$usr_id";
                     $resP=pg_query($conexion,$queriP);
                         if (pg_num_rows($resP)>0){
                         //$valor= ereg_replace( " ", "_",$datosM->modulo_sistem_descrip);
                              $Query_P="SELECT modulo_perm.cve_permiso, modulo_perm.trab_credencial, modulo_perm.cve_modulo FROM modulo_perm
                              WHERE (trab_credencial =$usr_id) and (cve_modulo= $datosM->cve_modulo) ";
                              $resP=pg_query($conexion,$Query_P); 
                              while($datosP=pg_fetch_array($resP)){
                              $valor= ereg_replace( " ", "_",$datosM->modulo_sistem_descrip);
                               $modulos[$valor][]=$datosP[0];
                              }
                          }
             $i++;
       }

            $act=$datos->usr_estatus;
           if ($act == 'd')
              return 0;
           else
           return 1;
       }
       else
        return 0;
    }
  }
?>
