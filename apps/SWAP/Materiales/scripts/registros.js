async function consultarFolio() {
    try {
        const response = await fetch('query_sql/materiales_guardados.php?tipo=folio');
        const data = await response.json();
        if (data.folio_material) {
            document.getElementById('folio').value = data.folio_material;
        }
    } catch (error) {
        document.getElementById('folio').value = '';
    }
}

async function mostrarModal() {
    const url = 'query_sql/consultas_materiales.php?tipo=entrada&limite=20&pagina=1';
    try {
        const response = await fetch(url);
        const resultado = await response.json();

        let tabla = '';
        if (!resultado.datos || resultado.datos.length === 0) {
            tabla = '<p>No hay registros.</p>';
        } else {
            tabla = `
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Descripción</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            resultado.datos.forEach(reg => {
                tabla += `
                    <tr>
                        <td>${reg.folio_entrada || reg.folio_material || ''}</td>
                        <td>${reg.descripcion_material || ''}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="alert('Acción para ${reg.folio_entrada || reg.folio_material}')">Seleccionar</button>
                        </td>
                    </tr>
                `;
            });
            tabla += `
                    </tbody>
                </table>
            `;
        }

        document.getElementById('contenedor-materiales-modal').innerHTML = tabla;
        var modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        modal.show();
    } catch (error) {
        document.getElementById('contenedor-materiales-modal').innerHTML = '<p>Error al cargar los registros.</p>';
        var modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        modal.show();
    }
}

async function registrar(EnviarDAtos) {
    try {
        const response = await fetch('query_sql/materiales_guardados.php', {
            method: 'POST',
            body: EnviarDAtos
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                title: "¡El Material fue guardado con éxito!",
                icon: "success",
                confirmButtonText: "Aceptar",
                draggable: true
            });
            document.getElementById('form-entrada-material').reset();
            consultarFolio(); // Corrige aquí si tu función se llama diferente
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudo guardar el material.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Ocurrió un error en la petición.",
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    }
}

async function mostrarRegistrosEntradas() {
    try {
        const response = await fetch('query_sql/consultas_materiales.php?tipo=entradas');
        const resultado = await response.json();

        if (!resultado.datos || resultado.datos.length === 0) {
            document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">No hay registros.</td></tr>';
            document.getElementById('contenedor-tabla-registros').style.display = 'block';
            return;
        }

        let filas = '';
        resultado.datos.forEach(reg => {
            filas += `
                <tr>
                    <td>${reg.folio_material}</td>
                    <td>${reg.descripcion_material_entrada}</td>
                    <td>${reg.adscripcion_modulo}</td>
                    <td>${reg.descripcion_estado_material}</td>
                    <td>${reg.cantidad_material_entrada}</td>
                    <td>${reg.fecha_registro_entrada}</td>
                </tr>
            `;
        });

        document.getElementById('tabla-registros').innerHTML = filas;
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    } catch (error) {
        document.getElementById('tabla-registros').innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los registros.</td></tr>';
        document.getElementById('contenedor-tabla-registros').style.display = 'block';
    }
}


document.addEventListener('DOMContentLoaded', consultarFolio);
document.getElementById('modal').addEventListener('click', mostrarModal);
document.getElementById('btn-consultar-entradas').addEventListener('click', mostrarRegistrosEntradas);

document.getElementById('form-entrada-material').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
        Swal.fire({
            title: "¡Campos incompletos!",
            text: "Por favor, llena todos los campos obligatorios.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            draggable: true
        });
        document.getElementById('form-entrada-material').reset();
        return;
    }

    const datos = new FormData(this);

    if (datos.get('cantidad') < 1) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "La cantidad debe ser mayor a 0!"
        });
        return;
    }

    Swal.fire({
        title: "¿Deseas guardar el registro de entrada?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        denyButtonText: "No guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            registrar(datos);
        } else if (result.isDenied) {
            Swal.fire({
                title: "Registro cancelado",
                text: "No se guardó el registro.",
                icon: "info",
                confirmButtonText: "Aceptar"
            });
        }
    });
});