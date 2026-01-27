import React, {createContext, useState, useEffect} from 'react'
import { UseQueryResult, useQuery } from 'react-query';
import { UseFetchGet } from '../../shared/helpers-HTTP';
import { EcoInOut, EcoInOutForTable } from '../interfaces/EcoInOut';
import useAuthStore from '../../shared/auth/useAuthStore';
import { dateToString, hrDateToString } from '../../shared/helpers';


const API = import.meta.env.VITE_SUGO_BackTS


const convertDate = (date) => {
    const d = new Date(date)
    const fecha = dateToString(d)
    const hr = hrDateToString(d)
    // return `${hr}`
    return `${fecha} ${hr}`     //^? dejar fecha o solo hora
}

interface ProviderValues {
    ecosDespachados:    UseQueryResult<EcoInOutForTable[], unknown>;
    ecosRecepcionados:  UseQueryResult<EcoInOut[], unknown>;
    mod:                number;
    setMod:             React.Dispatch<React.SetStateAction<number>>;
}


export const EcosDespachoRecepcionContext = createContext( {} as ProviderValues );


export const EcosDespachoRecepcionProvider = ( { children }: any ) => {

    const { modulo } = useAuthStore( store => store.user );
    const [mod, setMod] = useState( (modulo==0) ? 1 : modulo!  );

    // ToDo: Sacar peticiones a contexto
    //& Peticion 1 de ecos despachados
    const D = useQuery<EcoInOutForTable[]>(
        'ecosDespachados', 
        () => {
            return UseFetchGet(`${API}/api/caseta/ecosBitacora?despachos_abiertos=1&modulo=${mod}`)
        }, 
        {
            //? Modificar la data antes de setear al estado
            select: (res) => res.map( res => ({
                ...res, 
                modulo_id:   res.modulo_id,
                modulo_time: convertDate(res.modulo_time),
            }) ),
        }
    )

    //& Peticion 2 de ecos recepcionados
    const R = useQuery<EcoInOut[]>(
        'ecosRecepcionados', 
        () => {
            const hrBase = new Date();
            hrBase.setHours( 3,0 )
            const now = new Date()
            if(now < hrBase) now.setDate( now.getDate() - 1 )
            const fechaHoy = dateToString(now, true);
            return UseFetchGet(`${API}/api/caseta/ecosBitacora?fecha_ini=${fechaHoy}&solo_recepciones=1&modulo=${mod}&complemento=1`)
        },
        {
            //? Modificar la data antes de setear al estado
            select: (res) => res.map( r => ({
                ...r, 
                tipo:           'RECEPCION' as any,
                modulo_id:      r.modulo_id,
                modulo_time:    convertDate(r.modulo_time),

                tipo2:          'DESPACHO',
                modulo_id2:     (r.complemento?.modulo_id!<5) ? r.complemento?.modulo_id! : (r.complemento?.modulo_id!)-1,
                eco2:           r.complemento?.eco,
                op_cred2:       r.complemento?.op_cred,
                modulo_time2:   convertDate(r.complemento?.modulo_time),
                turno2:         r.complemento?.turno,
                extintor2:      r.complemento?.extintor,
                ruta_swap2:     r.complemento?.ruta_swap,
                ruta_modalidad2:r.complemento?.ruta_modalidad,
                ruta_cc2:       r.complemento?.ruta_cc,
                motivo2:        r.complemento?.motivo,
                motivo_desc2:   r.complemento?.motivo_desc,
            }) ),
        }  
    )

    useEffect(() => {
        D.refetch(); 
        R.refetch()
    }, [mod])


    return (
        <EcosDespachoRecepcionContext.Provider value={{
            ecosDespachados: D,
            ecosRecepcionados: R,
            mod, setMod
        }} >
            {children}
        </EcosDespachoRecepcionContext.Provider>
    )
}
