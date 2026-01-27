import React, { useRef } from 'react'
import { FileUpload } from 'primereact/fileupload'
import { Button } from 'primereact/button';
import { readExcel } from '../../shared/utilities/readExcel';
import { ParsedObjectsResult } from 'read-excel-file';



interface Props {
    callback: ( data: any[][]|ParsedObjectsResult<object> | null ) => void, 
    handleError?: (error: any) => void, 
    schema?: Record<string, { prop: string, type? }&Record<string, any>>
}

export const UploadAndReadXls = ({ callback, handleError, schema }: Props) => {
    const uploadComp = useRef<any>(null); 
    
    const customUploader = async({files}) => {
        const file = files[0];
        try {
            const excel = await readExcel(file, { schema })
            callback(excel)
            // console.log(excel?.rows);
            // const res = await UseFetchPost(`${API}/api/rutasAll`, excel?.rows);
            // console.log('rutas cargadas', res);
        } catch (error) {
            // console.error(error);
            !!handleError && handleError(error)
        }
    }

    return (
    <>
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
