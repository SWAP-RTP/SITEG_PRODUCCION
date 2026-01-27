

export const useEditImage = async( api, data={ nombre, estatus, archivo, path} ) => {
  
    const { nombre, estatus, img:archivo, path} = data

    
    const formData = new FormData();        //Se crea el form data de la petición
    
    formData.append('nombre', `${nombre}`);
    formData.append('estatus', `${estatus}`);
    formData.append('path', `${path}`);
    if(!!archivo) formData.append('imagen', archivo); 
    


    try {
        const res = await fetch(api,{
            method: 'PATCH',
            body: formData
        });
        
        // console.log('respuesta de subida de img correcta',res);
        return res


    } catch (error) {
        console.log('error de subida de img', error);
        throw new Error('Fallo la subida del archivo', error);
    }


}
