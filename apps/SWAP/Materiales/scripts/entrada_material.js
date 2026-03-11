document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-entrada-material');

    formulario.addEventListener('submit', function(e) {
        
        e.preventDefault(); 

      
        const codigo = document.getElementById('codigo_material').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const cantidad = document.getElementById('cantidad_material').value.trim();
        const unidad = document.getElementById('unidad').value.trim();
        const ubicacion = document.getElementById('ubicacion').value.trim() ;
        const fecha = document.getElementById('fecha').value.trim();

     
     //condiciones de los campos
        if (codigo === "") {
            Swal.fire({icon: 'warning',title: 'Ingrese código',confirmButtonColor: '#00332b'});
            codigo.focus(); 
            return;
        }

       
        if (descripcion === "") {
            Swal.fire({icon: 'warning',title: 'Ingrese descripcion',confirmButtonColor: '#00332b'
            });
            descripcion.focus();
            return; 
        }

        
        if (cantidad === "" || parseFloat(cantidad.value) <= 0) {
            Swal.fire({icon: 'warning',title: 'Ingresado la cantidad',confirmButtonColor: '#00332b'
            });
            cantidad.focus();
            return; 
        }

       
        if (unidad === "") {
            Swal.fire({icon: 'warning',title: 'Ingrese Unidad de Medida', confirmButtonColor: '#00332b'
            });
            unidad.focus();
            return;
        }

      

        if (ubicacion=== "") {
            Swal.fire({icon: 'warning',title: 'Ubicación Vacía',confirmButtonColor: '#00332b'
            });
            ubicacion.focus();
            return;
        }

   
        if (fecha === "") {
            Swal.fire({icon: 'warning',title: 'Fecha Requerida',confirmButtonColor: '#00332b'
            });
            fecha.focus();
            return;
        }

        
        Swal.fire({
            icon: 'success',
            title: '¡Campos registrados correctamente!',
            confirmButtonColor: '#00332b'
        });
    });
});