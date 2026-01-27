import { useEffect, useState } from 'react'

import validarRol from './forUseValidation/validateRol';
import { DataRol, Err_page, PeriodoApi, ValRol } from './interfaces';



const useValidateRoles = (file:File|undefined, mod: number, periodo: PeriodoApi) => {

    const [errores, setErrores] = useState<Err_page[]>([]);
    const [rolData, setRolData] = useState<DataRol[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showErr, setShowErr] = useState(false);
    const [canUpload, setCanUpload] = useState(true)
    const [cont, setCont] = useState(0);


    const setProgress = ( n:number ) => {
        setCont(n)
    }


    const handleRes = (res: ValRol[]) => {
        const errores = res.map( ({hoja, err}) => err.length>0 ? {hoja, err} : null).filter(Boolean)
        const data = res.map( ({hoja, data}) => data ? {hoja, data} : null).filter(Boolean)
        console.log('handleRes-data', data);
        console.log('handleRes-errores', errores);
        
        setErrores(errores as Err_page[] )
        setRolData(data as DataRol[])

        setTimeout(() => {
            setCanUpload(false)
            setShowErr(true)
            setIsLoading(false)
        }, 1500);
    }


    useEffect(() => {
        if(file && (errores.length==0 || rolData.length==0)){
            setIsLoading(true)
            validarRol( file, {setProgress, mod, periodo} )
            .then( handleRes )
        }
        
    }, [file])

    
    const cleanStates = () => {
        setErrores([])
        setShowErr(false)
        setCanUpload(true)
        setCont(0)
        setRolData([])
    }
    
    return {
        cleanStates,
        errores,
        rolData,
        isLoading,
        showErr,
        canUpload,
        cont
  }
}

export default useValidateRoles