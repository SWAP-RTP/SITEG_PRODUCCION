// AQUI INSERTA EL CODIGO
function listar(){
    $.ajax({
        url: "query_sql/get_registros.php",
        type: "POST",
        success: function (datos) {
            let json = JSON.parse(datos);
            dbtable(json);
        }
    });
}

const dbtable = (data) => {
    tablaUsuarios = $('#tabla').DataTable({
        data: data,
        "columns": [
            { "data": "credencial", "className": "text-center" },
            { "data": "nombre", "className": "text-center" },
            { "data": "monto", "className": "text-center" },
            { "data": "id", "className": "text-center", render:function(data, type, row){
                return `<button type="button" class="btn btn-danger btn_eliminar" data-id="${row.id}">
                            <i class="fa-solid fa-trash"></i> Eliminar registro
                        </button>`;
            }}
        ],
        fixedHeader: {
            header: false,
            footer: true
        },

        dom: '<"d-flex justify-content-between mb-3 mt-3"lfB>rt<"d-flex justify-content-between mt-3"ip>',//para darle espacio entre los botones mostrar registro, buscar, imprimir, excel y copy
        buttons: [
            {
                text: '<i class="fas fa-print gap-1"></i>',
                titleAttr: 'imprimir',
                attr: {
                    id: 'printReport',
                },
                className: 'custom-btn-print me-1'

            },
            {
                extend: 'excelHtml5',
                text: '<i class="fas fa-file-excel"></i> ',
                titleAttr: 'Exportar a xlsx',
                className: 'btn btn-success me-1',
                title: 'Sueldos anteriores'
            },
            {
                extend: 'copyHtml5',
                text: '<i class="far fa-copy"></i> ',
                titleAttr: 'Copiar datos',
                className: 'btn btn-info me-1'
            },
        ],
        "bDestroy": true,
        "language": {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {

                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            }
        },
        "oAria": {
            "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
        },
    })
}

function guardar(){
    const formulario = document.getElementById("formulario");
    const formData = new FormData(formulario);

    $.ajax({
        url: "query_sql/guardar.php",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (datos) {
            let json = JSON.parse(datos);

            if(json == "error"){
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `No se pudo registrar los datos de la credencial ${formData.get("credencial")}`,
                });
                return;
            }else{
                Swal.fire({
                    icon: "success",
                    title: "Exito !!",
                    text: "Registro guardado",
                    showConfirmButton: false,
                    timer: 1500
                });
                listar();
            }
        }
    });
}

$(document).on("click", ".btn_eliminar", function () {
    const id = $(this).attr('data-id');

    $.ajax({
        url: "query_sql/eliminar.php",
        type: "POST",
        data: {id},
        success: function (datos) {
            let json = JSON.parse(datos);

            if(json == "error"){
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo eliminar el registro",
                });
                return;
            }else{
                Swal.fire({
                    icon: "success",
                    title: "Exito !!",
                    text: "Registro eliminado",
                    showConfirmButton: false,
                    timer: 1500
                });
                listar();
            }
        }
    });
});


$(document).on("change", "#credencial", function () {
    const credencial = document.getElementById('credencial').value;
    $.ajax({
        url: "query_sql/get_trabajador.php",
        type: "POST",
        data: {credencial},
        success: function (datos) {
            let json = JSON.parse(datos);

            if(json[0] == null || json[0] == undefined){
                Swal.fire({
                    icon: "info",
                    title: "Ups..!!",
                    text: `No se encontraron datos relacionados a la credencial ${credencial}`,
                });
                return;
            }
            //si existe un elemento con el id que buscamos le asignamos el value(respuesta del ajax) al value del input html
            Object.entries(json[0]).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                }
            });
        }
    });
});

$(document).ready(function () {
    listar(); 
    $('#nombre_apartado2').addClass('show');
    $('#submenu').removeClass('text-light');
    $('#submenu').addClass('text-dark bg-secondary-subtle');
});