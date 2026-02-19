// Agregamos BuscarPersona a la importación
import { RegistrarMaterial, ConsultarMateriales, BuscarPersona } from "./gestion_materiales.js";

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const form = $("form-materiales");
  const msg = form.parentElement.insertBefore(document.createElement("div"), form);
  const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.name);
  const inputCredencial = $("id_credencial");
  const inputNombre = $("nombre_registra");


  
  // Muestra un mensaje al usuario
  const mostrarMensaje = (texto, tipo, tiempo = 2000) => {
    msg.innerHTML = `<div class="alert alert-${tipo} mt-2">${texto}</div>`;
    setTimeout(() => { msg.innerHTML = ""; }, tiempo);
  };


  // Muestra u oculta la tabla de resultados y el título de consulta
  const mostrarTablaResultados = (mostrar, datos = []) => {
    const tabla = $("tabla_registros");
    const titulo = $("titulo-consulta");
    if (mostrar && datos.length) {
      tabla.classList.replace("d-none", "show");
      titulo.style.display = 'block';
    } else {
      tabla.classList.remove("show");
      setTimeout(() => tabla.classList.add("d-none"), 600);
      titulo.style.display = 'none';
    }
  };

  // Quita el rojo al escribir en cualquier campo obligatorio
  camposObligatorios.forEach(c => $((c))?.addEventListener("input", e => e.target.classList.remove("is-invalid")));

  // 1. Registro de Materiales
  form.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    d.area_adscripcion = d.area;

    // Excluye 'nombre_registra' de los campos obligatorios
    const camposSinNombre = camposObligatorios.filter(c => c !== "nombre_registra");
    camposSinNombre.forEach(c => $((c))?.classList.remove("is-invalid"));
    inputCredencial.classList.remove("is-invalid");

    const faltan = camposSinNombre.filter(c => !d[c]?.trim());
    if (faltan.length) {
      mostrarMensaje(`Faltan: <b>${faltan.join(", ")}</b>`, "warning");
      faltan.forEach(c => $((c))?.classList.add("is-invalid"));
      return;
    }
    //Si todo está bien, registrar
    mostrarMensaje("Procesando...", "info");
    try {
      const r = await RegistrarMaterial(d);
      mostrarMensaje(r.success ? "¡REGISTRO EXITOSO!" : (r.error || "Error"), r.success ? "success" : "danger");
      if (r.success) setTimeout(() => { form.reset(); $("codigo_material")?.focus(); msg.innerHTML = ""; }, 2000);
    } catch (err) {
      mostrarMensaje(err.message, "danger");
    }
  };

  // 2. Consulta de Materiales
  $("btn_consulta").onclick = async e => {
    e.preventDefault();
    try {
      const response = await ConsultarMateriales();
      if (response.success && response.data.length) {
        $("tabla_materiales").innerHTML = response.data.map(row =>
          `<tr>${[
            "codigo_material",
            "descripcion_material", 
            "grupo_pertenece", 
            "unidad_entrada",
            "cantidad_material", 
            "ubicacion_almacen", 
            "estado_material", 
            "id_credencial",
            "nombre_persona", 
            "area_adscripcion", 
            "fecha_registro"
          ].map(k => `<td>${row[k] ?? ""}</td>`).join("")}</tr>`
        ).join("");
        mostrarTablaResultados(true, response.data);
      } else {
        mostrarTablaResultados(false);
        alert("No hay registros.");
      }
    } catch {
      alert("Error en servidor");
    }
  };

  // 3. Autocompletado de nombre por credencial
  inputCredencial.oninput = async function() {
    inputCredencial.classList.remove("is-invalid");
    const cred = this.value.trim();
    if (!cred) return inputNombre.value = "";
    const persona = await BuscarPersona(cred);
    inputNombre.value = persona.nombre || "";
    if (!persona.nombre) inputCredencial.classList.add("is-invalid");
  };

  // Limpia mensajes y oculta tabla al resetear el formulario
  form.onreset = () => { msg.innerHTML = ""; mostrarTablaResultados(false); };
});
