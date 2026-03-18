document.addEventListener('DOMContentLoaded', () => {
    const btnAgregar = document.getElementById('btn-agregar-lista');
    const tablaCuerpo = document.querySelector('#tabla-previa tbody');
    const inputCredencial = document.getElementById('id_credencial');
    const inputNombreTrab = document.getElementById('nombre_trabajador');
    const inputCodMat = document.getElementById('codigo_material');
    const inputDescMat = document.getElementById('descripcion');
    const inputCantMat = document.getElementById('cantidad');
    const inputEstadoMat = document.getElementById('id_estado_material');
    // El campo unidad es opcional, si no existe puedes eliminarlo
    const inputUnidadMat = document.getElementById('unidad');

    let listaSalida = [];

    // Autocompletar nombre de trabajador
    inputCredencial.addEventListener('input', () => {
        const credencial = inputCredencial.value.trim();
        // Cambia el número según la longitud de tus credenciales
        if (credencial.length < 3) {
            inputNombreTrab.value = "";
            return;
        }
        fetch('query_sql/buscar_trabajador.php?credencial=' + encodeURIComponent(credencial))
            .then(res => res.json())
            .then(data => {
                if (data.nombre) {
                    inputNombreTrab.value = data.nombre;
                } else {
                    inputNombreTrab.value = "";
                    Swal.fire({
                        icon: 'warning',
                        title: 'Trabajador no encontrado',
                        text: 'No existe la credencial ingresada.',
                        confirmButtonColor: '#00332b'
                    });
                }
            })
            .catch(() => {
                inputNombreTrab.value = "";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo consultar el trabajador.',
                    confirmButtonColor: '#00332b'
                });
            });
    });

    // Autocompletar descripción de material
    inputCodMat.addEventListener('change', () => {
        const codigo = inputCodMat.value.trim();
        if (codigo === "") {
            inputDescMat.value = "";
            return;
        }
        fetch('query_sql/buscar_material.php?codigo=' + encodeURIComponent(codigo))
            .then(res => res.json())
            .then(data => {
                if (data.descripcion_material) {
                    inputDescMat.value = data.descripcion_material;
                } else {
                    inputDescMat.value = "";
                    Swal.fire({
                        icon: 'warning',
                        title: 'Material no encontrado',
                        text: 'No existe el código ingresado.',
                        confirmButtonColor: '#00332b'
                    });
                }
            })
            .catch(() => {
                inputDescMat.value = "";
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo consultar el material.',
                    confirmButtonColor: '#00332b'
                });
            });
    });

    // Agregar material a la lista
    btnAgregar.addEventListener('click', () => {
        const codigo = inputCodMat.value.trim();
        const desc = inputDescMat.value.trim();
        const cant = parseInt(inputCantMat.value);
        const estadoVal = inputEstadoMat.value;
        const estadoTexto = inputEstadoMat.options[inputEstadoMat.selectedIndex].text;

        if (codigo === "" || isNaN(cant) || cant <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Datos incompletos',
                text: 'Asegúrese de seleccionar un material y una cantidad válida.',
                confirmButtonColor: '#00332b'
            });
            return;
        }

        const nuevoItem = {
            codigo: codigo,
            descripcion: desc,
            cantidad: cant,
            estado_id: estadoVal,
            estado_txt: estadoTexto
        };

        listaSalida.push(nuevoItem);
        renderizarTabla();
        limpiarSeccionMaterial();
    });

    // Renderizar tabla
    function renderizarTabla() {
        if (listaSalida.length === 0) {
            tablaCuerpo.innerHTML = '<tr class="text-center text-muted"><td colspan="5">No hay materiales en la lista.</td></tr>';
            return;
        }
        tablaCuerpo.innerHTML = '';
        listaSalida.forEach((item, index) => {
            const fila = `
                <tr>
                    <td>${item.codigo}</td>
                    <td>${item.descripcion}</td>
                    <td class="text-center">${item.cantidad}</td>
                    <td class="text-center">${item.estado_txt}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm" onclick="quitarItem(${index})">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </td>
                </tr>
            `;
            tablaCuerpo.innerHTML += fila;
        });
    }

    // Limpiar campos
    function limpiarSeccionMaterial() {
        inputCodMat.value = '';
        inputDescMat.value = '';
        inputCantMat.value = '';
        if (inputUnidadMat) inputUnidadMat.value = '';
        inputCodMat.focus();
    }

    // Eliminar item
    window.quitarItem = (index) => {
        listaSalida.splice(index, 1);
        renderizarTabla();
    };

    // Finalizar salida y enviar al backend
    document.querySelector('.btn-success.px-4').addEventListener('click', () => {
        if (inputCredencial.value === "" || listaSalida.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Debe ingresar la credencial y al menos un material en la lista.',
                confirmButtonColor: '#00332b'
            });
            return;
        }

        Swal.fire({
            icon: 'info',
            title: 'Procesando Salida',
            text: `Se registrarán ${listaSalida.length} artículos para el trabajador.`,
            confirmButtonColor: '#00332b'
        });

        fetch('query_sql/registrar_salida.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trabajador: inputCredencial.value,
                materiales: listaSalida
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Salida registrada', data.mensaje, 'success');
                listaSalida = [];
                renderizarTabla();
                inputCredencial.value = '';
                inputNombreTrab.value = '';
            } else {
                Swal.fire('Error', data.mensaje, 'error');
            }
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo registrar la salida.', 'error');
        });
    });
});