
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-inventario');

    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

     
        const codigo = document.getElementById('codigo_material').value.trim();
        const categoria = document.getElementById('categoria').value;
        const ubicacion = document.getElementById('ubicacion').value.trim();
        const unidad = document.getElementById('unidad').value.trim();
        const stockMin = document.getElementById('stock_minimo').value.trim();
        const fecha = document.getElementById('fecha').value.trim();


        //condiciones de los campos
        if (codigo === "") {
            Swal.fire({ icon: 'warning', title: 'Código Requerido', confirmButtonColor: '#00332b' });
            return;
        }


        if (categoria === "") {
            Swal.fire({ icon: 'warning', title: 'Selecciona una Categoría', confirmButtonColor: '#00332b' });
            return;
        }


        if (ubicacion === "") {
            Swal.fire({icon: 'warning',title: 'Falta Ubicación',confirmButtonColor: '#00332b' 
            });
            return;
        }

        if (stockMin === "" || parseInt(stockMin) <= 0) {
            Swal.fire({icon: 'error', title: 'Stock Mínimo Inválido', confirmButtonColor: '#00332b' 
            });
            return;
        }


        if (fecha === "") {
            Swal.fire({ icon: 'warning', title: 'Fecha Obligatoria', confirmButtonColor: '#00332b' });
            return;
        }


        Swal.fire({icon: 'success',title: 'Material Registrado',text: '¡Se ha actualizado el catálogo correctamente.!',showConfirmButton: false,
            timer: 2000
        }).then(() => {
           
        });
    });
        });
        const btnConsultar = document.getElementById('btnConsultarInventario');
        btnConsultar.addEventListener('click', () => {
            fetch('query_sql/buscar_material.php?codigo=' + document.getElementById('codigo_material').value.trim())
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById('tablaInventario').querySelector('tbody');
                tbody.innerHTML = '';
                if (data.error) {
                    alert(data.error);
                    return;
                }
                if (Array.isArray(data)) {
                    data.forEach(m => {
                        const alerta = m.stock_actual <= m.stock_minimo_material ? 'table-danger' : '';
                        tbody.innerHTML += `
                            <tr class="${alerta}">
                                <td>${m.codigo_material}</td>
                                <td>${m.descripcion_material}</td>
                                <td>${m.nomenclatura_material}</td>
                                <td>${m.ubicacion_fisica_material}</td>
                                <td>${m.stock_actual}</td>
                            </tr>
                        `;
                    });
                }
            });
        });
    