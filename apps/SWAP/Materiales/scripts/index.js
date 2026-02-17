import { RegistrarMaterial, ConsultarMateriales } from "./registrar_materiales.js";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const form = $("form-materiales");
  const msg = form.parentElement.insertBefore(document.createElement("div"), form);
  const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.name);

  // Ocultar la tabla de registros al cargar la página
  $("tabla_registros").classList.add("d-none");

  const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls} mt-2">${txt}</div>`;
  const limpiar = () => {
    msg.innerHTML = "";
    $("codigo_material")?.focus();
    const tabla = $("tabla_registros");
    tabla.classList.remove("show");
    setTimeout(() => tabla.classList.add("d-none"), 600); // Espera la transición
    $("titulo-consulta").style.display = 'none';
  };
  const faltanCampos = d => camposObligatorios.filter(c => !d[c]?.trim());

  const renderTabla = data => {
    $("tabla_materiales").innerHTML = data.map(row =>
      `<tr>${["codigo_material","descripcion_material","grupo_pertenece","unidad_entrada","cantidad_material","ubicacion_almacen","estado_material","id_credencial","nombre_persona","area_adscripcion","fecha_registro"].map(k=>`<td>${row[k]??""}</td>`).join("")}</tr>`
    ).join("");
    const tabla = $("tabla_registros");
    if (data.length) {
      tabla.classList.remove("d-none");
      setTimeout(() => tabla.classList.add("show"), 10); // Pequeño delay para activar transición
      document.getElementById('titulo-consulta').style.display = 'block';
    } else {
      tabla.classList.remove("show");
      setTimeout(() => tabla.classList.add("d-none"), 600); // Espera la transición
      document.getElementById('titulo-consulta').style.display = 'none';
    }
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
    //  esta línea ya no es necesaria:
    // $("tabla_registros").classList.remove("d-none");
  };



// Autocompletar nombre y área al ingresar la credencial
  $("id_credencial").oninput = async function() {
    const credencial = this.value.trim();
    const nombreInput = $("nombre_registra");
    if (!credencial) return nombreInput.value = "";
    const res = await fetch(`query_sql/registro_materiales.php?buscar_persona=${encodeURIComponent(credencial)}`);
    const data = await res.json();
    nombreInput.value = data.nombre || "";
  };
});

