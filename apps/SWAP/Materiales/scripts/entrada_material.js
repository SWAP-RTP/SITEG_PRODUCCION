document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-entrada-material');
    const Codigo = document.getElementById('codigo_material');
    const Descripcion = document.getElementById('descripcion');
    const btnBuscar = document.getElementById('btn-buscar');

    // 1. Mayúsculas
    [Codigo, Descripcion].forEach(input => {
        input.addEventListener('input', function () {
            const start = this.selectionStart;
            this.value = this.value.toUpperCase();
            this.setSelectionRange(start, start);
        });
    });

    // --- NUEVO: FETCH DE BÚSQUEDA (GET) ---
    const realizarBusqueda = () => {
        const codigoIngresado = Codigo.value.trim();

        fetch(`query_sql/procesar_entrada.php?buscar_codigo=${codigoIngresado}`)
            .then(res => {
                if (!res.ok) throw new Error('Error en el servidor');
                return res.text(); // Primero lo leemos como texto plano
            })
            .then(text => {
                try {
                    const response = JSON.parse(text);
                    if (response.status === 'found') {
                        Descripcion.value = response.data.descripcion_material;
                        document.getElementById('unidad').value = response.data.nomenclatura_material;
                        document.getElementById('ubicacion').value = response.data.ubicacion_fisica_material;

                        Descripcion.readOnly = true;
                        Descripcion.classList.add('bg-light');
                    } else {
                        // Si no se encuentra, desbloqueamos para registro nuevo
                        Descripcion.readOnly = false;
                        Descripcion.classList.remove('bg-light');
                    }
                } catch (err) {
                    console.error("El servidor devolvió algo que no es JSON:", text);
                }
            })
            .catch(err => console.error("Error en la petición:", err));

    };

    Codigo.addEventListener('input', realizarBusqueda);
    btnBuscar.addEventListener('click', realizarBusqueda);

    // --- ENVÍO AL PHP ---
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtenemos los ELEMENTOS (Tus variables originales para guiarte)
        const elCodigo = document.getElementById('codigo_material');
        const elDesc = document.getElementById('descripcion');
        const elCant = document.getElementById('cantidad_material');
        const elUnidad = document.getElementById('unidad');
        const elUbic = document.getElementById('ubicacion');
        const elFecha = document.getElementById('fecha');

        if (elCodigo.value.trim() === "") {
            Swal.fire({ icon: 'warning', title: 'Ingrese código', confirmButtonColor: '#00332b' });
            elCodigo.focus();
            return;
        }

        if (elDesc.value.trim() === "") {
            Swal.fire({ icon: 'warning', title: 'Ingrese descripción', confirmButtonColor: '#00332b' });
            elDesc.focus();
            return;
        }

        if (elCant.value.trim() === "" || parseFloat(elCant.value) <= 0) {
            Swal.fire({ icon: 'warning', title: 'Ingrese una cantidad válida', confirmButtonColor: '#00332b' });
            elCant.focus();
            return;
        }

        if (elUnidad.value.trim() === "") {
            Swal.fire({ icon: 'warning', title: 'Ingrese Unidad de Medida', confirmButtonColor: '#00332b' });
            elUnidad.focus();
            return;
        }

        if (elUbic.value.trim() === "") {
            Swal.fire({ icon: 'warning', title: 'Ubicación Vacía', confirmButtonColor: '#00332b' });
            elUbic.focus();
            return;
        }

        if (elFecha.value.trim() === "") {
            Swal.fire({ icon: 'warning', title: 'Fecha Requerida', confirmButtonColor: '#00332b' });
            elFecha.focus();
            return;
        }

        // --- FETCH DE ENVÍO (POST) ---
      
        const datos = new FormData(formulario);

        fetch('query_sql/procesar_entrada.php', {
            method: 'POST',
            body: datos
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registrado!',
                        text: data.message,
                        confirmButtonColor: '#00332b'
                    }).then(() => {
                        formulario.reset();
                        elDesc.readOnly = false;
                        elDesc.classList.remove('bg-light');
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                }
            })
            .catch(error => {
                Swal.fire({ icon: 'error', title: 'Error de conexión' });
            });
    });
});