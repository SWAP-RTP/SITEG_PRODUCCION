document.addEventListener('DOMContentLoaded', function () {
    const codigoInput = document.getElementById('codigo');
    const descripcionInput = document.getElementById('descripcion');
    const existenciaInput = document.getElementById('existencia'); 

    // Debounce se usa para moderar las llamadas excesivas
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Consulta dinámica al escribir el código
    const consultaDinamica = debounce(() => {
        const codigo = codigoInput.value.trim();
        if (!codigo) {
            descripcionInput.value = '';
            existenciaInput.value = 0;
            return;
        }
        fetch(`query_sql/buscar_material.php?codigo=${encodeURIComponent(codigo)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.descripcion_material) {
                    descripcionInput.value = data.descripcion_material;
                    existenciaInput.value = data.existencia || 0;
                } else {
                    descripcionInput.value = '';
                     existenciaInput.value = 0;
                }
            })
            .catch(error => {
                descripcionInput.value = '';
                existenciaInput.value = 0;
                console.error('Error:', error);
            });
    }, 300);



    // Evento input para consulta dinámica
    codigoInput.addEventListener('input', consultaDinamica);

});