import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { UseFetchGet } from '../../shared/helpers-HTTP';
import { removeHTMLelements } from '../../shared/helpers/forHTML';
import { ColsProps, TablaCRUD } from '../../shared/components/Tabla';


const API = import.meta.env.VITE_SUGO_BackTS



interface RutaSemovi {
    id:             number
    nombre:         string
    swap_ruta:      string
    origen_destino: string
    modalidad_id:   number
    modalidad:      string
    estatus:        number
    createdAt:      Date
    updatedAt:      Date
}

const style = { width: '7rem' }
const COLS: ColsProps[] = [
    // { field: 'ruta_id',     header: 'R id',  },
    // { field: 'modulo',      header: 'modulo', filter: true, align: 'center', style },
    { field: 'nombre',      header: 'SEMOVI nombre', filter: true, style },
    { field: 'modalidad',   header: 'modalidad', filter: true, style:{width: '10rem'} },
    { field: 'swap_ruta',   header: 'RTP nombre', filter: true, style },
    { field: 'origen_destino', header: 'Origen-Destino', filter: true },
];


export const RutasSemovi = () => {
    const [visible, setVisible] = useState(false);

    // get Motivos
    const { data } = useQuery<RutaSemovi[]>(
        'rutas-semovi', 
        () => UseFetchGet(`${API}/api/swap/rutas`),
        {
            refetchInterval: false,
            staleTime: Infinity,
        }
    )

    useEffect(() => {
        setTimeout(() => {
            visible && removeHTMLelements('#dialog-rutas', '.p-column-filter-clear-button')
        }, 200);
    }, [visible])
    


    if(!data) return <>No data</>
    return (
    <>
        <Button 
            label="Rutas SEMOVI" 
            // icon="pi pi-external-link" 
            severity='success'
            onClick={() => setVisible(true)} 
        /> 

        {/* Es un elemento flotante y oculto al inicio */}
        <Dialog id='dialog-rutas' modal maximizable  position='right' visible={visible} header='Rutas SEMOVI' onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}>
            <TablaCRUD 
                data={data} 
                cols={COLS} 
                className='my-2'
                accion={false}
                multiSortMeta={ [{field: 'modulo', order: 1}, {field: 'nombre', order: 1}] }
                dataTableProps={{ 
                    resizableColumns: false 
                }} 
            />
        </Dialog>
    </>
    )
}
