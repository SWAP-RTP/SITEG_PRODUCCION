import { RegistrarMaterial, ConsultarMateriales, BuscarCredencial } from "../FuncionMateriales.js";
import { mostrarMensaje, mostrarTablaResultados, renderizarTabla} from "./ui.js";

const $ = id => document.getElementById(id);

export function inicializarEventos() {
  //lo transforme en helper para omitir document
    const form = $("form-materiales");
    const inputCredencial = $("id_credencial");
    const inputNombre = $("nombre_registra");
    const btnConsulta = $("btn_consulta");
    
    if (!form) return;

    //******************Contenedor de mensajes (lo busca o lo crea)*******************//
    const msg = $("mensaje-servidor") || form.parentElement.insertBefore(document.createElement("div"), form);
    const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.id || el.name);

    //*************1. Quitar errores al escribir*******************//
    camposObligatorios.forEach(id => {
        $(id)?.addEventListener("input", e => e.target.classList.remove("is-invalid"));
    });

    //*************2. Registro de Materiales*******************//
    form.onsubmit = async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        d.area_adscripcion = d.area;

        const faltan = camposObligatorios.filter(id => id !== "nombre_registra" && !d[id]?.trim());
        
        if (faltan.length) {
            faltan.forEach(id => $(id)?.classList.add("is-invalid"));
            return mostrarMensaje(msg, `Faltan: <b>${faltan.join(", ")}</b>`, "warning");
        }

        mostrarMensaje(msg, "Procesando...", "info");
        try {
            const r = await RegistrarMaterial(d);
            if (r.success) {
                mostrarMensaje(msg, "¡REGISTRO EXITOSO!", "success");
                form.reset();
                $("codigo_material")?.focus();
            } else {
                mostrarMensaje(msg, r.error || "Error", "danger");
            }
        } catch (err) {
            mostrarMensaje(msg, "Error de conexión", "danger");
        }
    };

    //3. Consulta de Materiales
    if (btnConsulta) {
        btnConsulta.onclick = async e => {
            e.preventDefault();
            try {
                const res = await ConsultarMateriales();
                if (res.success && res.data.length) {
                    renderizarTabla(res.data);
                    mostrarTablaResultados(true);
                } else {
                    mostrarTablaResultados(false);
                    alert("No hay registros.");
                }
            } catch (err) {
                alert("Error en servidor");
            }
        };
    }

    // 4. Autocompletado de Credencial
    if (inputCredencial) {
        inputCredencial.oninput = async function() {
            const cred = this.value.trim();
            if (!cred) return inputNombre.value = "";
            const persona = await BuscarCredencial(cred);
            inputNombre.value = persona.nombre || "";
            inputCredencial.classList.toggle("is-invalid", !persona.nombre);
        };
    }

    form.onreset = () => { 
        msg.innerHTML = ""; 
        mostrarTablaResultados(false); 
    };
}