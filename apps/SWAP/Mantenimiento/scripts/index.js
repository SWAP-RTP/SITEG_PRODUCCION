import { datosTabla, dataTable } from "/Mantenimiento/includes/scripts/dataTable_v2.js";
import { API_ROUTES } from "/Mantenimiento/includes/scripts/api_routes.js";
import { obtenerModulo } from "/Mantenimiento/includes/scripts/obtenerModulos.js";
import { buscarCredencial } from "/Mantenimiento/includes/scripts/buscarCredencial.js";
import { obtenerRutas } from "/Mantenimiento/includes/scripts/obtenerRutas.js";
import { obtenerCatalogoFallas } from "/Mantenimiento/includes/scripts/obtenerCatalogo_fallas.js";
import { validarInptus } from "/Mantenimiento/includes/scripts/validacion_inptus.js";



//! ***************** Obtener modulos ******************* */
obtenerModulo(API_ROUTES.obtenerModulo, "modulo_actual", "span");
(async () => {
  const datos = await datosTabla(API_ROUTES.dataTable);

  //Se inicializa la tabla 
  const table = dataTable(datos, "#tabla_mant_eco", [
    { data: "orden_correctivo", title: "Numero de orden" },
    { data: "economico", title: "Economico" },
    { data: "kilometraje", title: "Kilometraje" },
    { data: "modulo", title: "Modulo" },
    { data: "ruta", title: "Ruta" },
    { data: "falla_descripcion_operador", title: "Descripcion de la falla" },
    { data: "operador", title: "Credencial del Operador" },
    { data: "fecha_alta_correctivo", title: "Fecha de alta" },
    {
      data: null,
      title: "Acciones",
      render: function (data, type, row) {
        return `<div class="d-flex justify-content-center">
                        <button class="btn btn-primary btn-sm btn-accion-ver">
                             Ver más
                        </button>
                    </div>`;
      }
    },
  ]);

  const style = document.createElement('style');
  style.innerHTML = `#tabla_mant_eco_wrapper .dt-buttons { display: none !important; }`;
  document.head.appendChild(style);

  const tablaElemento = document.querySelector('#tabla_mant_eco');

  tablaElemento.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-accion-ver');
    if (btn) {
      const filaData = $("#tabla_mant_eco").DataTable().row(btn.closest('tr')).data();
      const fechayhora = filaData.fecha_alta_correctivo;

      let fecha = "N/A";
      let hora = "N/A";

      if (fechayhora) {
        const partes = fechayhora.split(" ");
        fecha = partes[0];
        hora = partes[1];
      }

      //Llenado del modal
      document.getElementById('ruta').value = filaData.ruta;
      document.getElementById('economico').value = filaData.economico;
      document.getElementById('hora').value = hora;
      document.getElementById('fecha').value = fecha;

      //Se muestra el modal
      const modalElemento = document.getElementById('modalDetalleOrden');
      const myModal = new bootstrap.Modal(document.getElementById('modalDetalleOrden'));
      myModal.show();

      modalElemento.addEventListener('shown.bs.modal', function () {
        //! ***************** Obtener catalogo fallas ******************* */
        obtenerCatalogoFallas(API_ROUTES.obtenerCatalogo_fallas);
        //! ***************** Buscar credenciales ******************* */
        buscarCredencial(
          API_ROUTES.buscarCredencial, // URL del endpoint PHP
          "operador", // ID del input de credencial
          "nombre_operador", // ID del input de nombre
          "lista-sugerencias", // ID del <ul> para sugerencias
        );
        buscarCredencial(
          API_ROUTES.buscarCredencial, // URL del endpoint PHP
          "jefe_oficina", // ID del input de credencial
          "nombre_jefe_oficina", // ID del input de nombre
          "lista-sugerencias-jefe", // ID del <ul> para sugerencias
        );
        buscarCredencial(
          API_ROUTES.buscarCredencial, // URL del endpoint PHP
          "jud", // ID del input de credencial
          "nombre_jud", // ID del input de nombre
          "lista-sugerencias-jud", // ID del <ul> para sugerencias
        );

        // *************************** Validar inputs con alerta TOAST y SweetAlert ************************//
        validarInptus("btn_alta", "form-alta", [
          "operador",
          "jefe_oficina",
          "jud",
          "falla"
        ]);
      }, { once: true });
    }
  });
})();