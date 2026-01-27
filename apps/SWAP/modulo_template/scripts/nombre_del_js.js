// AQUI INSERTA EL CODIGO
function listar() {
    $.ajax({
        url: "query_sql/nombre_del_php.php",
        type: "POST",
        success: function (datos) {
            let json = JSON.parse(datos);
            console.log(json);
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
            { "data": "modulo", "className": "text-center" }
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

$(document).ready(function () {
    $('#nombre_apartado').addClass('show');
    $('#nombre_apartado').removeClass('text-light');
    $('#nombre_apartado').addClass('text-dark bg-secondary-subtle');

     listar();
});