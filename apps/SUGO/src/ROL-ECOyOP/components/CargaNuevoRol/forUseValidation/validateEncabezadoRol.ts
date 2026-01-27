import { Cell } from "read-excel-file/types";
import { Err } from "../interfaces";


//#! Hacer peticiones desde antes 

interface HeaderRolExcel {
    "periodo":    Cell,
    "ori_des":    Cell,
    "ruta":       Cell,
    "modalidad":  Cell,
}

const validateEncabezadoRol = (header: HeaderRolExcel) => {
    const errors: Err[] = []
    const errorsCriticos: Err[] = []
    const {modalidad, ori_des, periodo, ruta} = header

    //* Validaciones: Periodo, Ruta, Modalidad, Origen-Desino

    //! Error critico: No se encontro la ruta en el rol
    if(!ruta && typeof ruta == 'string') errorsCriticos.push({msg: 'Hace falta ruta'})
    else {
        try {
            //! Error critico: No se encontro la ruta en la lista autorizada
            // const rutasOficiales = await UseFetchGet('API')
            // if( !(rutasOficiales.includes(ruta)) ) errorsCriticos.push({msg: 'La ruta no esta en la lista de rutas autorizadas'})
            
        } catch (error) {
            throw new Error(`Fallo al consultar las rutas oficiales en validateEncabezadoRol; ${error}`)
        }
    } 
    
    //! Error critico: No se encontro la modalidad en el rol
    if(!modalidad && typeof modalidad == 'string') errorsCriticos.push({msg: 'Hace falta modalidad'})
    else {
        try {
            //! Error critico: No se encontro la modalidad en la lista autorizada
            // const modalidadesOficiales = await UseFetchGet('API 2')
            // if( !(modalidadesOficiales.includes(modalidad)) ) errorsCriticos.push({msg: 'La modalidad no esta en la lista de modalidades autorizadas'})
            
        } catch (error) {
            throw new Error(`Fallo al consultar las modalidades oficiales en validateEncabezadoRol; ${error}`)
        }
    } 
    
    // ToDo: validations to Periodo, Ori-Des
    //! error normal: to Periodo, Ori-Des

    if(!header == false) return { errorsCriticos, errors }

    return null
}

export default validateEncabezadoRol    