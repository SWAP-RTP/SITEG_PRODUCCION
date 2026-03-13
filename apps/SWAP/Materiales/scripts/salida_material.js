document.addEventListener('DOMContentLoaded', () => {
    const btnAgregar = document.getElementById('btn-agregar-lista');
    const tablaCuerpo = document.querySelector('#tabla-previa tbody');
    const inputCredencial = document.getElementById('id_credencial');
    const inputNombreTrab = document.getElementById('nombre_trabajador');
    
    // Inputs del material
    const inputCodMat = document.getElementById('codigo_material');
    const inputDescMat = document.getElementById('descripcion');
    const inputCantMat = document.getElementById('cantidad');
    const inputEstadoMat = document.getElementById('id_estado_material');
    const inputUnidadMat = document.getElementById('unidad');

    let listaSalida = []; // Array que guarda los materiales

    // 1. Agregar material a la tabla de previsualización
    btnAgregar.addEventListener('click', () => {
        const codigo = inputCodMat.value.trim();
        const desc = inputDescMat.value.trim();
        const cant = parseInt(inputCantMat.value);
        const estadoVal = inputEstadoMat.value;
        const estadoTexto = inputEstadoMat.options[inputEstadoMat.selectedIndex].text;

        // Validaciones básicas de línea
        if (codigo === "" || isNaN(cant) || cant <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Datos incompletos',
                text: 'Asegúrese de seleccionar un material y una cantidad válida.',
                confirmButtonColor: '#00332b'
            });
            return;
        }

        // Agregar al objeto global
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

    // 2. Función para dibujar la tabla
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

    // 3. Función para limpiar solo los campos del material
    function limpiarSeccionMaterial() {
        inputCodMat.value = '';
        inputDescMat.value = '';
        inputCantMat.value = '';
        inputUnidadMat.value = '';
        inputCodMat.focus();
    }

    // 4. Eliminar item (Se hace global para el botón de la tabla)
    window.quitarItem = (index) => {
        listaSalida.splice(index, 1);
        renderizarTabla();
    };

    // 5. Botón Finalizar (Simulación de envío masivo)
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
        
        console.log("Datos para PHP:", {
            trabajador: inputCredencial.value,
            materiales: listaSalida
        });
    });
});