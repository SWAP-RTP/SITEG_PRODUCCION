const RegistrarMaterial = async (datos) => {
   const res = await fetch('query_sql/registro_materiales.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
});
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
};
 
const ConsultarMaterial = async (codigo) => {
    const res = await fetch(`query_sql/consulta_materiales.php?codigo=${encodeURIComponent(codigo)}`);
    if (!res.ok) throw new Error('Error en servidor');
    return await res.json();
};
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const $ = (id) => document.getElementById(id);
    const msg = form.parentElement.insertBefore(document.createElement('div'), form);

     // Limpiar mensaje de alerta y enfocar el primer campo al hacer reset
    form.onreset = () => {
        msg.innerHTML = '';
        $('codigo_material')?.focus();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // 1. Capturamos los datos del formulario
        const d = Object.fromEntries(new FormData(form));
        const avisar = (txt, cls) => msg.innerHTML = `<div class="alert alert-${cls} mt-2">${txt}</div>`;

        // 2. MAPEO CRÍTICO: Ajustamos los nombres para el PHP reutilizable
        // El PHP espera $input['area_adscripcion']
        d.area_adscripcion = d.area; 

        // 3. Reglas de validación (usando los IDs del HTML)
        const reglas = [
            { id: 'codigo_material', ok: d.codigo_material?.trim(), msg: 'Código obligatorio' },
            { id: 'material',        ok: d.material?.trim(),        msg: 'Descripción obligatoria' },
            { id: 'area',            ok: d.area !== '',             msg: 'Seleccione un área' },
            { id: 'nombre_registra', ok: d.nombre_registra?.trim(), msg: 'Nombre de responsable obligatorio' }
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
        if (resultado.success) {
            const folio = resultado.data?.[0]?.codigo_material || d.codigo_material;
            avisar(`Éxito. Material registrado con código: ${folio}`, 'success');
                /*form.reset(); Con este reset se limpia el formulario  cuando se le da click
                en el bootn de "Guardar registro", por eso se omite
                */
            $('codigo_material')?.focus();
        } else {
            avisar(resultado.error || 'Error desconocido', 'danger');
        }
    } catch (err) {
        avisar(err.message, 'danger');
    }
       
    };
   
});