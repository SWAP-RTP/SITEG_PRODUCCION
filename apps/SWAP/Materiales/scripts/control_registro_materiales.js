
const CATALOGO_CODIGO = {
    "09FDDD00": "ESCOBA",
    "PAPE-101": "HOJAS BLANCAS"
};

const CATALOGO_TRABAJADORES = {
    "12345": "LUIS FERNANDO GÓMEZ",
    "67890": "MARÍA GARCÍA"
};

let contadorFolio = parseInt(localStorage.getItem("ultimoFolio")) || 1;

/* ==========================================
   1. LÓGICA DE NEGOCIO (PROCESAMIENTO)
   ========================================== */
async function procesarRegistroMaterial(datos) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const materialOficial = CATALOGO_CODIGO[datos.codigo_material];
            if (!materialOficial) {
                return reject({ 
                    titulo: "Material no encontrado", 
                    texto: "El código de material no existe o es incorrecto.",
                    icono: "error" 
                });
            }

            const trabajadorValido = CATALOGO_TRABAJADORES[datos.id_credencial];
            if (!trabajadorValido) {
                return reject({ 
                    titulo: "Credencial Inválida", 
                    texto: "No se encontró personal con ese ID.",
                    icono: "warning" 
                });
            }

            const folioAsignado = contadorFolio++;
            localStorage.setItem("ultimoFolio", contadorFolio);

            resolve({
                ...datos,
                descripcion_material: materialOficial,
                nombre_trabajador: trabajadorValido,
                folio: folioAsignado
            });
        }, 800);
    });
}

/* ==========================================
   2. MANEJO DEL DOM Y EVENTOS
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-registro-materiales");
    const inputCodigo = document.getElementById("codigo_material");
    const inputDesc = document.getElementById("descripcion_material");
    const inputCredencial = document.getElementById("id_credencial");
    const inputNombre = document.getElementById("nombre_trabajador");
    
    // Identificamos el botón de limpiar y el contenedor de reporte
    const btnLimpiar = document.getElementById("btn_limpiar");
    const contenedorReporte = document.getElementById("contenedor-reporte");

    // --- AUTOMATIZACIÓN (Al escribir los códigos) ---
    inputCodigo?.addEventListener("input", (evento) => {
        const codigo = evento.target.value.trim().toUpperCase();
        inputDesc.value = CATALOGO_CODIGO[codigo] || ""; 
    });

    inputCredencial?.addEventListener("input", (evento) => {
        const id = evento.target.value.trim();
        inputNombre.value = CATALOGO_TRABAJADORES[id] || "";
    });

    // --- LÓGICA DEL BOTÓN LIMPIAR (NUEVO) ---
    btnLimpiar?.addEventListener("click", () => {
        formulario.reset(); // Borra todos los inputs
        
        // Si la tabla de consulta está visible, la ocultamos
        if (contenedorReporte) {
            contenedorReporte.classList.add("d-none");
        }
        
        // Opcional: poner el foco en el primer campo
        inputCodigo.focus();
    });

    // --- PROCESAR EL REGISTRO 
    formulario?.addEventListener("submit", async (evento) => {
        evento.preventDefault(); 

        const datosMaterial = {
            codigo_material: inputCodigo.value.trim().toUpperCase(),
            id_credencial: inputCredencial.value.trim(),
            cantidad: document.getElementById("cantidad_inicial")?.value || 0
        };

        try {
            const resultado = await procesarRegistroMaterial(datosMaterial);

            Swal.fire({
                title: '¡Registro Exitoso!',
                html: `<b>Folio:</b> ${resultado.folio}<br><b>Responsable:</b> ${resultado.nombre_trabajador}`,
                icon: 'success'
            });

            formulario.reset(); 

        } catch (error) {
            Swal.fire({
                title: error.titulo || "Error",
                text: error.texto || "No se pudo completar",
                icon: error.icono || "error"
            });
        }
    });
});