import { obtenerModulos } from "../../includes/utils/modulos_select.js";

async function datosTabla(url) {
  try {
    const response = await fetch(url); // <-- Aquí debe ser fetch, no datosTabla
    const data = await response.json();
    console.log("Datos de la tabla cargados correctamente.", data);
    return data;
  } catch (error) {
    console.error("Error al cargar los datos de la tabla:", error);
  }
}

function dataTable(datosTabla, id_tabla, columns) {
  if ($.fn.DataTable.isDataTable(id_tabla)) {
    $(id_tabla).DataTable().clear().destroy();
  }

  $(id_tabla).DataTable({
    data: datosTabla,
    columns,
    dom: "Blfrtip",
    lengthMenu: [
      [10, 20, 50, -1],
      [10, 20, 50, "Todo"],
    ],

    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
    },
    destroy: true,
    columnDefs: [{ className: "text-center", targets: "_all" }],
  });
}

//! ***************** Consumir dataTable ******************* */
(async () => {
  const datos = await datosTabla("/admin/query_sql/usuarios.php");
  dataTable(datos, "#tabla_orden_alta", [
    { data: "id", title: "id" },
    { data: "nombre", title: "nombre" },
    { data: "trab_credencial", title: "trab_credencial" },
    { data: "correo", title: "correo" },
    { data: "contrasena", title: "contrasena" },
    {
      data: null,
      title: "Acción",
      orderable: false,
      render: function (data, type, row) {
        return `
        <button class="btn btn-success btn-sm me-2"><i class="fa fa-pencil"></i></button>
        <button class="btn btn-warning btn-sm"><i class="fa fa-trash"></i></button>
      `;
      },
    },
  ]);
})();

// ***************** Consumir obtenerModulos ******************* */
obtenerModulos("/admin/query_sql/catalogos_modulos.php");

// ***************** Consumir modulos_sistema ******************* */

//! ***************** Consumir dataTable ******************* */
(async () => {
  const modulos_sistema = await datosTabla(
    "/admin/query_sql/modulos_sistema.php",
  );
  dataTable(modulos_sistema, "#tabla_modulos_sistema", [
    { data: "id", title: "id" },
    { data: "sistema_nombre", title: "sistema_nombre" },
    {
      data: "estatus",
      title: "estatus",
      render: function (data, type, row) {
        return data === "t"
          ? '<span class="badge bg-success">Activo</span>'
          : '<span class="badge bg-secondary">Inactivo</span>';
      },
    },
    {
      data: null,
      title: "Acción",
      orderable: false,
      render: function (data, type, row) {
        const esActivo = row.estatus === "t";
        return `
    <button class="btn btn-${esActivo ? "warning" : "success"} btn-sm me-2 btn-toggle-estado" data-id="${row.id}" data-estado="${esActivo ? "f" : "t"}">
      ${esActivo ? "Inactivar" : "Activar"}
    </button>
    <button class="btn btn-danger btn-sm" id="delete-${row.id}"><i class="fa fa-trash"></i></button>
  `;
      },
    },
  ]);
})();

document
  .querySelector("#tabla_modulos_sistema")
  .addEventListener("click", async (e) => {
    // vericicamos si es el boton
    const boton_estatus = e.target.closest(".btn-toggle-estado");

    if (boton_estatus) {
      const id = boton_estatus.getAttribute("data-id");
      const nuevo_estado = boton_estatus.getAttribute("data-estado");

      console.log(`ID: ${id}, Nuevo Estatus: ${nuevo_estado}`);
    }
  });
