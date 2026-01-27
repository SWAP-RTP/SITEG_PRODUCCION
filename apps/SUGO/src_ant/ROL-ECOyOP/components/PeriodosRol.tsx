import React, { useEffect, useState } from 'react'
import { removeHTMLelements } from '../../shared/helpers/forHTML';
import { useQuery } from 'react-query';
import { UseFetchGet } from '../../shared/helpers-HTTP';
import { ColsProps, TablaCRUD } from '../../shared/components/Tabla';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';



interface Periodos {
    id:             number,
    fecha_inicio:   string,  // Date,
    fecha_fin:      string,  // Date,
    serial:         number,
    createdAt:      string,  // Date,
    updatedAt:      string,  // Date
}

const API = import.meta.env.VITE_SUGO_BackTS


const COLS: ColsProps[] = [
    { field: 'id',           header: 'ID',      filter: true, align: 'center', style:{maxWidth: '5rem'} },
    { field: 'aho',          header: 'Año',     filter: true, align: 'center', style:{maxWidth: '7rem'} },
    { field: 'serial',       header: 'Serial',  filter: !true, align: 'center', style:{maxWidth: '3rem'} },
    { field: 'fecha_inicio', header: 'Inicio',  filter: !true, align: 'center', style:{} },
    { field: 'fecha_fin',    header: 'Fin',     filter: !true, align: 'center', style:{} },
]


export const PeriodosRol = ({
    inDialog=false
}) => {
    const [visible, setVisible] = useState(false);

    // get Periodos
    const {
        data
    } = useQuery<Periodos[], any, (Periodos&{aho: string})[]>( 'periodos-all', 
        () => UseFetchGet(`${API}/api/periodos`),
        {
            select(data) {
                return data.map( (d, i) => ({
                    ...d,
                    aho: d.fecha_inicio.split('-')[0]
                }))
            },
            onSuccess(data) {
                console.log(data);
            },
            enabled: !inDialog || visible,
            refetchInterval: false,
            staleTime: Infinity,
        }
    )

    useEffect(() => {
        setTimeout(() => {
            visible && removeHTMLelements('#dialog-periodos', '.p-column-filter-clear-button')
        }, 200);
    }, [visible])
    


    if(!inDialog) return  <>
        <h2>Periodos</h2>
        <TablaCRUD 
            data={data} 
            cols={COLS} 
            className='max-w-30rem mx-auto my-2 '
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
            label="Periodos" 
            // icon="pi pi-external-link" 
            severity='info'
            onClick={() => setVisible(true)} 
        /> 

        {/* Es un elemento flotante y oculto al inicio */}
        <Dialog id='dialog-periodos' modal maximizable  position='right' visible={visible} header='Periodos' onHide={() => setVisible(false)} style={{ minWidth: '50rem', width: '50vw', height: '60vh' }} pt={{ footer: { className: 'p-2' }}}>
            <TablaCRUD 
                data={data} 
                cols={COLS} 
                className='max-w-30rem mx-auto my-2 '
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