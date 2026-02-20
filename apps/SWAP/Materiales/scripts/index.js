import { RegistrarMaterial, ConsultarMateriales } from "./registrar_materiales.js";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const form = $("form-materiales");
  const msg = form.parentElement.insertBefore(document.createElement("div"), form);
  const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.name);

  const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls} mt-2">${txt}</div>`;
  const limpiar = () => { msg.innerHTML = ""; $("codigo_material")?.focus(); $("tabla_registros").classList.add("d-none"); };
  const faltanCampos = d => camposObligatorios.filter(c => !d[c]?.trim());

  const renderTabla = data => {
    $("tabla_materiales").innerHTML = data.map(row =>
      `<tr>${["codigo_material","descripcion_material","grupo_pertenece","unidad_entrada","existencia_minima","ubicacion_almacen","estado_material","id_credencial","nombre_persona","area_adscripcion","fecha_registro"].map(k=>`<td>${row[k]??""}</td>`).join("")}</tr>`
    ).join("");
    $("tabla_registros").classList.toggle("d-none", !data.length);
  };

  form.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    d.area_adscripcion = d.area;
    const faltantes = faltanCampos(d);
    if (faltantes.length) return avisar(`Datos por llenar: <b>${faltantes.join(", ")}</b>`, "warning");
    try {
      avisar("Procesando...", "info");
      const r = await RegistrarMaterial(d);
      avisar(r.success ? "Éxito. Material registrado." : (r.error || "Error desconocido"), r.success ? "success" : "danger");
      if (r.success) $("codigo_material")?.focus();
    } catch (err) { avisar(err.message, "danger"); }
  };

  form.onreset = limpiar;

  $("btn_consulta").onclick = async e => {
    e.preventDefault();
    try {
      const r = await ConsultarMateriales();
      if (r.success && r.data.length) renderTabla(r.data);
      else { renderTabla([]); alert("No hay registros para mostrar."); }
    } catch { alert("Error en servidor"); }
  };

  $("id_credencial").oninput = async function() {
    const credencial = this.value.trim();
    const nombreInput = $("nombre_registra");
    if (!credencial) return nombreInput.value = "";
    const res = await fetch(`query_sql/registro_materiales.php?buscar_nombre=${encodeURIComponent(credencial)}`);
    const data = await res.json();
    nombreInput.value = data.nombre || "";
  };
});

