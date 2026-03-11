document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-salida-material');

    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        // Captura de valores
        const credencial = document.getElementById('id_credencial').value.trim();
        const nombre = document.getElementById('nombre_trabajador').value.trim();
        const codigo = document.getElementById('codigo_material').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const cantidad = document.getElementById('cantidad').value.trim();
        const unidad = document.getElementById('unidad').value.trim();
        const estado = document.getElementById('estado_entrega').value.trim();
        const fecha = document.getElementById('fecha').value.trim();



   //condiciones de los campos
        if (credencial === "") {
            Swal.fire({icon: 'warning',title: 'Credencial Requerida',confirmButtonColor: '#00332b'
            });
            return;
        }

        if (credencial.length < 3) {
            Swal.fire({icon: 'warning',title: 'ID Inválido',confirmButtonColor: '#00332b'
            });
            return;
        }


        if (nombre === "") {
            Swal.fire({icon: 'warning',title: 'Falta nombre del trabajador',confirmButtonColor: '#00332b'
            });
            return;
        }


        if (codigo === "") {
            Swal.fire({icon: 'warning',title: 'Falta código del material',confirmButtonColor: '#00332b'
            });
            return;
        }


        if (descripcion === "") {
            Swal.fire({icon: 'warning',title: 'Falta descripción del material',confirmButtonColor: '#00332b'
            });
            return;
        }


        if (cantidad === "" || cantidad <= 0) {
            Swal.fire({icon: 'warning',title: 'No se ingresó la cantidad',confirmButtonColor: '#00332b'
            });
            return;
        }

        if (unidad === "") {
            Swal.fire({icon: 'warning',title: 'No se ha ingresado la unidad de medida',confirmButtonColor: '#00332b'

            });
            return;
        }
        if (estado === "" || estado === null) {
            Swal.fire({icon: 'warning',title: 'Falta el Estado',confirmButtonColor: '#00332b'
            });
            estado.focus(); 
            return; 
        }

        if (fecha === "") {
            Swal.fire({icon: 'warning',title: 'Fecha Requerida',text: 'Indica la fecha y hora de la entrega.',confirmButtonColor: '#00332b'
            });
            return;
        }
        
        Swal.fire({icon: 'success',title: 'Salida Validada',text: '¡Toda la información es correcta!',showConfirmButton: false,
            timer: 2000
        });
    });
});