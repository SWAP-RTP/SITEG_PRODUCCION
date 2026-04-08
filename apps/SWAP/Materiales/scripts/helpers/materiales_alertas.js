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

    function notificarMaterialNuevo(estadoDivId) {
        limpiarBadgeMaterial(estadoDivId);
        mostrarToastMaterialNuevo();
    }

    global.MaterialesAlertas = {
        mostrarAlerta,
        mostrarToastMaterialNuevo,
        notificarMaterialNuevo,
        limpiarBadgeMaterial
    };
})(window);
