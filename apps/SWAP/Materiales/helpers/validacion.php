<?php
//=======================================================
//**********Función para validar campos requeridos*******
//=======================================================
function validarCampos($input, $required) {
    foreach ($required as $field) {
        if (empty($input[$field])) return false;
    }
    return true;
}