(function (global) {
    function mostrarAlerta({
        icon = 'info',
        title = '',
        text = '',
        confirmButtonColor,
        html,
        toast = false,
        position,
        showConfirmButton,
        timer,
        timerProgressBar,
        didOpen,
        ...opciones
    } = {}) {
        const posicionFinal = position || (toast ? 'top' : 'center');

        return Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor,
            html,
            toast,
            position: posicionFinal,
            showConfirmButton,
            timer,
            timerProgressBar,
            didOpen,
            ...opciones
        });
    }

    function mostrarToastMaterialNuevo() {
        return mostrarAlerta({
            icon: 'warning',
            title: 'Se agregara un nuevo material',
            text: 'Este material no existe en el catalogo.',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
        });
    }

    function limpiarBadgeMaterial(estadoDivId) {
        const estadoDiv = document.getElementById(estadoDivId);
        if (estadoDiv) {
            estadoDiv.innerHTML = '';
        }
    }

    function mostrarBadgeExistencia(estadoDivId, existe) {
        const estadoDiv = document.getElementById(estadoDivId);
        if (!estadoDiv) return;

        if (existe) {
            estadoDiv.innerHTML = `<span class="badge bg-success"><i class="bi bi-check-circle"></i> Material encontrado</span>`;
        } else {
            estadoDiv.innerHTML = `<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-circle"></i> Se va ingresar nuevo material</span>`;
        }
    }

    function notificarMaterialNuevo(estadoDivId) {
        mostrarBadgeExistencia(estadoDivId, false);
    }

    global.MaterialesAlertas = {
        mostrarAlerta,
        mostrarToastMaterialNuevo,
        notificarMaterialNuevo,
        limpiarBadgeMaterial,
        mostrarBadgeExistencia
    };

    global.mostrarAlerta = mostrarAlerta;
    global.mostrarToastMaterialNuevo = mostrarToastMaterialNuevo;
    global.notificarMaterialNuevo = notificarMaterialNuevo;
    global.limpiarBadgeMaterial = limpiarBadgeMaterial;
    global.mostrarBadgeExistencia = mostrarBadgeExistencia;
})(window);
