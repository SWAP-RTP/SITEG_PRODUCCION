const RegistrarDatos = async (datos) => {
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Fallo en la conexion con la API');
    return await respuesta.json();
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    const $ = (id) => document.getElementById(id);
    const msg = Object.assign(document.createElement('div'));
    form.prepend(msg);

    const mostrar = (html) => msg.innerHTML = html;
    const validar = (campo, condicion, texto) => condicion || (mostrar(`<div class="alert alert-warning">${texto}</div>`), $(campo)?.focus(), false);
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        d.accion = $('accion')?.value || '';

        if (!validar('material', d.material?.trim(), 'El campo Material es obligatorio') || !validar('cantidad', d.cantidad > 0, 'La Cantidad debe ser mayor a 0') || !validar('credencial', d.credencial?.trim(), 'La Credencial es obligatoria') || !validar('area', d.area && d.area !== 'Selecciona...', 'Debe seleccionar un Área'))
            return;

        try {
            mostrar('<div class="alert alert-info">Procesando...</div>');
            const res = await RegistrarDatos(d);
            mostrar(`<div class="alert alert-success"> Registrado con exito (Folio: ${res.id})</div>`);
            form.reset();
            $('material')?.focus();
        } catch (error) {
            mostrar(`<div class="alert alert-danger">Error: ${error.message}</div>`);
        }
    };
});