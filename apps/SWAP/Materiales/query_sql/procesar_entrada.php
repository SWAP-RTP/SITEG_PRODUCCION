<?php


require_once __DIR__ . '/../../config/conexion.php';

$conexion = conexion();

header('Content-Type: application/json; charset=utf-8');

if (!$conexion) {
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión a la base de datos"
    ]);
    exit;
}


# ===============================
# BÚSQUEDA DE MATERIAL (GET)
# ===============================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['buscar_codigo'])) {

    $codigo = strtoupper(trim($_GET['buscar_codigo']));

    // Evitar búsqueda vacía
    if ($codigo === "") {
        echo json_encode(["status" => "empty"]);
        exit;
    }

    $sql = "SELECT descripcion_material, nomenclatura_material, ubicacion_fisica_material
            FROM control_materiales
            WHERE codigo_material = $1";

    $result = pg_query_params($conexion, $sql, [$codigo]);

    if ($result === false) {
        echo json_encode([
            "status" => "error",
            "message" => "Error en la consulta"
        ]);
        exit;
    }

    $row = pg_fetch_assoc($result);

    if ($row) {

        echo json_encode([
            "status" => "found",
            "data" => $row
        ]);

    } else {

        echo json_encode([
            "status" => "not_found"
        ]);

    }

    pg_close($conexion);
    exit;
}


# ===============================
# GUARDAR ENTRADA (POST)
# ===============================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    try {

        $codigo      = strtoupper(trim($_POST['codigo_material'] ?? ""));
        $descripcion = strtoupper(trim($_POST['descripcion'] ?? ""));
        $cantidad    = intval($_POST['cantidad_material'] ?? 0);
        $unidad      = strtoupper(trim($_POST['unidad'] ?? ""));
        $ubicacion   = strtoupper(trim($_POST['ubicacion'] ?? ""));
        $fecha       = $_POST['fecha'] ?? "";

        if ($codigo === "" || $cantidad <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Datos incompletos"
            ]);
            exit;
        }

        pg_query($conexion, "BEGIN");

        # Verificar si existe material
        $sqlCheck = "SELECT codigo_material
                     FROM control_materiales
                     WHERE codigo_material = $1";

        $resCheck = pg_query_params($conexion, $sqlCheck, [$codigo]);

        if (!$resCheck) {
            throw new Exception("Error verificando material");
        }

        if (pg_num_rows($resCheck) == 0) {

            $sqlInsertCatalogo = "INSERT INTO control_materiales
            (codigo_material, descripcion_material, nomenclatura_material, ubicacion_fisica_material)
            VALUES ($1,$2,$3,$4)";

            $insertCat = pg_query_params($conexion, $sqlInsertCatalogo, [
                $codigo,
                $descripcion,
                $unidad,
                $ubicacion
            ]);

            if (!$insertCat) {
                throw new Exception("Error al insertar en catálogo");
            }
        }

        # Registrar entrada
        $sqlEntrada = "INSERT INTO entradas_materiales
        (codigo_material, cantidad_material, fecha)
        VALUES ($1,$2,$3)";

        $resEntrada = pg_query_params($conexion, $sqlEntrada, [
            $codigo,
            $cantidad,
            $fecha
        ]);

        if (!$resEntrada) {
            throw new Exception("Error al registrar entrada");
        }

        pg_query($conexion, "COMMIT");

        echo json_encode([
            "status" => "success",
            "message" => "Entrada registrada exitosamente"
        ]);

    } catch (Exception $e) {

        pg_query($conexion, "ROLLBACK");

        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }

    pg_close($conexion);
    exit;
}