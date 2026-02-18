// Agregamos BuscarPersona a la importación
import { RegistrarMaterial, ConsultarMateriales, BuscarPersona } from "./gestion_materiales.js";

//se crea el evento DOMContentLoaded para asegurar que el código se ejecute después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const form = $("form-materiales");
  const msg = form.parentElement.insertBefore(document.createElement("div"), form);
  const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.name);

  // Funciones auxiliares compactas
  const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls} mt-2">${txt}</div>`;
  const toggleTabla = (show, data = []) => {
    const tabla = $("tabla_registros");
    if (show && data.length) {
      tabla.classList.replace("d-none", "show");
      $("titulo-consulta").style.display = 'block';
    } else {
      tabla.classList.remove("show");
      setTimeout(() => tabla.classList.add("d-none"), 600);
      $("titulo-consulta").style.display = 'none';
    }
  };

  // 1. Registro de Materiales
  form.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    d.area_adscripcion = d.area;
    
    const faltantes = camposObligatorios.filter(c => !d[c]?.trim());
    if (faltantes.length) return avisar(`Faltan: <b>${faltantes.join(", ")}</b>`, "warning");

    try {
      avisar("Procesando...", "info");
      const r = await RegistrarMaterial(d);
      avisar(r.success ? "Éxito. Material registrado." : (r.error || "Error"), r.success ? "success" : "danger");
      if (r.success) { form.reset(); $("codigo_material")?.focus(); }
    } catch (err) { avisar(err.message, "danger"); }
  };

  // 2. Consulta de Materiales
  $("btn_consulta").onclick = async e => {
    e.preventDefault();
    try {
      const r = await ConsultarMateriales();
      if (r.success && r.data.length) {
        $("tabla_materiales").innerHTML = r.data.map(row => 
          `<tr>${["codigo_material","descripcion_material","grupo_pertenece","unidad_entrada","cantidad_material","ubicacion_almacen","estado_material","id_credencial","nombre_persona","area_adscripcion","fecha_registro"].map(k=>`<td>${row[k]??""}</td>`).join("")}</tr>`
        ).join("");
        toggleTabla(true, r.data);
      } else { toggleTabla(false); alert("No hay registros."); }
    } catch { alert("Error en servidor"); }
  };

  // 3. Autocompletado (USANDO LA FUNCIÓN IMPORTADA)
  $("id_credencial").oninput = async function() {
    const credencial = this.value.trim();
    const nombreInput = $("nombre_registra");
    if (!credencial) return nombreInput.value = "";
    
    try {
      const data = await BuscarPersona(credencial); // <--- Lógica externa
      nombreInput.value = data.nombre || "";
    } catch { nombreInput.value = ""; }
  };


  form.onreset = () => { msg.innerHTML = ""; toggleTabla(false); };
});