import React, { useEffect, useState } from 'react'
import { UseFetchGet } from '../../shared/helpers-HTTP';
import { RutaDBSWAP, RutasDBSUGO } from '../../CASETA/interfaces/Rutas';
import { TablaCRUD } from '../../shared/components/Tabla';


const API = import.meta.env.VITE_SUGO_BackTS
const COLS = [
    { field: 'id', header: '#' },
    { field: 'name', header: 'NOMBRE SWAP' },
    { field: 'oriDes', header: 'Origen-Destino' },
    { field: 'value.modalidad', header: 'MODALIDAD' },
]


export const GetRutas = () => {

    const [rutas, setRutas] = useState<{id, name, value: { nombre, modalidad, modalidadId }}[]>([])

    useEffect(() => {
        UseFetchGet(`${API}/api/rutas`)
        .then( (res: RutasDBSUGO[]) => {
            const OPTS_RUTA = res.map( (obj, i) => ({
                id: i+1,
                name: obj.swap_ruta,
                oriDes: obj.origen_destino,
                value: {
                    nombre: obj.swap_ruta,
                    modalidad: obj.modalidad,
                    modalidadId: obj.modalidad_id
                }
            }));
            console.log('SUGO', OPTS_RUTA);
            setRutas(OPTS_RUTA);
        } )
        .catch( error => { console.error(error); } )
    }, [])
    

    return (
        <TablaCRUD 
            data={rutas} 
            cols={COLS}
            accion={ false }
            className='my-4'
        />
    )
}
