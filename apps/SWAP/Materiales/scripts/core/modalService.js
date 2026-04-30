import { MaterialesService } from './materialesService.js';
export const ModalService = {
    async abrir({ modalId, contenedorId, callback }) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        const data = await MaterialesService.obtenerMateriales();
        this.render(data.datos || [], contenedorId, callback, modalId);
    },
    render(materiales, contenedorId, callback, modalId) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;
        let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Descripción</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
        `;
        materiales.forEach(m => {
            html += `
                <tr>
                    <td>${m.folio_material}</td>
                    <td>${m.descripcion_material}</td>
                    <td>
                        <button class="btn btn-sm btn-primary seleccionar-material"
                            data-folio="${m.folio_material}">
                            Seleccionar
                        </button>
                    </td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        contenedor.innerHTML = html;
        contenedor.querySelectorAll('.seleccionar-material').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folio = e.currentTarget.dataset.folio;
                callback(folio);
                bootstrap.Modal.getInstance(
                    document.getElementById(modalId)
                ).hide();
            });
        });
    }
};