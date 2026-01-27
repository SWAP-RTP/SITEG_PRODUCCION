import React, { useRef } from 'react'
import { FileUpload } from 'primereact/fileupload'
import { Button } from 'primereact/button';
import { readExcel } from '../../shared/utilities/readExcel';
import { UseFetchPost } from '../../shared/helpers-HTTP';


const API = import.meta.env.VITE_SUGO_BackTS



const schema = { 
    nombre: {prop: 'nombre', type: (val) => `${val}`},  
    modalidad_id: {prop: 'id_autorizada_mod'},  
    swap_ruta: {prop: 'swap_ruta', type: (val) => `${val}`},   
    "ori-des": {prop: 'origen_destino'},
}

export const ActualizarRutas = () => {
    const uploadComp = useRef<any>(null); 
    
    const customUploader = async({files}) => {
        const file = files[0];
        try {
            const excel = await readExcel(file, { schema })
            console.log(excel?.rows);
            const res = await UseFetchPost(`${API}/api/rutasAll`, excel?.rows);
            console.log('rutas cargadas', res);
        } catch (error) {
            console.error(error);
        }
    }
    
    return (
    <>
        <h1> Actualizar Rutas </h1>

        <FileUpload 
            ref={uploadComp} name="demo[]" 
            // accept="xlsx/*" 
            customUpload uploadHandler={customUploader}  
            mode="basic"  maxFileSize={10000000} 
            className='inline mr-3'
        />
        <Button label='clean' severity='danger' onClick={() => uploadComp.current?.clear()} />
    </>
    )
}
