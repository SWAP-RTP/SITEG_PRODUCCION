import { configurarUI } from "./utils/ui.js";
import { inicializarEventos } from "./utils/eventos.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Preparamos el aspecto de la página
    configurarUI();
    
    // 2. Activamos todos los escuchadores de botones y formularios
    inicializarEventos();
    
    console.log("Módulo de Materiales inicializado correctamente.");
});