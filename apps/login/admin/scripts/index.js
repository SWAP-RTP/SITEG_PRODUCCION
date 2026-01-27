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
    buttons: [
      {
        extend: "csvHtml5",
        text: "CSV",
        className: "btn btn-success rounded-pill me-2",
      },
      {
        extend: "pdfHtml5",
        text: "PDF",
        className: "btn btn-success rounded-pill",
      },
    ],
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
    { data: "contrasena", title: "contrasena" },
    { data: "credencial", title: "credencial" },
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
