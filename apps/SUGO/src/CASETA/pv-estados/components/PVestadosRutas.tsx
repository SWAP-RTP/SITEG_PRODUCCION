import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ColsProps, TablaCRUD } from '../../../shared/components/Tabla';
import { UseFetchGet } from '../../../shared/helpers-HTTP';
import { removeHTMLelements } from '../../../shared/helpers/forHTML';



interface Props {
    inDialog?: boolean
}
interface RutasSwap {
    ruta_id:     number;
    nombre:      string;
    modalidad:   string;
    cc_ori:      string;
    cc_des:      string;
    cc_ori_name: string;
    cc_des_name: string;
    modulo:      number;
}



const API = import.meta.env.VITE_SUGO_BackTS

const style = { minWidth: '7rem' }
const COLS: ColsProps[] = [
    // { field: 'ruta_id',     header: 'R id',  },
    { field: 'modulo',      header: 'modulo', filter: true, align: 'center', style },
    { field: 'modalidad',   header: 'modalidad', filter: true },
    { field: 'nombre',      header: 'nombre', filter: true, style },
    { field: 'cc_ori',      header: 'cc_ori', filter: true, align: 'center', style },
    { field: 'cc_des',      header: 'cc_des', filter: true, align: 'center', style },
    { field: 'cc_ori_name', header: 'cc_ori_name', filter: true },
    { field: 'cc_des_name', header: 'cc_des_name', filter: true },
];



export const PVestadosRutas = ({
    inDialog=false
}: Props) => {
    const [visible, setVisible] = useState(false);

    // get Motivos
    const { data } = useQuery<RutasSwap[], any, (RutasSwap&{id: string})[]>(
        'rutas-all', 
        () => UseFetchGet(`${API}/api/swap/rutas`),
        {
            select(data) {
                return data.map( (d, i) => ({
                    ...d,
                    id: d.nombre+(i+1)
                }))
            },

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
    if(!inDialog) return  <>
        <h2>Rutas</h2>
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
    </>
    return (
    <>
        <Button 
            label="Rutas" 
            // icon="pi pi-external-link" 
            severity='success'
            onClick={() => setVisible(true)} 
        /> 

        {/* Es un elemento flotante y oculto al inicio */}
        <Dialog id='dialog-rutas' modal maximizable  position='right' visible={visible} header='Rutas' onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}>
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
