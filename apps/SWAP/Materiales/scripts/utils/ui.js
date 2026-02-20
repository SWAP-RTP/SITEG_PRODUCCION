export function configurarUI() {
  const $ = id => document.getElementById(id);
  const tabla = $("tabla_registros");
  const titulo = $("titulo-consulta");
  if (tabla) tabla.classList.add("d-none");
  if (titulo) titulo.style.display = 'none';
}

export const mostrarMensaje = (msg, texto, tipo, tiempo = 2000) => {
  msg.innerHTML = `<div class="alert alert-${tipo} mt-2">${texto}</div>`;
  setTimeout(() => { msg.innerHTML = ""; }, tiempo);
};

export const mostrarTablaResultados = ($, mostrar, datos = []) => {
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

export function renderizarTabla(data) {
  const tabla = document.getElementById("tabla_materiales");
  if (!tabla) return;
  tabla.innerHTML = data.map(row =>
    `<tr>${[
      "codigo_material", "descripcion_material", "grupo_pertenece", "unidad_entrada",
      "cantidad_material", "ubicacion_almacen", "estado_material", "id_credencial",
      "nombre_persona", "area_adscripcion", "fecha_registro"
    ].map(k => `<td>${row[k] ?? ""}</td>`).join("")}</tr>`
  ).join("");
}