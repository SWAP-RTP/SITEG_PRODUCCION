<?php
require_once(__DIR__ . '/../public/conexion2.php');
header('Content-Type: application/json');
date_default_timezone_set('America/Mexico_City');
//llamamos a la funcion de las conexion
$pdo_sugo = conexionSugo();
$pdo_tablero = conexionTablero();

include(__DIR__ .'/genera_totales_pv.php');

$data = genera_totales_pv($pdo_sugo);

function save_totales_pv($data){
    global $pdo_tablero;

    try {
        $pdo_tablero->beginTransaction();

        // ===== INSERT PRINCIPAL =====
        $sql = "INSERT INTO tabla_indicadores (total_trabajadores, total_pv, total_rutas, total_sefis, total_accidentes, total_mantenimiento, fecha_corte)
                VALUES (0, :total, 0, 0, 0, 0, NOW())";
        $stmt = $pdo_tablero->prepare($sql);
        $stmt->execute([
            ':total' => $data['total']
        ]);

        // ID correcto del registro padre
        $id_indicador = $pdo_tablero->lastInsertId();

        // ===== INSERT DETALLE =====
        $sql2 = "INSERT INTO tabla_indicadores_pv (id_indicador, modulo, modalidad, motivo, total_camiones)
                 VALUES (:id, :modulo, :modalidad, :motivo, :total_camiones)";
        $stmt2 = $pdo_tablero->prepare($sql2);

        foreach ($data as $key => $lista) {
            //ignora la llave 'total'
            if ($key === 'total' || !is_array($lista)) {
                continue;
            }

            foreach ($lista as $row) {
                if ((int)$row['total_camiones'] > 0) {
                    $stmt2->execute([
                        ':id'             => $id_indicador,
                        ':modulo'         => $row['modulo'],
                        ':modalidad'      => $row['ruta_modalidad'],
                        ':motivo'         => $row['motivo_id'],
                        ':total_camiones' => $row['total_camiones']
                    ]);
                }
            }
        }

        $pdo_tablero->commit();

        return [
            'status'  => true,
            'message' => 'Registro insertado correctamente '. date('d/m/Y H:i:s')
        ];

    } catch (PDOException $e) {
        $pdo_tablero->rollBack();

        return [
            'status'  => false,
            'message' => $e->getMessage()
        ];
    }
}
$result = save_totales_pv($data);

echo json_encode($result);
// echo json_encode($data);

?>