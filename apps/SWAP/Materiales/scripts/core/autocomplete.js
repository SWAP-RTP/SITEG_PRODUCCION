import { MaterialesService } from './materialesService.js';

export async function autocompletarBase(folio, config) {
    const result = await MaterialesService.buscarPorFolio(folio);

    if (result.status !== 'ok') {
        alert('No encontrado');
        return null;
    }

    const d = result.datos;

    config.setValues(d);

    if (config.lockFields) {
        MaterialesService.bloquearCampos(config.fields, true);
    }

    return d;
}