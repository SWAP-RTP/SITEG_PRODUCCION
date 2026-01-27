
export const useUpImage = async( api, data={ nombre, estatus, archivo, path} ) => {

    const { nombre, estatus, img:archivo, path} = data

    if(!archivo) throw new Error('No hay archivo que subir');
    
    const formData = new FormData();        //Se crea el form data de la petición

    formData.append('nombre', `${nombre}`);
    formData.append('estatus', `${estatus}`);
    formData.append('path', `${path}`);
    formData.append('imagen', archivo);


    try {
        const res = await fetch(api,{
            method: 'POST',
            body: formData
        });
        
        // console.log('respuesta de subida de img correcta',res);
        return res


    } catch (error) {
        console.log('error de subida de img', error);
        throw new Error('Fallo la subida del archivo');
    }
}
