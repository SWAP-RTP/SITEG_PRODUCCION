import { grafica_pastel} from '/app-tain/parque_vehicular/script/indi_generales.js';
import { indi_modulos, grafica_lineal } from '/app-tain/parque_vehicular/script/indi_por_modulo.js';

// CONFIGURACIÓN GENERAL DE COLORES DE LAS GRAFICAS (color de texto y cuadricula)
// Aseguramos defaults de Chart.js si está presente
if (typeof Chart !== "undefined") {
    Chart.defaults.color = "#ffffff";
    Chart.defaults.borderColor = "rgba(255, 255, 255, 0.08)";
}

$(document).on("click", "#btn_filtrar", function () { 
    const filtro_por = $("#filtro_por").val();
    
    if(filtro_por == 1){
        $("#indicadores_generales").removeAttr('hidden');
        $("#indicadores_por_modulo").attr('hidden', true);
    }
    if(filtro_por == 2){
        $("#indicadores_por_modulo").removeAttr('hidden');
        $("#indicadores_generales").attr('hidden', true);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    grafica_pastel();
    grafica_lineal();
    indi_modulos();
    
});