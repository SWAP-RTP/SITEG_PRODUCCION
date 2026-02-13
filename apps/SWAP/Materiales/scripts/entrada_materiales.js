const RegistrarMaterial = async (datos) => {
    const res = await fetch('/app-swap/Materiales/query_sql/registro_materiales.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const $ = (id) => document.getElementById(id);
    // Crea el contenedor de mensajes arriba del formulario
    const msg = form.parentElement.insertBefore(document.createElement('div'), form);

    form.onsubmit = async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls}">${txt}</div>`;

        // Reglas de validación
        const reglas = [
            { id: 'codigo_material', ok: d.codigo_material?.trim(), msg: 'Código obligatorio' },
            { id: 'material',        ok: d.material?.trim(),        msg: 'Nombre obligatorio' },
            { id: 'nombre_registra', ok: d.nombre_registra?.trim(), msg: 'Nombre del responsable obligatorio' },
            { id: 'area',            ok: d.area !== '',             msg: 'Seleccione un área' }
        ];

        const error = reglas.find(r => !r.ok);
        if (error) {
            avisar(error.msg, 'warning');
            $(error.id)?.focus();
            return;
        }

        try {
            avisar('Procesando...', 'info');
            const resultado = await RegistrarMaterial(d);
            avisar(`Éxito. Folio: ${resultado.id}`, 'success');
            form.reset();
            $('codigo_material')?.focus();
        } catch (err) {
            avisar(err.message, 'danger');
        }
    };
});