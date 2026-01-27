import React, {createContext, useState, useEffect, useRef} from 'react'
import { Toast } from 'primereact/toast';
import { UseFetchGet } from './helpers-HTTP';
import useAuthStore from './auth/useAuthStore';
import { RutaDBSWAP } from '../CASETA/interfaces/Rutas';
import { ConfirmDialog } from 'primereact/confirmdialog';


const API = import.meta.env.VITE_SUGO_BackTS



const OPTS_MODS = [ 
    { name: 'M01', value: 1},
    { name: 'M02', value: 2},
    { name: 'M03', value: 3},
    { name: 'M04-M', value: 4},
    { name: 'M04-A', value: 8},
    { name: 'M05', value: 5},
    { name: 'M06', value: 6},
    { name: 'M07', value: 7}
]



interface RutasDBSUGO {
    id:             number;
    nombre:         string;
    swap_ruta:      string;
    origen_destino: string;
    modalidad:      string;
    modalidad_id:   number;
}


interface OptsRuta {
    name: string,
    value: {
        nombre: string,
        modalidad: string,
        // modalidadId?
        origen?:   string, 
        destino?:  string
        origen_desc?:   string, 
        destino_desc?:  string
    }
}

interface ProviderValues {
    toast: React.RefObject<Toast>, 
    OPTS_RUTA: OptsRuta[],
    OPTS_MODS: { name: string, value: number}[]
}

export const GeneralContext = createContext({} as ProviderValues);



export const GeneralProvider = ( { children } ) => {

    const { sugo12cas } = useAuthStore( s => s.permisosSUGO )
    const { modulo } = useAuthStore( s => s.user )

    const toast = useRef<Toast>(null); 

    // Rutas - todas las rutas
    // let OPTS_RUTA: { name: string; value: { nombre: string; modalidad: string; modalidadId: number; }; }[] = []
    const [optsRuta, setOptsRuta] = useState<OptsRuta[]>([])
    if( sugo12cas && optsRuta.length === 0 ) {
        /*UseFetchGet(`${API}/api/rutas`)
            .then( (res: RutasDBSUGO[]) => {
                const OPTS_RUTA = res.map( obj => ({
                    name: `${obj.swap_ruta} ${obj.origen_destino}`,
                    value: {
                        nombre: obj.swap_ruta,
                        modalidad: obj.modalidad,
                        modalidadId: obj.modalidad_id
                    }
                }));
                setOptsRuta(OPTS_RUTA);
            } )
        .catch( error => { console.error(error); } ); */

        UseFetchGet(`${API}/api/swap/rutas?rutaTipo=1`)
        .then( (res: RutaDBSWAP[]) => {        // RutasDBSUGO[]
            // console.log('swap', res);
            // Origen || Destino NO incluya modulos diferentes al del usuario
            const rutas = res.filter( R => 
                !(R.cc_ori_name.toUpperCase().includes('MODULO') && !R.cc_ori_name.toUpperCase().includes(`${modulo||1}`) || R.cc_des_name.toUpperCase().includes('MODULO') && !R.cc_des_name.toUpperCase().includes(`${modulo||1}`)  ) 
            )
            const OPTS_SWAP_RUTA = rutas.map( (obj, i) => ({
                id: i+1,
                name: `${obj.nombre} ${obj.cc_ori_name}-${obj.cc_des_name}`,
                value: {
                    nombre: obj.nombre,
                    modalidad: obj.modalidad,
                    origen: obj.cc_ori,
                    destino: obj.cc_des,
                    origen_desc: obj.cc_ori_name,
                    destino_desc: obj.cc_des_name,
                }
            }));
            // console.log('OPTS_SWAP_RUTA', OPTS_SWAP_RUTA);
            setOptsRuta(OPTS_SWAP_RUTA);
        })
        .catch( error => { console.error(error); } )
    }



    return (
        <GeneralContext.Provider value={{
            toast,
            OPTS_RUTA: optsRuta,
            OPTS_MODS
        }} >
            {children}
            <Toast ref={toast} />
            <ConfirmDialog />
        </GeneralContext.Provider>
    )
}