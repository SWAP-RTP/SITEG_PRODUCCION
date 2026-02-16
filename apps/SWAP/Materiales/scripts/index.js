import { RegistrarMaterial, ConsultarMateriales } from "./registrar_materiales.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-materiales");
  const $ = id => document.getElementById(id);
  const msg = form.parentElement.insertBefore(document.createElement("div"), form);
  const camposObligatorios = Array.from(form.querySelectorAll("[required]")).map(el => el.name);

  const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls} mt-2">${txt}</div>`;

  form.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    d.area_adscripcion = d.area;

    // Detecta campos faltantes
    const faltantes = camposObligatorios.filter(c => !d[c]?.trim());
    if (faltantes.length) {
      avisar(
        `Datos por llenar: <b>${faltantes.join(", ")}</b>`,
        "warning"
      );
      return;
    }

    try {
      avisar("Procesando...", "info");
      const r = await RegistrarMaterial(d);
      avisar(r.success ? "Éxito. Material registrado." : (r.error || "Error desconocido"), r.success ? "success" : "danger");
      if (r.success) $("codigo_material")?.focus();
    } catch (err) {
      avisar(err.message, "danger");
    }
  };

  form.onreset = () => { msg.innerHTML = ""; $("codigo_material")?.focus(); $("tabla_registros").classList.add("d-none"); };

  $("btn_consulta").addEventListener("click", async e => {
    e.preventDefault();
    try {
      const r = await ConsultarMateriales();
      const tabla = $("tabla_registros"), tbody = $("tabla_materiales");
      if (r.success && r.data.length) {
        tbody.innerHTML = r.data.map(row =>
          `<tr>${["codigo_material","descripcion_material","grupo_pertenece","unidad_entrada","existencia_minima","ubicacion_almacen","estado_material","id_credencial","nombre_persona","area_adscripcion","fecha_registro"].map(k=>`<td>${row[k]??""}</td>`).join("")}</tr>`
        ).join("");
        tabla.classList.remove("d-none");
      } else {
        tabla.classList.add("d-none");
        alert("No hay registros para mostrar.");
      }
    } catch { alert("Error en servidor"); }
  });
});